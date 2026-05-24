import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const meetingsTable = pgTable(
  "meetings",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    scholar: varchar("scholar", { length: 120 }).notNull(),
    kind: varchar("kind", { length: 16 }).notNull(),
    videoUrl: text("video_url"),
    liveUrl: text("live_url"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    durationMinutes: integer("duration_minutes"),
    coverImageUrl: text("cover_image_url"),
    createdByUserId: integer("created_by_user_id").references(
      () => usersTable.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    kindIdx: index("meetings_kind_idx").on(t.kind),
    scheduledIdx: index("meetings_scheduled_idx").on(t.scheduledFor),
  }),
);

export const insertMeetingSchema = createInsertSchema(meetingsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetingsTable.$inferSelect;
