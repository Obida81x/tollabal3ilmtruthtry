import { Router, type IRouter } from "express";
import { asc, desc, eq, sql } from "drizzle-orm";
import {
  db,
  chatGroupsTable,
  chatMessagesTable,
  usersTable,
} from "@workspace/db";
import {
  GetChatGroupParams,
  ListChatMessagesParams,
  PostChatMessageParams,
  PostChatMessageBody,
} from "@workspace/api-zod";
import { serializeUser } from "../lib/serializers";
import { requireUser, getUserId } from "../lib/auth";

const router: IRouter = Router();

async function viewerGender(req: import("express").Request): Promise<string | null> {
  const userId = getUserId(req);
  if (!userId) return null;
  const [u] = await db
    .select({ gender: usersTable.gender })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return u?.gender ?? null;
}

async function serializeGroup(g: typeof chatGroupsTable.$inferSelect) {
  const [memberAgg] = await db
    .select({
      members: sql<number>`count(distinct ${chatMessagesTable.userId})::int`,
      lastAt: sql<Date | null>`max(${chatMessagesTable.createdAt})`,
    })
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.groupId, g.id));
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    gender: g.gender as "male" | "female",
    coverImageUrl: g.coverImageUrl,
    memberCount: memberAgg?.members ?? 0,
    lastMessageAt: memberAgg?.lastAt ?? null,
    createdAt: g.createdAt,
  };
}

router.get("/chat/groups", async (req, res): Promise<void> => {
  const gender = await viewerGender(req);
  const groups = await db
    .select()
    .from(chatGroupsTable)
    .where(gender ? eq(chatGroupsTable.gender, gender) : sql`false`)
    .orderBy(asc(chatGroupsTable.name));
  const result = await Promise.all(groups.map(serializeGroup));
  res.json(result);
});

router.get("/chat/groups/:id", async (req, res): Promise<void> => {
  const parsed = GetChatGroupParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [group] = await db
    .select()
    .from(chatGroupsTable)
    .where(eq(chatGroupsTable.id, parsed.data.id))
    .limit(1);
  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }
  const gender = await viewerGender(req);
  if (gender !== group.gender) {
    res.status(403).json({ error: "This halaqah is restricted" });
    return;
  }
  res.json(await serializeGroup(group));
});

router.get(
  "/chat/groups/:id/messages",
  async (req, res): Promise<void> => {
    const parsed = ListChatMessagesParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [group] = await db
      .select()
      .from(chatGroupsTable)
      .where(eq(chatGroupsTable.id, parsed.data.id))
      .limit(1);
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    const gender = await viewerGender(req);
    if (gender !== group.gender) {
      res.status(403).json({ error: "This halaqah is restricted" });
      return;
    }
    const rows = await db
      .select({ msg: chatMessagesTable, author: usersTable })
      .from(chatMessagesTable)
      .innerJoin(usersTable, eq(usersTable.id, chatMessagesTable.userId))
      .where(eq(chatMessagesTable.groupId, parsed.data.id))
      .orderBy(asc(chatMessagesTable.createdAt))
      .limit(200);
    res.json(
      rows.map((r) => ({
        id: r.msg.id,
        groupId: r.msg.groupId,
        userId: r.msg.userId,
        author: serializeUser(r.author),
        content: r.msg.content,
        createdAt: r.msg.createdAt,
      })),
    );
    void desc;
  },
);

router.post(
  "/chat/groups/:id/messages",
  requireUser,
  async (req, res): Promise<void> => {
    const params = PostChatMessageParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = PostChatMessageBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const [group] = await db
      .select()
      .from(chatGroupsTable)
      .where(eq(chatGroupsTable.id, params.data.id))
      .limit(1);
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    const gender = await viewerGender(req);
    if (gender !== group.gender) {
      res.status(403).json({ error: "This halaqah is restricted" });
      return;
    }
    const [msg] = await db
      .insert(chatMessagesTable)
      .values({
        groupId: params.data.id,
        userId,
        content: body.data.content,
      })
      .returning();
    if (!msg) {
      res.status(500).json({ error: "Failed to send message" });
      return;
    }
    const [author] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    res.status(201).json({
      id: msg.id,
      groupId: msg.groupId,
      userId: msg.userId,
      author: author ? serializeUser(author) : null,
      content: msg.content,
      createdAt: msg.createdAt,
    });
  },
);

export default router;
