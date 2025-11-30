import {
  type User,
  type InsertUser,
  type IntroRequest,
  type InsertIntroRequest,
  type UserSettings,
  type UpdateSettings,
  users,
  introRequests,
  userSettings,
} from "@shared/schema";
import { db } from "../db";
import { eq, or, and, inArray, sql, ilike, ne } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  updateIntroRequestStatus(
    id: string,
    status: string
  ): Promise<IntroRequest | undefined>;
  updateIntroRequestConnectorStatus(
    id: string,
    status: string
  ): Promise<IntroRequest | undefined>;
  updateIntroRequestTargetStatus(
    id: string,
    status: string
  ): Promise<IntroRequest | undefined>;
  getIntroRequestBetween(
    fromUserId: string,
    toUserId: string
  ): Promise<IntroRequest | undefined>;
  getAllIntroRequestsForUser(userId: string): Promise<IntroRequest[]>;

  // Friend request methods
  createFriendRequest(
    fromUserId: string,
    toUserId: string
  ): Promise<IntroRequest>;
  getFriendRequestBetween(
    fromUserId: string,
    toUserId: string
  ): Promise<IntroRequest | undefined>;
  getReceivedFriendRequests(userId: string): Promise<IntroRequest[]>;
  getSentFriendRequests(userId: string): Promise<IntroRequest[]>;
  getAllReceivedRequests(userId: string): Promise<IntroRequest[]>;

  // Settings methods
  getSettings(userId: string): Promise<UserSettings | undefined>;
  createSettings(userId: string): Promise<UserSettings>;
  updateSettings(
    userId: string,
    updates: UpdateSettings
  ): Promise<UserSettings | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0];
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<User | undefined> {
    const result = await db
      .update(users)
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
    // Reject self-friendship attempts
    if (userId === friendId) {
      throw new Error("Cannot add yourself as a friend");
    }

    await db.transaction(async (tx: any) => {
      // Sort IDs to ensure consistent lock ordering and prevent deadlocks
      const [firstId, secondId] = [userId, friendId].sort();

      // Lock rows in deterministic order to prevent deadlocks
      const firstLock = await tx.execute(sql`
        SELECT id FROM ${users} WHERE id = ${firstId} FOR UPDATE
      `);
      const secondLock = await tx.execute(sql`
        SELECT id FROM ${users} WHERE id = ${secondId} FOR UPDATE
      `);

      if (!firstLock.rows || firstLock.rows.length === 0) {
        throw new Error(`User ${firstId} not found`);
      }
      if (!secondLock.rows || secondLock.rows.length === 0) {
        throw new Error(`User ${secondId} not found`);
      }

      // Use SQL array operations to atomically add friends only if not present
      // Each CASE WHEN is evaluated atomically within the UPDATE statement

      // Add friendId to userId's friends array (only if not already present)
      const result1 = await tx.execute(sql`
        UPDATE ${users} 
        SET friends = CASE 
          WHEN ${friendId} = ANY(COALESCE(friends, ARRAY[]::text[])) THEN friends
          ELSE array_append(COALESCE(friends, ARRAY[]::text[]), ${friendId})
        END
        WHERE id = ${userId}
      `);

      // Add userId to friendId's friends array (only if not already present)
      const result2 = await tx.execute(sql`
        UPDATE ${users} 
        SET friends = CASE 
          WHEN ${userId} = ANY(COALESCE(friends, ARRAY[]::text[])) THEN friends
          ELSE array_append(COALESCE(friends, ARRAY[]::text[]), ${userId})
        END
        WHERE id = ${friendId}
      `);

      // Verify both updates succeeded
      if (result1.rowCount === 0 || result2.rowCount === 0) {
        throw new Error(
          "Failed to update friendship - one or both users may have been deleted"
        );
      }
    });
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await db.transaction(async (tx: any) => {
      // Remove friendId from userId's friends array
      await tx
        .update(users)
        .set({ friends: sql`array_remove(${users.friends}, ${friendId})` })
        .where(eq(users.id, userId));

      // Remove userId from friendId's friends array
      await tx
        .update(users)
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
    const result = await db
      .select()
      .from(introRequests)
      .where(eq(introRequests.id, id))
      .limit(1);
    return result[0];
  }

  async getIntroRequestsForUser(userId: string): Promise<IntroRequest[]> {
    return await db
      .select()
      .from(introRequests)
      .where(
        or(
          eq(introRequests.fromUserId, userId),
          eq(introRequests.toUserId, userId)
        )
      );
  }

  async getIntroRequestsViaUser(viaUserId: string): Promise<IntroRequest[]> {
    return await db
      .select()
      .from(introRequests)
      .where(eq(introRequests.viaUserId, viaUserId));
  }

  async getReceivedIntroRequests(userId: string): Promise<IntroRequest[]> {
    // Two-stage flow:
    // Stage 1: User is connector (viaUser) and connectorStatus is pending
    // Stage 2: User is target (toUser) and connectorStatus is approved but targetStatus is pending
    return await db
      .select()
      .from(introRequests)
      .where(
        or(
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
        )
      );
  }

  async updateIntroRequestConnectorStatus(
    id: string,
    status: string
  ): Promise<IntroRequest | undefined> {
    const result = await db
      .update(introRequests)
      .set({ connectorStatus: status })
      .where(eq(introRequests.id, id))
      .returning();
    return result[0];
  }

  async updateIntroRequestTargetStatus(
    id: string,
    status: string
  ): Promise<IntroRequest | undefined> {
    // When target approves, also update the overall status
    const overallStatus =
      status === "approved"
        ? "approved"
        : status === "declined"
        ? "declined"
        : "pending";
    const result = await db
      .update(introRequests)
      .set({ targetStatus: status, status: overallStatus })
      .where(eq(introRequests.id, id))
      .returning();
    return result[0];
  }

  async updateIntroRequestStatus(
    id: string,
    status: string
  ): Promise<IntroRequest | undefined> {
    const result = await db
      .update(introRequests)
      .set({ status })
      .where(eq(introRequests.id, id))
      .returning();
    return result[0];
  }

  async getIntroRequestBetween(
    fromUserId: string,
    toUserId: string
  ): Promise<IntroRequest | undefined> {
    const result = await db
      .select()
      .from(introRequests)
      .where(
        and(
          eq(introRequests.fromUserId, fromUserId),
          eq(introRequests.toUserId, toUserId)
        )
      )
      .limit(1);
    return result[0];
  }

  async getAllIntroRequestsForUser(userId: string): Promise<IntroRequest[]> {
    return await db
      .select()
      .from(introRequests)
      .where(
        or(
          eq(introRequests.fromUserId, userId),
          eq(introRequests.toUserId, userId),
          eq(introRequests.viaUserId, userId)
        )
      )
      .orderBy(sql`${introRequests.createdAt} DESC`);
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async searchUsers(query: string, excludeUserId?: string): Promise<User[]> {
    // NOTE: This function searches the users table directly.
    // It is INDEPENDENT of the intro_requests / friend request schema.
    // If this fails, check database connection, not request tables.
    try {
      if (!query.trim()) {
        if (excludeUserId) {
          return await db
            .select()
            .from(users)
            .where(ne(users.id, excludeUserId))
            .limit(20);
        }
        return await db.select().from(users).limit(20);
      }

      const searchPattern = `%${query}%`;
      let results = await db
        .select()
        .from(users)
        .where(
          or(
            ilike(users.fullName, searchPattern),
            ilike(users.username, searchPattern)
          )
        )
        .limit(20);

      if (excludeUserId) {
        results = results.filter((u) => u.id !== excludeUserId);
      }
      return results;
    } catch (error: any) {
      console.error(
        "[storage.searchUsers] Error searching users:",
        error.message
      );
      // Re-throw to let the route handler return the error
      throw error;
    }
  }

  // Settings methods
  async getSettings(userId: string): Promise<UserSettings | undefined> {
    const result = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    return result[0];
  }

  async createSettings(userId: string): Promise<UserSettings> {
    const result = await db.insert(userSettings).values({ userId }).returning();
    return result[0];
  }

  async updateSettings(
    userId: string,
    updates: UpdateSettings
  ): Promise<UserSettings | undefined> {
    const result = await db
      .update(userSettings)
      .set(updates)
      .where(eq(userSettings.userId, userId))
      .returning();
    return result[0];
  }

  // Friend request methods
  async createFriendRequest(
    fromUserId: string,
    toUserId: string
  ): Promise<IntroRequest> {
    const result = await db
      .insert(introRequests)
      .values({
        type: "friend",
        fromUserId,
        toUserId,
        viaUserId: null,
      })
      .returning();
    return result[0];
  }

  async getFriendRequestBetween(
    fromUserId: string,
    toUserId: string
  ): Promise<IntroRequest | undefined> {
    // Check both directions since friendship is mutual
    const result = await db
      .select()
      .from(introRequests)
      .where(
        and(
          eq(introRequests.type, "friend"),
          or(
            and(
              eq(introRequests.fromUserId, fromUserId),
              eq(introRequests.toUserId, toUserId)
            ),
            and(
              eq(introRequests.fromUserId, toUserId),
              eq(introRequests.toUserId, fromUserId)
            )
          )
        )
      )
      .limit(1);
    return result[0];
  }

  async getReceivedFriendRequests(userId: string): Promise<IntroRequest[]> {
    return await db
      .select()
      .from(introRequests)
      .where(
        and(
          eq(introRequests.type, "friend"),
          eq(introRequests.toUserId, userId),
          eq(introRequests.status, "pending")
        )
      );
  }

  async getSentFriendRequests(userId: string): Promise<IntroRequest[]> {
    return await db
      .select()
      .from(introRequests)
      .where(
        and(
          eq(introRequests.type, "friend"),
          eq(introRequests.fromUserId, userId)
        )
      );
  }

  async getAllReceivedRequests(userId: string): Promise<IntroRequest[]> {
    // Get all received requests (both friend and introduction)
    // Friend requests: toUserId === userId and type === 'friend' and status === 'pending'
    // Introduction requests (Stage 1): viaUserId === userId and connectorStatus === 'pending' and type === 'introduction'
    // Introduction requests (Stage 2): toUserId === userId and connectorStatus === 'approved' and targetStatus === 'pending' and type === 'introduction'
    return await db
      .select()
      .from(introRequests)
      .where(
        or(
          // Friend requests
          and(
            eq(introRequests.type, "friend"),
            eq(introRequests.toUserId, userId),
            eq(introRequests.status, "pending")
          ),
          // Introduction Stage 1: connector needs to approve
          and(
            eq(introRequests.type, "introduction"),
            eq(introRequests.viaUserId, userId),
            eq(introRequests.connectorStatus, "pending")
          ),
          // Introduction Stage 2: target needs to approve (after connector approved)
          and(
            eq(introRequests.type, "introduction"),
            eq(introRequests.toUserId, userId),
            eq(introRequests.connectorStatus, "approved"),
            eq(introRequests.targetStatus, "pending")
          )
        )
      )
      .orderBy(sql`${introRequests.createdAt} DESC`);
  }
}

export const storage = new DatabaseStorage();
