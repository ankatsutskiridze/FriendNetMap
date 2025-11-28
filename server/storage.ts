import { type User, type InsertUser, type IntroRequest, type InsertIntroRequest, type UserSettings, type UpdateSettings, users, introRequests, userSettings } from "@shared/schema";
import { db } from "../db";
import { eq, or, and, inArray, sql, ilike, ne } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getUsersByIds(ids: string[]): Promise<User[]>;
  searchUsers(query: string, excludeUserId?: string): Promise<User[]>;
  addFriend(userId: string, friendId: string): Promise<void>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  
  // Intro request methods
  createIntroRequest(request: InsertIntroRequest): Promise<IntroRequest>;
  getIntroRequest(id: string): Promise<IntroRequest | undefined>;
  getIntroRequestsForUser(userId: string): Promise<IntroRequest[]>;
  getIntroRequestsViaUser(viaUserId: string): Promise<IntroRequest[]>;
  getReceivedIntroRequests(userId: string): Promise<IntroRequest[]>;
  updateIntroRequestStatus(id: string, status: string): Promise<IntroRequest | undefined>;
  updateIntroRequestConnectorStatus(id: string, status: string): Promise<IntroRequest | undefined>;
  updateIntroRequestTargetStatus(id: string, status: string): Promise<IntroRequest | undefined>;
  getIntroRequestBetween(fromUserId: string, toUserId: string): Promise<IntroRequest | undefined>;
  getAllIntroRequestsForUser(userId: string): Promise<IntroRequest[]>;
  
  // Settings methods
  getSettings(userId: string): Promise<UserSettings | undefined>;
  createSettings(userId: string): Promise<UserSettings>;
  updateSettings(userId: string, updates: UpdateSettings): Promise<UserSettings | undefined>;
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

  async getReceivedIntroRequests(userId: string): Promise<IntroRequest[]> {
    // Two-stage flow:
    // Stage 1: User is connector (viaUser) and connectorStatus is pending
    // Stage 2: User is target (toUser) and connectorStatus is approved but targetStatus is pending
    return await db.select().from(introRequests)
      .where(or(
        // Stage 1: connector needs to approve
        and(
          eq(introRequests.viaUserId, userId),
          eq(introRequests.connectorStatus, "pending")
        ),
        // Stage 2: target needs to approve (after connector approved)
        and(
          eq(introRequests.toUserId, userId),
          eq(introRequests.connectorStatus, "approved"),
          eq(introRequests.targetStatus, "pending")
        )
      ));
  }

  async updateIntroRequestConnectorStatus(id: string, status: string): Promise<IntroRequest | undefined> {
    const result = await db.update(introRequests)
      .set({ connectorStatus: status })
      .where(eq(introRequests.id, id))
      .returning();
    return result[0];
  }

  async updateIntroRequestTargetStatus(id: string, status: string): Promise<IntroRequest | undefined> {
    // When target approves, also update the overall status
    const overallStatus = status === "approved" ? "approved" : (status === "declined" ? "declined" : "pending");
    const result = await db.update(introRequests)
      .set({ targetStatus: status, status: overallStatus })
      .where(eq(introRequests.id, id))
      .returning();
    return result[0];
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

  async getAllIntroRequestsForUser(userId: string): Promise<IntroRequest[]> {
    return await db.select().from(introRequests)
      .where(or(
        eq(introRequests.fromUserId, userId),
        eq(introRequests.toUserId, userId),
        eq(introRequests.viaUserId, userId)
      ))
      .orderBy(sql`${introRequests.createdAt} DESC`);
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async searchUsers(query: string, excludeUserId?: string): Promise<User[]> {
    if (!query.trim()) {
      if (excludeUserId) {
        return await db.select().from(users).where(ne(users.id, excludeUserId)).limit(20);
      }
      return await db.select().from(users).limit(20);
    }
    
    const searchPattern = `%${query}%`;
    let results = await db.select().from(users)
      .where(or(
        ilike(users.fullName, searchPattern),
        ilike(users.username, searchPattern)
      ))
      .limit(20);
    
    if (excludeUserId) {
      results = results.filter(u => u.id !== excludeUserId);
    }
    return results;
  }

  // Settings methods
  async getSettings(userId: string): Promise<UserSettings | undefined> {
    const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
    return result[0];
  }

  async createSettings(userId: string): Promise<UserSettings> {
    const result = await db.insert(userSettings).values({ userId }).returning();
    return result[0];
  }

  async updateSettings(userId: string, updates: UpdateSettings): Promise<UserSettings | undefined> {
    const result = await db.update(userSettings)
      .set(updates)
      .where(eq(userSettings.userId, userId))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
