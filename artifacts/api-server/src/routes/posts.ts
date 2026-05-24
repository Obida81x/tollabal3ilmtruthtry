import { Router, type IRouter } from "express";
import { desc, eq, sql, and, type SQLWrapper } from "drizzle-orm";

function inIds(col: SQLWrapper, ids: number[]) {
  if (ids.length === 0) return sql`false`;
  return sql`${col} in (${sql.join(
    ids.map((id) => sql`${id}`),
    sql`, `,
  )})`;
}
import {
  db,
  postsTable,
  postLikesTable,
  usersTable,
} from "@workspace/db";
import {
  CreatePostBody,
  TogglePostLikeParams,
} from "@workspace/api-zod";
import { serializeUser } from "../lib/serializers";
import { requireUser, getUserId } from "../lib/auth";

const router: IRouter = Router();

async function fetchPostsWithMeta(postIds: number[], viewerId: number | null) {
  if (postIds.length === 0) return [];
  const rows = await db
    .select({
      post: postsTable,
      author: usersTable,
    })
    .from(postsTable)
    .innerJoin(usersTable, eq(usersTable.id, postsTable.userId))
    .where(inIds(postsTable.id, postIds));

  const counts = await db
    .select({
      postId: postLikesTable.postId,
      count: sql<number>`count(*)::int`,
    })
    .from(postLikesTable)
    .where(inIds(postLikesTable.postId, postIds))
    .groupBy(postLikesTable.postId);
  const countMap = new Map(counts.map((c) => [c.postId, c.count]));

  const likedSet = new Set<number>();
  if (viewerId != null) {
    const liked = await db
      .select({ postId: postLikesTable.postId })
      .from(postLikesTable)
      .where(
        and(
          inIds(postLikesTable.postId, postIds),
          eq(postLikesTable.userId, viewerId),
        ),
      );
    for (const l of liked) likedSet.add(l.postId);
  }

  const orderMap = new Map(postIds.map((id, idx) => [id, idx]));
  return rows
    .sort(
      (a, b) =>
        (orderMap.get(a.post.id) ?? 0) - (orderMap.get(b.post.id) ?? 0),
    )
    .map((r) => ({
      id: r.post.id,
      userId: r.post.userId,
      author: serializeUser(r.author),
      content: r.post.content,
      imageUrl: r.post.imageUrl,
      videoUrl: r.post.videoUrl,
      likeCount: countMap.get(r.post.id) ?? 0,
      likedByMe: likedSet.has(r.post.id),
      createdAt: r.post.createdAt,
    }));
}

router.get("/posts", async (req, res): Promise<void> => {
  const ids = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .orderBy(desc(postsTable.createdAt))
    .limit(100);
  const result = await fetchPostsWithMeta(
    ids.map((i) => i.id),
    getUserId(req),
  );
  res.json(result);
});

router.post("/posts", requireUser, async (req, res): Promise<void> => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const [post] = await db
    .insert(postsTable)
    .values({
      userId,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl ?? null,
      videoUrl: parsed.data.videoUrl ?? null,
    })
    .returning();
  if (!post) {
    res.status(500).json({ error: "Failed to create post" });
    return;
  }
  const [full] = await fetchPostsWithMeta([post.id], userId);
  res.status(201).json(full);
});

router.post(
  "/posts/:id/like",
  requireUser,
  async (req, res): Promise<void> => {
    const parsed = TogglePostLikeParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const existing = await db
      .select()
      .from(postLikesTable)
      .where(
        and(
          eq(postLikesTable.postId, parsed.data.id),
          eq(postLikesTable.userId, userId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(postLikesTable)
        .where(
          and(
            eq(postLikesTable.postId, parsed.data.id),
            eq(postLikesTable.userId, userId),
          ),
        );
    } else {
      await db
        .insert(postLikesTable)
        .values({ postId: parsed.data.id, userId });
    }

    const [full] = await fetchPostsWithMeta([parsed.data.id], userId);
    if (!full) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(full);
  },
);

export default router;
