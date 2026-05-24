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

export const chatGroupsTable = pgTable(
  "chat_groups",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    gender: varchar("gender", { length: 16 }).notNull(),
    coverImageUrl: text("cover_image_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    genderIdx: index("chat_groups_gender_idx").on(t.gender),
  }),
);

export const chatMessagesTable = pgTable(
  "chat_messages",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => chatGroupsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    groupIdx: index("chat_messages_group_idx").on(t.groupId),
    createdIdx: index("chat_messages_created_idx").on(t.createdAt),
  }),
);

export const insertChatGroupSchema = createInsertSchema(chatGroupsTable).omit({
  id: true,
  createdAt: true,
});
export const insertChatMessageSchema = createInsertSchema(
  chatMessagesTable,
).omit({ id: true, createdAt: true });
export type InsertChatGroup = z.infer<typeof insertChatGroupSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatGroup = typeof chatGroupsTable.$inferSelect;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
