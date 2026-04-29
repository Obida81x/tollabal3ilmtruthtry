import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const postsTable = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    imageUrl: text("image_url"),
    videoUrl: text("video_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("posts_user_idx").on(t.userId),
    createdIdx: index("posts_created_idx").on(t.createdAt),
  }),
);

export const postLikesTable = pgTable(
  "post_likes",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniq: unique("post_likes_post_user_uniq").on(t.postId, t.userId),
    postIdx: index("post_likes_post_idx").on(t.postId),
  }),
);

export const insertPostSchema = createInsertSchema(postsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;
export type PostLike = typeof postLikesTable.$inferSelect;
