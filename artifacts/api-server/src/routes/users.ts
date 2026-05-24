import { Router, type IRouter } from "express";
import { eq, ne, asc } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  ListUsersQueryParams,
  GetUserParams,
  UpdateMyProfileBody,
} from "@workspace/api-zod";
import { requireUser, getUserId } from "../lib/auth";
import { serializeUser } from "../lib/serializers";

const router: IRouter = Router();

router.get(
  "/users",
  requireUser,
  async (req, res): Promise<void> => {
    const parsed = ListUsersQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { gender } = parsed.data;
    const rows = await db
      .select()
      .from(usersTable)
      .where(gender ? eq(usersTable.gender, gender) : undefined)
      .orderBy(asc(usersTable.displayName));
    res.json(rows.map(serializeUser));
  },
);

router.patch(
  "/users/me",
  requireUser,
  async (req, res): Promise<void> => {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const parsed = UpdateMyProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const update: Partial<typeof usersTable.$inferInsert> = {};
    if (parsed.data.displayName !== undefined) {
      update.displayName = parsed.data.displayName.trim();
    }
    if (parsed.data.country !== undefined) {
      update.country = parsed.data.country?.trim() || null;
    }
    if (parsed.data.bio !== undefined) {
      update.bio = parsed.data.bio?.trim() || null;
    }
    if (parsed.data.avatarUrl !== undefined) {
      update.avatarUrl = parsed.data.avatarUrl ?? null;
    }
    if (parsed.data.email !== undefined) {
      const newEmail = parsed.data.email.trim().toLowerCase();
      const existing = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, newEmail))
        .limit(1);
      if (existing.length > 0 && existing[0]!.id !== userId) {
        res
          .status(409)
          .json({ error: "Another account is already using this email." });
        return;
      }
      update.email = newEmail;
    }
    if (Object.keys(update).length === 0) {
      const [u] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);
      if (!u) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(serializeUser(u));
      return;
    }
    const [updated] = await db
      .update(usersTable)
      .set(update)
      .where(eq(usersTable.id, userId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(serializeUser(updated));
    void ne;
  },
);

router.get(
  "/users/:id",
  requireUser,
  async (req, res): Promise<void> => {
    const parsed = GetUserParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, parsed.data.id))
      .limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(serializeUser(user));
  },
);

export default router;
