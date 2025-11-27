import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  photoURL: text("photo_url"),
  location: text("location"),
  about: text("about"),
  instagramHandle: text("instagram_handle"),
  whatsappNumber: text("whatsapp_number"),
  phoneNumber: text("phone_number"),
  friends: text("friends").array().default(sql`ARRAY[]::text[]`),
});

export const introRequests = pgTable("intro_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  viaUserId: varchar("via_user_id").notNull().references(() => users.id),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  friends: true,
});

export const insertIntroRequestSchema = createInsertSchema(introRequests).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const updateUserSchema = insertUserSchema.partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertIntroRequest = z.infer<typeof insertIntroRequestSchema>;
export type IntroRequest = typeof introRequests.$inferSelect;
