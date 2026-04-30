import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import {
  db,
  usersTable,
  passwordResetsTable,
} from "@workspace/db";
import {
  RegisterBody,
  LoginBody,
  ForgotPasswordBody,
  ResetPasswordBody,
} from "@workspace/api-zod";
import { hashPassword, verifyPassword } from "../lib/auth";
import { serializeUser } from "../lib/serializers";
import { sendEmail, isEmailConfigured } from "../lib/email";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const RESET_CODE_TTL_MINUTES = 30;

function hashResetCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function generateResetCode(): string {
  // 6-digit numeric code, e.g. "048217"
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, displayName, password, gender, country, bio, email } =
    parsed.data;

  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_]+$/.test(normalized)) {
    res.status(400).json({
      error: "Username may only contain lowercase letters, numbers, underscores",
    });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, normalized))
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Username is already taken" });
    return;
  }

  const existingEmail = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);
  if (existingEmail.length > 0) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const { hash, salt } = hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({
      username: normalized,
      displayName,
      email: normalizedEmail,
      gender,
      country: country ?? null,
      bio: bio ?? null,
      passwordHash: hash,
      passwordSalt: salt,
    })
    .returning();

  if (!user) {
    res.status(500).json({ error: "Failed to create account" });
    return;
  }

  req.session.userId = user.id;
  res.status(201).json(serializeUser(user));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const username = parsed.data.username.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  if (!user.isActive) {
    res.status(403).json({ error: "This account has been deactivated." });
    return;
  }
  const ok = verifyPassword(parsed.data.password, user.passwordHash, user.passwordSalt);
  if (!ok) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  req.session.userId = user.id;
  res.json(serializeUser(user));
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.clearCookie("sid");
    res.status(204).end();
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) {
    res.json({ user: null });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (!user) {
    res.json({ user: null });
    return;
  }
  res.json({ user: serializeUser(user) });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);

  // Always respond the same to avoid leaking whether an email is registered.
  const genericResponse = {
    ok: true,
    emailConfigured: isEmailConfigured(),
  };

  if (!user || !user.isActive) {
    res.json(genericResponse);
    return;
  }

  const code = generateResetCode();
  const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60_000);

  await db.insert(passwordResetsTable).values({
    userId: user.id,
    codeHash: hashResetCode(code),
    expiresAt,
  });

  const body =
    `Assalamu alaykum ${user.displayName},\n\n` +
    `Your password reset code for Students of Islamic Law is:\n\n` +
    `    ${code}\n\n` +
    `This code is valid for ${RESET_CODE_TTL_MINUTES} minutes. ` +
    `If you did not request a reset, you may safely ignore this email.\n`;

  const result = await sendEmail({
    to: normalizedEmail,
    subject: "Password reset code",
    text: body,
  });

  if (!result.delivered) {
    logger.info(
      { userId: user.id, code },
      "Password reset code generated (email delivery skipped — see email config)",
    );
  }

  res.json(genericResponse);
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const parsed = ResetPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);
  if (!user) {
    res.status(400).json({ error: "Invalid code or email." });
    return;
  }

  const codeHash = hashResetCode(parsed.data.code.trim());
  const now = new Date();
  const [resetRow] = await db
    .select()
    .from(passwordResetsTable)
    .where(
      and(
        eq(passwordResetsTable.userId, user.id),
        eq(passwordResetsTable.codeHash, codeHash),
        gt(passwordResetsTable.expiresAt, now),
        isNull(passwordResetsTable.consumedAt),
      ),
    )
    .limit(1);

  if (!resetRow) {
    res.status(400).json({ error: "Invalid or expired code." });
    return;
  }

  const { hash, salt } = hashPassword(parsed.data.newPassword);
  await db
    .update(usersTable)
    .set({ passwordHash: hash, passwordSalt: salt })
    .where(eq(usersTable.id, user.id));
  await db
    .update(passwordResetsTable)
    .set({ consumedAt: now })
    .where(eq(passwordResetsTable.id, resetRow.id));

  // Sign the user in after a successful reset
  req.session.userId = user.id;
  res.json({ ok: true });
});

export default router;
