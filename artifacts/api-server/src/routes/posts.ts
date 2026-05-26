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
  postCommentsTable,
  usersTable,
} from "@workspace/db";
import {
  CreatePostBody,
  TogglePostLikeParams,
  GetPostParams,
  ListPostCommentsParams,
  CreatePostCommentParams,
  CreatePostCommentBody,
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
      audioUrl: r.post.audioUrl,
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

router.get("/posts/:id", async (req, res): Promise<void> => {
  const parsed = GetPostParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [post] = await fetchPostsWithMeta([parsed.data.id], getUserId(req));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(post);
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
  const audioUrl = (parsed.data as Record<string, unknown>).audioUrl as string | null ?? null;
  if (audioUrl) {
    const [poster] = await db
      .select({ gender: usersTable.gender })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (poster?.gender !== "male") {
      res.status(403).json({ error: "Audio posts are for brothers only" });
      return;
    }
  }
  const [post] = await db
    .insert(postsTable)
    .values({
      userId,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl ?? null,
      videoUrl: parsed.data.videoUrl ?? null,
      audioUrl,
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

router.get("/posts/:id/comments", async (req, res): Promise<void> => {
  const parsed = ListPostCommentsParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const comments = await db
    .select({
      comment: postCommentsTable,
      author: usersTable,
    })
    .from(postCommentsTable)
    .innerJoin(usersTable, eq(usersTable.id, postCommentsTable.userId))
    .where(eq(postCommentsTable.postId, parsed.data.id))
    .orderBy(postCommentsTable.createdAt);

  res.json(
    comments.map((r) => ({
      id: r.comment.id,
      postId: r.comment.postId,
      userId: r.comment.userId,
      author: serializeUser(r.author),
      content: r.comment.content,
      createdAt: r.comment.createdAt,
    })),
  );
});

router.post(
  "/posts/:id/comments",
  requireUser,
  async (req, res): Promise<void> => {
    const paramsParsed = CreatePostCommentParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: paramsParsed.error.message });
      return;
    }
    const bodyParsed = CreatePostCommentBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: bodyParsed.error.message });
      return;
    }
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const postId = paramsParsed.data.id;
    const [exists] = await db
      .select({ id: postsTable.id })
      .from(postsTable)
      .where(eq(postsTable.id, postId))
      .limit(1);
    if (!exists) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const [comment] = await db
      .insert(postCommentsTable)
      .values({ postId, userId, content: bodyParsed.data.content })
      .returning();
    if (!comment) {
      res.status(500).json({ error: "Failed to create comment" });
      return;
    }

    const [author] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    res.status(201).json({
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      author: serializeUser(author!),
      content: comment.content,
      createdAt: comment.createdAt,
    });
  },
);

export default router;
