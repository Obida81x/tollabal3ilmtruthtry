import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  db,
  usersTable,
  fatawaTable,
  fatwaNotificationsTable,
  muftiAssignmentsTable,
} from "@workspace/db";
import { requireUser, getUserId } from "../lib/auth";
import { serializeUser } from "../lib/serializers";

const router: IRouter = Router();

function serializeFatwa(
  f: typeof fatawaTable.$inferSelect,
  askerName: string | null,
) {
  return {
    id: f.id,
    userId: f.userId,
    muftiId: f.muftiId,
    questionText: f.questionText,
    category: f.category,
    isAnonymous: f.isAnonymous,
    answerText: f.answerText,
    answerAudioUrl: f.answerAudioUrl,
    status: f.status,
    askerName,
    createdAt: f.createdAt,
    answeredAt: f.answeredAt,
  };
}

async function getActiveMufti(): Promise<number | null> {
  const [a] = await db
    .select({ userId: muftiAssignmentsTable.userId })
    .from(muftiAssignmentsTable)
    .where(eq(muftiAssignmentsTable.isActive, true))
    .limit(1);
  return a?.userId ?? null;
}

// GET /fatawa – list (user sees own; mufti/admin sees pending + all)
router.get("/fatawa", requireUser, async (req, res): Promise<void> => {
  const userId = getUserId(req)!;
  const [viewer] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const isMuftiOrAdmin = viewer.isMufti || viewer.isAdmin;

  const rows = await db
    .select()
    .from(fatawaTable)
    .where(isMuftiOrAdmin ? undefined : eq(fatawaTable.userId, userId))
    .orderBy(desc(fatawaTable.createdAt))
    .limit(200);

  const result = await Promise.all(
    rows.map(async (f) => {
      let askerName: string | null = null;
      if (isMuftiOrAdmin && !f.isAnonymous) {
        const [u] = await db
          .select({ displayName: usersTable.displayName })
          .from(usersTable)
          .where(eq(usersTable.id, f.userId))
          .limit(1);
        askerName = u?.displayName ?? null;
      }
      return serializeFatwa(f, askerName);
    }),
  );
  res.json(result);
});

// POST /fatawa – create question
router.post("/fatawa", requireUser, async (req, res): Promise<void> => {
  const userId = getUserId(req)!;
  const { questionText, category, isAnonymous } = req.body as {
    questionText?: string;
    category?: string;
    isAnonymous?: boolean;
  };

  if (!questionText || questionText.trim().length < 10) {
    res.status(400).json({ error: "Question must be at least 10 characters" });
    return;
  }
  if (!category || category.trim().length < 2) {
    res.status(400).json({ error: "Category is required" });
    return;
  }

  const muftiId = await getActiveMufti();

  const [fatwa] = await db
    .insert(fatawaTable)
    .values({
      userId,
      muftiId,
      questionText: questionText.trim(),
      category: category.trim(),
      isAnonymous: !!isAnonymous,
      status: "pending",
    })
    .returning();

  if (!fatwa) {
    res.status(500).json({ error: "Failed to submit question" });
    return;
  }

  // Notify all muftis
  if (muftiId) {
    await db.insert(fatwaNotificationsTable).values({
      userId: muftiId,
      fatwaId: fatwa.id,
      type: "question_received",
    });
  }

  res.status(201).json(serializeFatwa(fatwa, null));
});

// GET /fatawa/public – published fatawa (no auth needed)
router.get("/fatawa/public", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(fatawaTable)
    .where(eq(fatawaTable.status, "published"))
    .orderBy(desc(fatawaTable.createdAt))
    .limit(200);

  const result = rows.map((f) => ({
    id: f.id,
    questionText: f.questionText,
    category: f.category,
    answerText: f.answerText,
    answerAudioUrl: f.answerAudioUrl,
    status: f.status,
    createdAt: f.createdAt,
    answeredAt: f.answeredAt,
  }));
  res.json(result);
});

