import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { hashPassword, verifyPassword } from "../lib/auth";
import { serializeUser } from "../lib/serializers";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, displayName, password, gender, country, bio } = parsed.data;

  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_]+$/.test(normalized)) {
    res.status(400).json({
      error: "Username may only contain lowercase letters, numbers, underscores",
    });
    return;
  }

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, normalized))
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Username is already taken" });
    return;
  }

  const { hash, salt } = hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({
      username: normalized,
      displayName,
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

export default router;
