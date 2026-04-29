import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, isNotNull } from "drizzle-orm";
import { db, meetingsTable } from "@workspace/db";
import {
  ListMeetingsQueryParams,
  GetMeetingParams,
  CreateMeetingBody,
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

export default router;