// GET /fatawa/notifications
router.get(
  "/fatawa/notifications",
  requireUser,
  async (req, res): Promise<void> => {
    const userId = getUserId(req)!;
    const rows = await db
      .select()
      .from(fatwaNotificationsTable)
      .where(
        and(
          eq(fatwaNotificationsTable.userId, userId),
          eq(fatwaNotificationsTable.isRead, false),
        ),
      )
      .orderBy(desc(fatwaNotificationsTable.createdAt))
      .limit(50);
    res.json(rows);
  },
);

// POST /fatawa/notifications/read
router.post(
  "/fatawa/notifications/read",
  requireUser,
  async (req, res): Promise<void> => {
    const userId = getUserId(req)!;
    await db
      .update(fatwaNotificationsTable)
      .set({ isRead: true })
      .where(
        and(
          eq(fatwaNotificationsTable.userId, userId),
          eq(fatwaNotificationsTable.isRead, false),
        ),
      );
    res.json({ ok: true });
  },
);

// GET /fatawa/:id
router.get("/fatawa/:id", requireUser, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const userId = getUserId(req)!;
  const [viewer] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  const [fatwa] = await db
    .select()
    .from(fatawaTable)
    .where(eq(fatawaTable.id, id))
    .limit(1);
  if (!fatwa) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const isMuftiOrAdmin = viewer?.isMufti || viewer?.isAdmin;
  if (!isMuftiOrAdmin && fatwa.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  let askerName: string | null = null;
  if (isMuftiOrAdmin && !fatwa.isAnonymous) {
    const [u] = await db
      .select({ displayName: usersTable.displayName })
      .from(usersTable)
      .where(eq(usersTable.id, fatwa.userId))
      .limit(1);
    askerName = u?.displayName ?? null;
  }
  res.json(serializeFatwa(fatwa, askerName));
});

// POST /fatawa/:id/answer – mufti answers
router.post(
  "/fatawa/:id/answer",
  requireUser,
  async (req, res): Promise<void> => {
    const id = Number(req.params.id);
    const userId = getUserId(req)!;
    const [viewer] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (!viewer?.isMufti && !viewer?.isAdmin) {
      res.status(403).json({ error: "Muftis only" });
      return;
    }
    const [fatwa] = await db
      .select()
      .from(fatawaTable)
      .where(eq(fatawaTable.id, id))
      .limit(1);
    if (!fatwa) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const { answerText, answerAudioUrl } = req.body as {
      answerText?: string | null;
      answerAudioUrl?: string | null;
    };
    if (!answerText?.trim() && !answerAudioUrl) {
      res.status(400).json({ error: "Answer text or audio required" });
      return;
    }
    const [updated] = await db
      .update(fatawaTable)
      .set({
        muftiId: userId,
        answerText: answerText?.trim() ?? null,
        answerAudioUrl: answerAudioUrl ?? null,
        status: "answered",
        answeredAt: new Date(),
      })
      .where(eq(fatawaTable.id, id))
      .returning();
    // Notify questioner
    if (updated) {
      await db.insert(fatwaNotificationsTable).values({
        userId: updated.userId,
        fatwaId: updated.id,
        type: "answer_ready",
      });
    }
    res.json(serializeFatwa(updated!, null));
  },
);

// POST /fatawa/:id/publish – questioner publishes
router.post(
  "/fatawa/:id/publish",
  requireUser,
  async (req, res): Promise<void> => {
    const id = Number(req.params.id);
    const userId = getUserId(req)!;
    const [fatwa] = await db
      .select()
      .from(fatawaTable)
      .where(eq(fatawaTable.id, id))
      .limit(1);
    if (!fatwa) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (fatwa.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (fatwa.status !== "answered") {
      res.status(400).json({ error: "Can only publish answered fatawa" });
      return;
    }
    const [updated] = await db
      .update(fatawaTable)
      .set({ status: "published" })
      .where(eq(fatawaTable.id, id))
      .returning();
    res.json(serializeFatwa(updated!, null));
  },
);

export default router;
