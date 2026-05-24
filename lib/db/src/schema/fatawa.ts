import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const fatawaTable = pgTable(
  "fatawa",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    muftiId: integer("mufti_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    questionText: text("question_text").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    answerText: text("answer_text"),
    answerAudioUrl: text("answer_audio_url"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    answeredAt: timestamp("answered_at", { withTimezone: true }),
  },
  (t) => ({
    userIdx: index("fatawa_user_idx").on(t.userId),
    muftiIdx: index("fatawa_mufti_idx").on(t.muftiId),
    statusIdx: index("fatawa_status_idx").on(t.status),
  }),
);

export const fatwaNotificationsTable = pgTable(
  "fatwa_notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    fatwaId: integer("fatwa_id")
      .notNull()
      .references(() => fatawaTable.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("fatwa_notifications_user_idx").on(t.userId),
    fatwaIdx: index("fatwa_notifications_fatwa_idx").on(t.fatwaId),
  }),
);

export const muftiAssignmentsTable = pgTable(
  "mufti_assignments",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" })
      .unique(),
    assignedBy: integer("assigned_by")
      .notNull()
      .references(() => usersTable.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => ({
    userIdx: index("mufti_assignments_user_idx").on(t.userId),
    activeIdx: index("mufti_assignments_active_idx").on(t.isActive),
  }),
);

export const insertFatwaSchema = createInsertSchema(fatawaTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFatwa = z.infer<typeof insertFatwaSchema>;
export type Fatwa = typeof fatawaTable.$inferSelect;
export type FatwaNotification = typeof fatwaNotificationsTable.$inferSelect;
export type MuftiAssignment = typeof muftiAssignmentsTable.$inferSelect;
