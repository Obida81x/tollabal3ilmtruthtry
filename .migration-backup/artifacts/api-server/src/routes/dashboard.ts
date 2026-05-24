import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import {
  db,
  postsTable,
  usersTable,
  booksTable,
  meetingsTable,
  postLikesTable,
} from "@workspace/db";
import { serializeUser } from "../lib/serializers";
import { getUserId } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const viewerId = getUserId(req);

  const [memberCountRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(usersTable);
  const [postCountRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(postsTable);
  const [bookCountRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(booksTable);
  const [meetingCountRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(meetingsTable);

  const recent = await db
    .select({ post: postsTable, author: usersTable })
    .from(postsTable)
    .innerJoin(usersTable, eq(usersTable.id, postsTable.userId))
    .orderBy(desc(postsTable.createdAt))
    .limit(5);

  const postIds = recent.map((r) => r.post.id);
  const counts =
    postIds.length === 0
      ? []
      : await db
          .select({
            postId: postLikesTable.postId,
            count: sql<number>`count(*)::int`,
          })
          .from(postLikesTable)
          .where(
            sql`${postLikesTable.postId} in (${sql.join(
              postIds.map((id) => sql`${id}`),
              sql`, `,
            )})`,
          )
          .groupBy(postLikesTable.postId);
  const countMap = new Map(counts.map((c) => [c.postId, c.count]));

  const likedSet = new Set<number>();
  if (viewerId != null && postIds.length > 0) {
    const liked = await db
      .select({ postId: postLikesTable.postId })
      .from(postLikesTable)
      .where(
        and(
          sql`${postLikesTable.postId} in (${sql.join(
            postIds.map((id) => sql`${id}`),
            sql`, `,
          )})`,
          eq(postLikesTable.userId, viewerId),
        ),
      );
    for (const l of liked) likedSet.add(l.postId);
  }

  const recentPosts = recent.map((r) => ({
    id: r.post.id,
    userId: r.post.userId,
    author: serializeUser(r.author),
    content: r.post.content,
    imageUrl: r.post.imageUrl,
    likeCount: countMap.get(r.post.id) ?? 0,
    likedByMe: likedSet.has(r.post.id),
    createdAt: r.post.createdAt,
  }));

  const now = new Date();
  const upcoming = await db
    .select()
    .from(meetingsTable)
    .where(
      and(
        eq(meetingsTable.kind, "live"),
        isNotNull(meetingsTable.scheduledFor),
        gte(meetingsTable.scheduledFor, now),
      ),
    )
    .orderBy(asc(meetingsTable.scheduledFor))
    .limit(5);

  res.json({
    memberCount: memberCountRow?.c ?? 0,
    postCount: postCountRow?.c ?? 0,
    bookCount: bookCountRow?.c ?? 0,
    meetingCount: meetingCountRow?.c ?? 0,
    recentPosts,
    upcomingMeetings: upcoming.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      scholar: m.scholar,
      kind: m.kind as "live" | "recorded",
      videoUrl: m.videoUrl,
      liveUrl: m.liveUrl,
      scheduledFor: m.scheduledFor,
      durationMinutes: m.durationMinutes,
      coverImageUrl: m.coverImageUrl,
      createdAt: m.createdAt,
    })),
  });
});

export default router;
