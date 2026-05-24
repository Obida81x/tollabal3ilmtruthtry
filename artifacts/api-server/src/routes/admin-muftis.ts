import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  usersTable,
  muftiAssignmentsTable,
  fatawaTable,
} from "@workspace/db";
import { requireUser, getUserId } from "../lib/auth";
import { serializeUser } from "../lib/serializers";

const router: IRouter = Router();

async function requireAdmin(
  req: import("express").Request,
  res: import("express").Response,
): Promise<typeof usersTable.$inferSelect | null> {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (!user?.isAdmin && !user?.isMainAdmin) {
    res.status(403).json({ error: "Admins only" });
    return null;
  }
  return user;
}

// GET /admin/muftis
router.get(
  "/admin/muftis",
  requireUser,
  async (req, res): Promise<void> => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const rows = await db
      .select()
      .from(muftiAssignmentsTable)
      .innerJoin(
        usersTable,
        eq(usersTable.id, muftiAssignmentsTable.userId),
      )
      .where(eq(muftiAssignmentsTable.isActive, true));

    res.json(
      rows.map((r) => ({
        id: r.mufti_assignments.id,
        userId: r.mufti_assignments.userId,
        assignedBy: r.mufti_assignments.assignedBy,
        assignedAt: r.mufti_assignments.assignedAt,
        isActive: r.mufti_assignments.isActive,
        user: serializeUser(r.users),
      })),
    );
  },
);

// POST /admin/muftis
router.post(
  "/admin/muftis",
  requireUser,
  async (req, res): Promise<void> => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const { userId } = req.body as { userId?: number };
    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (!user.isAdmin && !user.isMainAdmin) {
      res.status(400).json({ error: "User must be an admin or moderator first" });
      return;
    }

    // Upsert
    const existing = await db
      .select()
      .from(muftiAssignmentsTable)
      .where(eq(muftiAssignmentsTable.userId, userId))
      .limit(1);

    let assignment;
    if (existing.length > 0) {
      [assignment] = await db
        .update(muftiAssignmentsTable)
        .set({ isActive: true, assignedBy: admin.id, assignedAt: new Date() })
        .where(eq(muftiAssignmentsTable.userId, userId))
        .returning();
    } else {
      [assignment] = await db
        .insert(muftiAssignmentsTable)
        .values({ userId, assignedBy: admin.id })
        .returning();
    }

    // Set isMufti flag on user
    await db
      .update(usersTable)
      .set({ isMufti: true })
      .where(eq(usersTable.id, userId));

    const [updated] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    res.status(201).json({
      id: assignment!.id,
      userId: assignment!.userId,
      assignedBy: assignment!.assignedBy,
      assignedAt: assignment!.assignedAt,
      isActive: assignment!.isActive,
      user: updated ? serializeUser(updated) : null,
    });
  },
);

// DELETE /admin/muftis/:userId
router.delete(
  "/admin/muftis/:userId",
  requireUser,
  async (req, res): Promise<void> => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const userId = Number(req.params.userId);
    if (!userId) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    await db
      .update(muftiAssignmentsTable)
      .set({ isActive: false })
      .where(eq(muftiAssignmentsTable.userId, userId));

    await db
      .update(usersTable)
      .set({ isMufti: false })
      .where(eq(usersTable.id, userId));

    res.status(204).end();
  },
);

// GET /admin/fatawa
router.get(
  "/admin/fatawa",
  requireUser,
  async (req, res): Promise<void> => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const rows = await db
      .select()
      .from(fatawaTable)
      .orderBy(fatawaTable.createdAt)
      .limit(500);

    res.json(
      rows.map((f) => ({
        id: f.id,
        userId: f.userId,
        muftiId: f.muftiId,
        questionText: f.questionText,
        category: f.category,
        isAnonymous: f.isAnonymous,
        answerText: f.answerText,
        answerAudioUrl: f.answerAudioUrl,
        status: f.status,
        askerName: null,
        createdAt: f.createdAt,
        answeredAt: f.answeredAt,
      })),
    );
  },
);

export default router;
