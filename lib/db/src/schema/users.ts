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
    email: varchar("email", { length: 254 }),
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
    emailIdx: index("users_email_idx").on(t.email),
    genderIdx: index("users_gender_idx").on(t.gender),
  }),
);

export const passwordResetsTable = pgTable(
  "password_resets",
  {
    id: serial("id").primaryKey(),
    userId: serial("user_id").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("password_resets_user_idx").on(t.userId),
    expiresIdx: index("password_resets_expires_idx").on(t.expiresAt),
  }),
);

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
export type PasswordReset = typeof passwordResetsTable.$inferSelect;
