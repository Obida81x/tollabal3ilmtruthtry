import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, isNotNull } from "drizzle-orm";
import { db, meetingsTable } from "@workspace/db";
import {
  ListMeetingsQueryParams,
  GetMeetingParams,
} from "@workspace/api-zod";

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
    createdAt: m.createdAt,
  };
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
