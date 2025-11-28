import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const introRequests = pgTable("intro_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  viaUserId: varchar("via_user_id").notNull().references(() => users.id),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  connectorStatus: text("connector_status").notNull().default("pending"),
  targetStatus: text("target_status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  emailUpdatesEnabled: boolean("email_updates_enabled").default(false),
  introRequestsEnabled: boolean("intro_requests_enabled").default(true),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  friends: true,
  createdAt: true,
});

export const insertIntroRequestSchema = createInsertSchema(introRequests).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

export const updateUserSchema = insertUserSchema.partial();
export const updateSettingsSchema = insertSettingsSchema.partial().omit({ userId: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertIntroRequest = z.infer<typeof insertIntroRequestSchema>;
export type IntroRequest = typeof introRequests.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
