import { pgTable, serial, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const adminApplicationsTable = pgTable("admin_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  age: integer("age").notNull(),
  contactEmail: varchar("contact_email", { length: 254 }).notNull(),
  notes: text("notes"),
  reasons: text("reasons").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  reviewedById: integer("reviewed_by_id").references(() => usersTable.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
