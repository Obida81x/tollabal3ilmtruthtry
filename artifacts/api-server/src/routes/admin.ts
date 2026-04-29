import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  usersTable,
  postsTable,
  meetingsTable,
} from "@workspace/db";
import {
  AdminLoginBody,
  AdminSetAdminBody,
  AdminSetAdminParams,
  AdminSetActiveBody,
  AdminSetActiveParams,
  AdminDeletePostParams,
  AdminDeleteMeetingParams,
} from "@workspace/api-zod";
import { requireUser, getUserId } from "../lib/auth";
import { serializeUser } from "../lib/serializers";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PANEL_PASSWORD ?? "admin1234";

async function loadCurrentAdmin(req: Parameters<typeof requireUser>[0]) {
  const userId = getUserId(req);
  if (!userId) return null;
  const [u] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (!u || !u.isActive || !u.isAdmin) return null;
  return u;
}

router.post("/admin/login", requireUser, async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Incorrect admin password." });
    return;
  }
  const [u] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (!u || !u.isActive) {
    res.status(403).json({ error: "Account is not active." });
    return;
  }
  if (!u.isAdmin) {
    const [updated] = await db
      .update(usersTable)
      .set({ isAdmin: true })
      .where(eq(usersTable.id, userId))
      .returning();
    res.json(serializeUser(updated ?? u));
    return;
  }
  res.json(serializeUser(u));
});

router.get("/admin/users", requireUser, async (req, res): Promise<void> => {
  const me = await loadCurrentAdmin(req);
  if (!me) {
    res.status(403).json({ error: "Admin access required." });
    return;
  }
  const rows = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));
  res.json(rows.map(serializeUser));
});

router.post(
  "/admin/users/:id/admin",
  requireUser,
  async (req, res): Promise<void> => {
    const me = await loadCurrentAdmin(req);
    if (!me) {
      res.status(403).json({ error: "Admin access required." });
      return;
    }
    if (!me.isMainAdmin) {
      res.status(403).json({
        error: "Only the main administrator can grant or revoke admin role.",
      });
      return;
    }
    const params = AdminSetAdminParams.safeParse(req.params);
    const body = AdminSetAdminBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const targetId = params.data.id;
    if (targetId === me.id) {
      res.status(400).json({ error: "You cannot change your own admin role." });
      return;
    }
    const [target] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, targetId))
      .limit(1);
    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (target.isMainAdmin) {
      res.status(400).json({
        error: "The main administrator's role cannot be changed.",
      });
      return;
    }
    const [updated] = await db
      .update(usersTable)
      .set({ isAdmin: body.data.value })
      .where(eq(usersTable.id, targetId))
      .returning();
    res.json(serializeUser(updated!));
  },
);

router.post(
  "/admin/users/:id/active",
  requireUser,
  async (req, res): Promise<void> => {
    const me = await loadCurrentAdmin(req);
    if (!me) {
      res.status(403).json({ error: "Admin access required." });
      return;
    }
    const params = AdminSetActiveParams.safeParse(req.params);
    const body = AdminSetActiveBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const targetId = params.data.id;
    if (targetId === me.id) {
      res.status(400).json({ error: "You cannot change your own active status." });
      return;
    }
    const [target] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, targetId))
      .limit(1);
    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (target.isMainAdmin) {
      res.status(400).json({
        error: "The main administrator cannot be deactivated.",
      });
      return;
    }
    if (target.isAdmin && !me.isMainAdmin) {
      res.status(403).json({
        error: "Only the main administrator can deactivate another admin.",
      });
      return;
    }
    const [updated] = await db
      .update(usersTable)
      .set({ isActive: body.data.value })
      .where(eq(usersTable.id, targetId))
      .returning();
    res.json(serializeUser(updated!));
  },
);

router.delete(
  "/admin/posts/:id",
  requireUser,
  async (req, res): Promise<void> => {
    const me = await loadCurrentAdmin(req);
    if (!me) {
      res.status(403).json({ error: "Admin access required." });
      return;
    }
    const params = AdminDeletePostParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    await db.delete(postsTable).where(eq(postsTable.id, params.data.id));
    res.status(204).end();
  },
);

router.delete(
  "/admin/meetings/:id",
  requireUser,
  async (req, res): Promise<void> => {
    const me = await loadCurrentAdmin(req);
    if (!me) {
      res.status(403).json({ error: "Admin access required." });
      return;
    }
    const params = AdminDeleteMeetingParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    await db.delete(meetingsTable).where(eq(meetingsTable.id, params.data.id));
    res.status(204).end();
  },
);

export default router;
