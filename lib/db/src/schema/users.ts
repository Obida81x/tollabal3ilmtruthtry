import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 32 }).notNull().unique(),
    displayName: varchar("display_name", { length: 60 }).notNull(),
    gender: varchar("gender", { length: 16 }).notNull(),
    country: text("country"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    isAdmin: boolean("is_admin").notNull().default(false),
    isMainAdmin: boolean("is_main_admin").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    passwordHash: text("password_hash").notNull(),
    passwordSalt: text("password_salt").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    usernameIdx: index("users_username_idx").on(t.username),
    genderIdx: index("users_gender_idx").on(t.gender),
  }),
);

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
