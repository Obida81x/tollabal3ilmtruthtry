import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, usersTable, adminApplicationsTable } from "@workspace/db";
import { sendEmail } from "../lib/email";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

function isStr(v: unknown, min = 0, max = 10000): v is string {
  return typeof v === "string" && v.length >= min && v.length <= max;
}

async function getViewer(req: import("express").Request) {
  const userId = req.session.userId;
  if (!userId) return null;
  const [u] = await db
    .select({ id: usersTable.id, isAdmin: usersTable.isAdmin, isMainAdmin: usersTable.isMainAdmin, email: usersTable.email, displayName: usersTable.displayName, isActive: usersTable.isActive })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return u ?? null;
}

// POST /admin-applications — any authenticated active user may apply
router.post("/admin-applications", async (req, res): Promise<void> => {
  const viewer = await getViewer(req);
  if (!viewer || !viewer.isActive) {
    res.status(401).json({ error: "Login required" });
    return;
  }

  const { fullName, age, contactEmail, notes, reasons } = req.body ?? {};
  if (!isStr(fullName, 2, 120)) { res.status(400).json({ error: "fullName must be 2–120 characters" }); return; }
  if (typeof age !== "number" || !Number.isInteger(age) || age < 14 || age > 120) { res.status(400).json({ error: "age must be an integer between 14 and 120" }); return; }
  if (!isEmail(contactEmail)) { res.status(400).json({ error: "contactEmail must be a valid email" }); return; }
  if (!isStr(reasons, 10, 3000)) { res.status(400).json({ error: "reasons must be 10–3000 characters" }); return; }
  if (notes !== undefined && notes !== null && !isStr(notes, 0, 2000)) { res.status(400).json({ error: "notes must be at most 2000 characters" }); return; }

  // Check for existing pending application
  const existing = await db
    .select({ id: adminApplicationsTable.id })
    .from(adminApplicationsTable)
    .where(and(eq(adminApplicationsTable.userId, viewer.id), eq(adminApplicationsTable.status, "pending")))
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "You already have a pending application." });
    return;
  }

  const [app] = await db
    .insert(adminApplicationsTable)
    .values({
      userId: viewer.id,
      fullName,
      age,
      contactEmail,
      notes: notes ?? null,
      reasons,
      status: "pending",
    })
    .returning();

  // Notify the main admin by email
  const [mainAdmin] = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.isMainAdmin, true))
    .limit(1);

  if (mainAdmin?.email) {
    const emailBody =
      `New admin application received from ${viewer.displayName} (${viewer.email}):\n\n` +
      `Full Name: ${fullName}\n` +
      `Age: ${age}\n` +
      `Contact Email: ${contactEmail}\n` +
      `Reasons: ${reasons}\n` +
      (notes ? `Notes: ${notes}\n` : "") +
      `\nReview in the admin panel under Applications.`;

    await sendEmail({
      to: mainAdmin.email,
      subject: "New Admin Application",
      text: emailBody,
    });
  }

  res.status(201).json({ ok: true, id: app?.id });
});

// GET /admin-applications — main admin only
router.get("/admin-applications", async (req, res): Promise<void> => {
  const viewer = await getViewer(req);
  if (!viewer?.isMainAdmin) {
    res.status(403).json({ error: "Main admin access required" });
    return;
  }

  const rows = await db
    .select({
      id: adminApplicationsTable.id,
      userId: adminApplicationsTable.userId,
      fullName: adminApplicationsTable.fullName,
      age: adminApplicationsTable.age,
      contactEmail: adminApplicationsTable.contactEmail,
      notes: adminApplicationsTable.notes,
      reasons: adminApplicationsTable.reasons,
      status: adminApplicationsTable.status,
      reviewedAt: adminApplicationsTable.reviewedAt,
      createdAt: adminApplicationsTable.createdAt,
      username: usersTable.username,
      displayName: usersTable.displayName,
      gender: usersTable.gender,
    })
    .from(adminApplicationsTable)
    .leftJoin(usersTable, eq(adminApplicationsTable.userId, usersTable.id))
    .orderBy(desc(adminApplicationsTable.createdAt));

  res.json(rows);
});

// PATCH /admin-applications/:id — main admin approves or rejects
router.patch("/admin-applications/:id", async (req, res): Promise<void> => {
  const viewer = await getViewer(req);
  if (!viewer?.isMainAdmin) {
    res.status(403).json({ error: "Main admin access required" });
    return;
  }

  const appId = Number(req.params.id);
  if (!appId) { res.status(400).json({ error: "Invalid id" }); return; }

  const { status, message } = req.body ?? {};
  if (status !== "approved" && status !== "rejected") { res.status(400).json({ error: "status must be 'approved' or 'rejected'" }); return; }
  if (message !== undefined && message !== null && !isStr(message, 0, 1000)) { res.status(400).json({ error: "message must be at most 1000 characters" }); return; }

  const [app] = await db
    .select()
    .from(adminApplicationsTable)
    .where(eq(adminApplicationsTable.id, appId))
    .limit(1);
  if (!app) { res.status(404).json({ error: "Application not found" }); return; }
  if (app.status !== "pending") { res.status(409).json({ error: "Application already reviewed" }); return; }

  const now = new Date();
  await db
    .update(adminApplicationsTable)
    .set({ status, reviewedById: viewer.id, reviewedAt: now })
    .where(eq(adminApplicationsTable.id, appId));

  // If approved, grant admin role
  if (status === "approved") {
    await db
      .update(usersTable)
      .set({ isAdmin: true })
      .where(eq(usersTable.id, app.userId));
  }

  // Send email notification to applicant
  const emailBody =
    status === "approved"
      ? `Assalamu alaykum ${app.fullName},\n\nYour application to become an administrator has been approved. You now have admin access on the Students of Islamic Law Forum.\n\n${message ? `Message from admin: ${message}\n\n` : ""}Jazakumullahu khayran.`
      : `Assalamu alaykum ${app.fullName},\n\nThank you for applying to become an administrator on the Students of Islamic Law Forum. After review, we are unable to approve your application at this time.\n\n${message ? `Message from admin: ${message}\n\n` : ""}Jazakumullahu khayran for your interest.`;

  const result = await sendEmail({
    to: app.contactEmail,
    subject: status === "approved" ? "Application Approved – Admin Access Granted" : "Application Update",
    text: emailBody,
  });

  if (!result.delivered) {
    logger.info({ appId, status }, "Application reviewed (email delivery skipped)");
  }

  res.json({ ok: true });
});

export default router;
