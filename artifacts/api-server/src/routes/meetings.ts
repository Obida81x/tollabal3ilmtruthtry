import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, isNotNull } from "drizzle-orm";
import { db, meetingsTable, usersTable } from "@workspace/db";
import {
  ListMeetingsQueryParams,
  GetMeetingParams,
  CreateMeetingBody,
  AdminCreateMeetingBody,
  AdminUpdateMeetingBody,
  AdminUpdateMeetingParams,
} from "@workspace/api-zod";
import { requireUser, getUserId } from "../lib/auth";

const router: IRouter = Router();

function serializeMeeting(m: typeof meetingsTable.$inferSelect) {
  return {
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
    createdByUserId: m.createdByUserId,
    createdAt: m.createdAt,
  };
}

const GOOGLE_MEET_RE =
  /^https?:\/\/(?:www\.)?meet\.google\.com\/[A-Za-z0-9-]+(?:\?.*)?$/;

const HTTP_URL_RE = /^https?:\/\/.+/i;

async function loadAdmin(req: Parameters<typeof requireUser>[0]) {
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

router.get("/meetings", async (req, res): Promise<void> => {
  const parsed = ListMeetingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { kind } = parsed.data;
  const rows = await db
    .select()
    .from(meetingsTable)
    .where(kind ? eq(meetingsTable.kind, kind) : undefined)
    .orderBy(desc(meetingsTable.scheduledFor));
  res.json(rows.map(serializeMeeting));
});

router.post("/meetings", requireUser, async (req, res): Promise<void> => {
  const parsed = CreateMeetingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (!GOOGLE_MEET_RE.test(parsed.data.liveUrl)) {
    res.status(400).json({
      error:
        "The live broadcast link must be a valid Google Meet URL (https://meet.google.com/...).",
    });
    return;
  }
  const [row] = await db
    .insert(meetingsTable)
    .values({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      scholar: parsed.data.scholar,
      kind: "live",
      liveUrl: parsed.data.liveUrl,
      scheduledFor: parsed.data.scheduledFor ?? null,
      durationMinutes: parsed.data.durationMinutes ?? null,
      createdByUserId: userId,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create live broadcast" });
    return;
  }
  res.status(201).json(serializeMeeting(row));
});

router.get("/meetings/upcoming", async (_req, res): Promise<void> => {
  const now = new Date();
  const rows = await db
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
    .limit(10);
  res.json(rows.map(serializeMeeting));
});

router.get("/meetings/:id", async (req, res): Promise<void> => {
  const parsed = GetMeetingParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(meetingsTable)
    .where(eq(meetingsTable.id, parsed.data.id))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Meeting not found" });
    return;
  }
  res.json(serializeMeeting(row));
});

router.post(
  "/admin/meetings",
  requireUser,
  async (req, res): Promise<void> => {
    const me = await loadAdmin(req);
    if (!me) {
      res.status(403).json({ error: "Admin access required." });
      return;
    }
    const parsed = AdminCreateMeetingBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    if (parsed.data.kind === "live") {
      if (!parsed.data.liveUrl || !GOOGLE_MEET_RE.test(parsed.data.liveUrl)) {
        res.status(400).json({
          error:
            "Live broadcasts require a valid Google Meet link (https://meet.google.com/...).",
        });
        return;
      }
    } else {
      if (!parsed.data.videoUrl || !HTTP_URL_RE.test(parsed.data.videoUrl)) {
        res
          .status(400)
          .json({ error: "Recorded lessons require a valid HTTPS video URL." });
        return;
      }
    }
    const [row] = await db
      .insert(meetingsTable)
      .values({
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        scholar: parsed.data.scholar,
        kind: parsed.data.kind,
        liveUrl: parsed.data.kind === "live" ? parsed.data.liveUrl ?? null : null,
        videoUrl:
          parsed.data.kind === "recorded" ? parsed.data.videoUrl ?? null : null,
        scheduledFor: parsed.data.scheduledFor ?? null,
        durationMinutes: parsed.data.durationMinutes ?? null,
        coverImageUrl: parsed.data.coverImageUrl ?? null,
        createdByUserId: me.id,
      })
      .returning();
    if (!row) {
      res.status(500).json({ error: "Failed to create meeting." });
      return;
    }
    res.status(201).json(serializeMeeting(row));
  },
);

router.patch(
  "/admin/meetings/:id",
  requireUser,
  async (req, res): Promise<void> => {
    const me = await loadAdmin(req);
    if (!me) {
      res.status(403).json({ error: "Admin access required." });
      return;
    }
    const params = AdminUpdateMeetingParams.safeParse(req.params);
    const body = AdminUpdateMeetingBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const [existing] = await db
      .select()
      .from(meetingsTable)
      .where(eq(meetingsTable.id, params.data.id))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Meeting not found" });
      return;
    }
    const update: Partial<typeof meetingsTable.$inferInsert> = {};
    if (body.data.title !== undefined) update.title = body.data.title;
    if (body.data.description !== undefined)
      update.description = body.data.description ?? null;
    if (body.data.scholar !== undefined) update.scholar = body.data.scholar;
    if (body.data.kind !== undefined) update.kind = body.data.kind;
    if (body.data.liveUrl !== undefined) {
      const v = body.data.liveUrl;
      if (v && !GOOGLE_MEET_RE.test(v)) {
        res.status(400).json({
          error: "Live URL must be a Google Meet link.",
        });
        return;
      }
      update.liveUrl = v ?? null;
    }
    if (body.data.videoUrl !== undefined) {
      const v = body.data.videoUrl;
      if (v && !HTTP_URL_RE.test(v)) {
        res.status(400).json({ error: "Video URL must start with http(s)://" });
        return;
      }
      update.videoUrl = v ?? null;
    }
    if (body.data.scheduledFor !== undefined)
      update.scheduledFor = body.data.scheduledFor ?? null;
    if (body.data.durationMinutes !== undefined)
      update.durationMinutes = body.data.durationMinutes ?? null;
    if (body.data.coverImageUrl !== undefined)
      update.coverImageUrl = body.data.coverImageUrl ?? null;
    const [updated] = await db
      .update(meetingsTable)
      .set(update)
      .where(eq(meetingsTable.id, params.data.id))
      .returning();
    res.json(serializeMeeting(updated!));
  },
);

export default router;
