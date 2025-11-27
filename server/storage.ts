import { type User, type InsertUser, type IntroRequest, type InsertIntroRequest, users, introRequests } from "@shared/schema";
import { db } from "../db";
import { eq, or, and, inArray, sql, type ExtractTablesWithRelations } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { PgTransaction } from "drizzle-orm/pg-core";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByIds(ids: string[]): Promise<User[]>;
  addFriend(userId: string, friendId: string): Promise<void>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  
  // Intro request methods
  createIntroRequest(request: InsertIntroRequest): Promise<IntroRequest>;
  getIntroRequest(id: string): Promise<IntroRequest | undefined>;
  getIntroRequestsForUser(userId: string): Promise<IntroRequest[]>;
  getIntroRequestsViaUser(viaUserId: string): Promise<IntroRequest[]>;
  updateIntroRequestStatus(id: string, status: string): Promise<IntroRequest | undefined>;
  getIntroRequestBetween(fromUserId: string, toUserId: string): Promise<IntroRequest | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    return await db.select().from(users).where(inArray(users.id, ids));
  }

  async addFriend(userId: string, friendId: string): Promise<void> {
    await db.transaction(async (tx: any) => {
      // Add friendId to userId's friends array
      await tx.update(users)
        .set({ friends: sql`array_append(${users.friends}, ${friendId})` })
        .where(eq(users.id, userId));
      
      // Add userId to friendId's friends array
      await tx.update(users)
        .set({ friends: sql`array_append(${users.friends}, ${userId})` })
        .where(eq(users.id, friendId));
    });
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await db.transaction(async (tx: any) => {
      // Remove friendId from userId's friends array
      await tx.update(users)
        .set({ friends: sql`array_remove(${users.friends}, ${friendId})` })
        .where(eq(users.id, userId));
      
      // Remove userId from friendId's friends array
      await tx.update(users)
        .set({ friends: sql`array_remove(${users.friends}, ${userId})` })
        .where(eq(users.id, friendId));
    });
  }

  // Intro request methods
  async createIntroRequest(request: InsertIntroRequest): Promise<IntroRequest> {
    const result = await db.insert(introRequests).values(request).returning();
    return result[0];
  }

  async getIntroRequest(id: string): Promise<IntroRequest | undefined> {
    const result = await db.select().from(introRequests).where(eq(introRequests.id, id)).limit(1);
    return result[0];
  }

  async getIntroRequestsForUser(userId: string): Promise<IntroRequest[]> {
    return await db.select().from(introRequests)
      .where(or(
        eq(introRequests.fromUserId, userId),
        eq(introRequests.toUserId, userId)
      ));
  }

  async getIntroRequestsViaUser(viaUserId: string): Promise<IntroRequest[]> {
    return await db.select().from(introRequests)
      .where(eq(introRequests.viaUserId, viaUserId));
  }

  async updateIntroRequestStatus(id: string, status: string): Promise<IntroRequest | undefined> {
    const result = await db.update(introRequests)
      .set({ status })
      .where(eq(introRequests.id, id))
      .returning();
    return result[0];
  }

  async getIntroRequestBetween(fromUserId: string, toUserId: string): Promise<IntroRequest | undefined> {
    const result = await db.select().from(introRequests)
      .where(and(
        eq(introRequests.fromUserId, fromUserId),
        eq(introRequests.toUserId, toUserId)
      ))
      .limit(1);
    return result[0];
  }
}

export const storage = new DatabaseStorage();
