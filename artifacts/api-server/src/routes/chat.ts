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
import { z } from "zod/v4";
import { serializeUser } from "../lib/serializers";
import { requireUser, getUserId } from "../lib/auth";

const router: IRouter = Router();

const CreateChatGroupBodySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().nullable().optional(),
  gender: z.enum(["male", "female"]),
});

async function viewerInfo(req: import("express").Request): Promise<{ gender: string | null; isAdmin: boolean; isMainAdmin: boolean }> {
  const userId = getUserId(req);
  if (!userId) return { gender: null, isAdmin: false, isMainAdmin: false };
  const [u] = await db
    .select({ gender: usersTable.gender, isAdmin: usersTable.isAdmin, isMainAdmin: usersTable.isMainAdmin })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return {
    gender: u?.gender ?? null,
    isAdmin: u?.isAdmin ?? false,
    isMainAdmin: u?.isMainAdmin ?? false,
  };
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
  const info = await viewerInfo(req);

  let effectiveGender = info.gender;

  // Main admin can override the gender filter via ?gender= query param
  if (info.isMainAdmin && req.query.gender) {
    const g = req.query.gender as string;
    if (g === "male" || g === "female") {
      effectiveGender = g;
    }
  }

  const groups = await db
    .select()
    .from(chatGroupsTable)
    .where(effectiveGender ? eq(chatGroupsTable.gender, effectiveGender) : sql`false`)
    .orderBy(asc(chatGroupsTable.name));
  const result = await Promise.all(groups.map(serializeGroup));
  res.json(result);
});

router.post("/chat/groups", requireUser, async (req, res): Promise<void> => {
  const info = await viewerInfo(req);
  if (!info.isAdmin) {
    res.status(403).json({ error: "Admin access required." });
    return;
  }

  const parsed = CreateChatGroupBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, description, gender } = parsed.data;
  const [group] = await db
    .insert(chatGroupsTable)
    .values({
      name,
      description: description ?? null,
      gender,
    })
    .returning();

  if (!group) {
    res.status(500).json({ error: "Failed to create halaqah group" });
    return;
  }

  res.status(201).json(await serializeGroup(group));
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
  const info = await viewerInfo(req);
  // Main admin can view any group regardless of gender
  if (!info.isMainAdmin && info.gender !== group.gender) {
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
    const info = await viewerInfo(req);
    // Main admin can view messages from any group
    if (!info.isMainAdmin && info.gender !== group.gender) {
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
        audioUrl: r.msg.audioUrl,
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
    const info = await viewerInfo(req);
    if (info.gender !== group.gender) {
      res.status(403).json({ error: "This halaqah is restricted" });
      return;
    }
    const audioUrl = (req.body as { audioUrl?: string | null }).audioUrl ?? null;
    const textContent = (body.data as { content?: string }).content ?? "";
    if (!textContent.trim() && !audioUrl) {
      res.status(400).json({ error: "Message must have content or audio" });
      return;
    }
    const [msg] = await db
      .insert(chatMessagesTable)
      .values({
        groupId: params.data.id,
        userId,
        content: textContent,
        audioUrl,
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
      audioUrl: msg.audioUrl,
      createdAt: msg.createdAt,
    });
  },
);

export default router;
