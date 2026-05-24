import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const testsTable = pgTable("tests", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  level: varchar("level", { length: 24 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const testQuestionsTable = pgTable(
  "test_questions",
  {
    id: serial("id").primaryKey(),
    testId: integer("test_id")
      .notNull()
      .references(() => testsTable.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    options: jsonb("options").$type<string[]>().notNull(),
    correctIndex: integer("correct_index").notNull(),
    explanation: text("explanation"),
    order: integer("order").notNull().default(0),
  },
  (t) => ({
    testIdx: index("test_questions_test_idx").on(t.testId),
  }),
);

export const testAttemptsTable = pgTable(
  "test_attempts",
  {
    id: serial("id").primaryKey(),
    testId: integer("test_id")
      .notNull()
      .references(() => testsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    totalQuestions: integer("total_questions").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("test_attempts_user_idx").on(t.userId),
    testIdx: index("test_attempts_test_idx").on(t.testId),
  }),
);

export const insertTestSchema = createInsertSchema(testsTable).omit({
  id: true,
  createdAt: true,
});
export const insertTestQuestionSchema = createInsertSchema(
  testQuestionsTable,
).omit({ id: true });
export const insertTestAttemptSchema = createInsertSchema(
  testAttemptsTable,
).omit({ id: true, completedAt: true });

export type Test = typeof testsTable.$inferSelect;
export type TestQuestion = typeof testQuestionsTable.$inferSelect;
export type TestAttempt = typeof testAttemptsTable.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;
export type InsertTestQuestion = z.infer<typeof insertTestQuestionSchema>;
export type InsertTestAttempt = z.infer<typeof insertTestAttemptSchema>;
