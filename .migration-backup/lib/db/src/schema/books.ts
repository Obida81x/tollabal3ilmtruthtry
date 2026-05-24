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

export const booksTable = pgTable(
  "books",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    author: varchar("author", { length: 120 }).notNull(),
    description: text("description"),
    coverImageUrl: text("cover_image_url"),
    fileUrl: text("file_url").notNull(),
    pages: integer("pages"),
    language: varchar("language", { length: 32 }).notNull(),
    category: varchar("category", { length: 60 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    categoryIdx: index("books_category_idx").on(t.category),
  }),
);

export const insertBookSchema = createInsertSchema(booksTable).omit({
  id: true,
  createdAt: true,
});
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;
