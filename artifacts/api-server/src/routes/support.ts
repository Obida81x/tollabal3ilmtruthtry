import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, settingsTable } from "@workspace/db";
import { sendEmail } from "../lib/email";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SUPPORT_EMAIL_KEY = "support_email";

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

function isStr(v: unknown, min = 0, max = 10000): v is string {
  return typeof v === "string" && v.length >= min && v.length <= max;
}

async function getSupportEmail(): Promise<string | null> {
  const [row] = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.key, SUPPORT_EMAIL_KEY))
    .limit(1);
  return row?.value ?? null;
}

async function getViewer(req: import("express").Request) {
  const userId = req.session.userId;
  if (!userId) return null;
  const [u] = await db
    .select({ id: usersTable.id, isMainAdmin: usersTable.isMainAdmin, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return u ?? null;
}

// GET /support/contact-email — public, returns the configured support email
router.get("/support/contact-email", async (_req, res): Promise<void> => {
  const email = await getSupportEmail();
  res.json({ email });
});

// PATCH /support/contact-email — main admin only
router.patch("/support/contact-email", async (req, res): Promise<void> => {
  const viewer = await getViewer(req);
  if (!viewer?.isMainAdmin) {
    res.status(403).json({ error: "Main admin access required" });
    return;
  }

  const { email } = req.body ?? {};
  if (!isEmail(email)) { res.status(400).json({ error: "A valid email address is required." }); return; }

  const existing = await db
    .select({ id: settingsTable.id })
    .from(settingsTable)
    .where(eq(settingsTable.key, SUPPORT_EMAIL_KEY))
    .limit(1);

  if (existing.length > 0) {
    await db.update(settingsTable).set({ value: email, updatedAt: new Date() }).where(eq(settingsTable.key, SUPPORT_EMAIL_KEY));
  } else {
    await db.insert(settingsTable).values({ key: SUPPORT_EMAIL_KEY, value: email });
  }

  res.json({ ok: true });
});

// POST /support/contact — public, send a support message
router.post("/support/contact", async (req, res): Promise<void> => {
  const { username, email, subject, message } = req.body ?? {};
  if (!isStr(username, 1, 80)) { res.status(400).json({ error: "username is required" }); return; }
  if (!isEmail(email)) { res.status(400).json({ error: "A valid email address is required." }); return; }
  if (!isStr(subject, 2, 200)) { res.status(400).json({ error: "subject is required" }); return; }
  if (!isStr(message, 10, 4000)) { res.status(400).json({ error: "message must be at least 10 characters" }); return; }

  let destination = await getSupportEmail();
  if (!destination) {
    const [admin] = await db
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.isMainAdmin, true))
      .limit(1);
    destination = admin?.email ?? null;
  }

  if (!destination) {
    res.status(503).json({ error: "Support contact is not configured. Please try again later." });
    return;
  }

  const body =
    `Support request from the Students of Islamic Law Forum:\n\n` +
    `Username: ${username}\n` +
    `Email: ${email}\n` +
    `Subject: ${subject}\n\n` +
    `Message:\n${message}`;

  const result = await sendEmail({
    to: destination,
    subject: `[Support] ${subject}`,
    text: body,
    replyTo: email,
  });

  if (!result.delivered) {
    logger.info({ username }, "Support contact submitted (email delivery skipped)");
  }

  res.json({ ok: true });
});

export default router;
