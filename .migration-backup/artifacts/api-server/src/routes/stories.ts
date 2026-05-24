import { Router, type IRouter } from "express";
import { desc, eq, gte } from "drizzle-orm";
import { db, storiesTable, usersTable } from "@workspace/db";
import { CreateStoryBody } from "@workspace/api-zod";
import { serializeUser } from "../lib/serializers";
import { requireUser, getUserId } from "../lib/auth";

const router: IRouter = Router();

router.get("/stories", async (_req, res): Promise<void> => {
  const now = new Date();
  const rows = await db
    .select({ story: storiesTable, user: usersTable })
    .from(storiesTable)
    .innerJoin(usersTable, eq(usersTable.id, storiesTable.userId))
    .where(gte(storiesTable.expiresAt, now))
    .orderBy(desc(storiesTable.createdAt));

  const grouped = new Map<
    number,
    { user: ReturnType<typeof serializeUser>; stories: typeof rows[number]["story"][] }
  >();
  for (const r of rows) {
    if (!grouped.has(r.user.id)) {
      grouped.set(r.user.id, { user: serializeUser(r.user), stories: [] });
    }
    grouped.get(r.user.id)!.stories.push(r.story);
  }
  res.json(
    Array.from(grouped.values()).map((g) => ({
      user: g.user,
      stories: g.stories.map((s) => ({
        id: s.id,
        userId: s.userId,
        content: s.content,
        imageUrl: s.imageUrl,
        videoUrl: s.videoUrl,
        expiresAt: s.expiresAt,
        createdAt: s.createdAt,
      })),
    })),
  );
});

router.post("/stories", requireUser, async (req, res): Promise<void> => {
  const parsed = CreateStoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [row] = await db
    .insert(storiesTable)
    .values({
      userId,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl ?? null,
      videoUrl: parsed.data.videoUrl ?? null,
      expiresAt,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create story" });
    return;
  }
  res.status(201).json({
    id: row.id,
    userId: row.userId,
    content: row.content,
    imageUrl: row.imageUrl,
    videoUrl: row.videoUrl,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  });
});

export default router;
