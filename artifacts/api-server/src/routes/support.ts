import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, settingsTable } from "@workspace/db";
import { sendEmail } from "../lib/email";
import { logger } from "../lib/logger";
import { getUserId } from "../lib/auth";

const router: IRouter = Router();

const SUPPORT_EMAIL_KEY = "support_email";

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

function isStr(v: unknown, min = 0, max = 10000): v is string {
  return typeof v === "string" && v.length >= min && v.length <= max;
}

async function getSupportEmail(): Promise<string | null> {
  try {
    const [row] = await db
      .select({ value: settingsTable.value })
      .from(settingsTable)
      .where(eq(settingsTable.key, SUPPORT_EMAIL_KEY))
      .limit(1);
    return row?.value ?? null;
  } catch (err) {
    logger.warn({ err }, "[Support] settingsTable query failed — table may not exist yet");
    return null;
  }
}

async function getMainAdminEmail(): Promise<string | null> {
  try {
    const [admin] = await db
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.isMainAdmin, true))
      .limit(1);
    return admin?.email ?? null;
  } catch (err) {
    logger.warn({ err }, "[Support] usersTable query failed");
    return null;
  }
}

async function getViewer(req: import("express").Request) {
  const userId = getUserId(req);
  if (!userId) return null;
  try {
    const [u] = await db
      .select({ id: usersTable.id, isMainAdmin: usersTable.isMainAdmin, email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    return u ?? null;
  } catch {
    return null;
  }
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

  try {
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
  } catch (err) {
    logger.error({ err }, "[Support] Failed to update support email setting");
    res.status(500).json({ error: "Failed to update support email." });
  }
});

// POST /support/contact — public, send a support message
router.post("/support/contact", async (req, res): Promise<void> => {
  const { username, email, subject, message } = req.body ?? {};
  if (!isStr(username, 1, 80)) { res.status(400).json({ error: "username is required" }); return; }
  if (!isEmail(email)) { res.status(400).json({ error: "A valid email address is required." }); return; }
  if (!isStr(subject, 2, 200)) { res.status(400).json({ error: "subject is required" }); return; }
  if (!isStr(message, 10, 4000)) { res.status(400).json({ error: "message must be at least 10 characters" }); return; }

  console.log(`[Support] Contact form from ${username} (${email}), subject: "${subject}"`);

  // Resolve destination: DB setting → main admin email → SENDGRID_FROM_EMAIL env
  let destination = await getSupportEmail();
  if (!destination) {
    destination = await getMainAdminEmail();
  }
  if (!destination) {
    // Final fallback: send to the configured sender address (admin receives at their own address)
    destination = process.env.SENDGRID_FROM_EMAIL ?? null;
  }

  if (!destination) {
    console.error("[Support] No destination email found — SENDGRID_FROM_EMAIL not set either");
    res.status(503).json({ error: "Support contact is not configured. Please try again later." });
    return;
  }

  console.log(`[Support] Sending to destination: ${destination}`);

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

  console.log(`[Support] Email delivery result:`, result);

  if (!result.delivered) {
    logger.warn({ username, reason: result.reason }, "[Support] Email not delivered");
    // Still return ok so the user knows their message was received,
    // even if email delivery failed (may be queued or configured elsewhere)
  }

  res.json({ ok: true, emailDelivered: result.delivered });
});

// POST /support/admin-message — authenticated, send a direct message to admin (chat-style)
router.post("/support/admin-message", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  let senderInfo: { username: string; email: string } | null = null;

  if (userId) {
    try {
      const [u] = await db
        .select({ username: usersTable.username, email: usersTable.email, displayName: usersTable.displayName })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);
      if (u) {
        senderInfo = { username: u.displayName || u.username, email: u.email };
      }
    } catch (err) {
      logger.warn({ err }, "[Support] Could not look up sender");
    }
  }

  const { message } = req.body ?? {};
  if (!isStr(message, 2, 4000)) {
    res.status(400).json({ error: "Message must be at least 2 characters" });
    return;
  }

  const username = senderInfo?.username ?? (req.body as { username?: string }).username ?? "Anonymous";
  const email = senderInfo?.email ?? (req.body as { email?: string }).email ?? "";

  console.log(`[Support] Admin message from ${username}: "${message.slice(0, 100)}"`);

  let destination = await getSupportEmail();
  if (!destination) destination = await getMainAdminEmail();
  if (!destination) destination = process.env.SENDGRID_FROM_EMAIL ?? null;

  if (destination) {
    const body =
      `Direct support message from the Students of Islamic Law Forum:\n\n` +
      `From: ${username}${email ? ` (${email})` : ""}\n` +
      `User ID: ${userId ?? "not logged in"}\n\n` +
      `Message:\n${message}`;

    const result = await sendEmail({
      to: destination,
      subject: `[Direct Message] ${username}`,
      text: body,
      replyTo: email || undefined,
    });
    console.log(`[Support] Admin message email result:`, result);
  } else {
    console.warn("[Support] No destination configured for admin message");
  }

  res.status(201).json({ ok: true, sentAt: new Date().toISOString() });
});

export default router;
