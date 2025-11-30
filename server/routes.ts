import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { verifyIdToken } from "./firebase";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../db";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {
  insertUserSchema,
  insertIntroRequestSchema,
  updateUserSchema,
  updateSettingsSchema,
} from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashedPassword, salt] = stored.split(".");
  const hashedSupplied = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return hashedPassword === hashedSupplied.toString("hex");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session setup
  const PgSession = connectPgSimple(session);

  const isProduction = process.env.NODE_ENV === "production";

  app.use(
    session({
      store: new PgSession({
        pool: pool as any,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "friends-map-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: isProduction, // true in production (HTTPS), false in dev
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax', // 'none' for production cross-origin
        maxAge: 30 * 24 * 60 * 60 * 1000 
      },
      proxy: isProduction, // trust first proxy (Render's load balancer)
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport setup
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !user.password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(parsed.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (!parsed.password) {
        return res.status(400).json({ message: "Password is required" });
      }
      const hashedPassword = await hashPassword(parsed.password);
      const user = await storage.createUser({
        ...parsed,
        password: hashedPassword,
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.post("/api/auth/firebase", async (req, res, next) => {
    console.log("[Auth] Firebase login request received");
    try {
      const { token } = req.body;
      if (!token) {
        console.log("[Auth] No token provided");
        return res.status(400).json({ message: "Token is required" });
      }

      console.log("[Auth] Verifying token...");
      const decodedToken = await verifyIdToken(token);
      const { uid, email, name, picture } = decodedToken;
      console.log(`[Auth] Token verified for user: ${email} (${uid})`);

      // Check if user exists by firebaseUid
      let user = await storage.getUserByFirebaseUid(uid);

      if (!user) {
        console.log("[Auth] User not found by UID, checking email...");
        // Check if user exists by email
        if (email) {
          user = await storage.getUserByEmail(email);
          if (user) {
            console.log("[Auth] User found by email, linking account...");
            // Link existing user to Firebase and update profile if missing
            const updates: any = { firebaseUid: uid };

            // Update fullName if it's missing or default
            if (name && (!user.fullName || user.fullName === "New User")) {
              updates.fullName = name;
            }

            // Update photoURL if it's missing
            if (picture && !user.photoURL) {
              updates.photoURL = picture;
            }

            user = await storage.updateUser(user.id, updates);
          }
        }

        if (!user) {
          console.log("[Auth] Creating new user...");
          // Create new user
          // We need a username. Let's generate one from email or name or random.
          let username = email
            ? email.split("@")[0]
            : `user_${uid.substring(0, 8)}`;

          // Ensure username is unique (simple retry or check)
          let existingUsername = await storage.getUserByUsername(username);
          if (existingUsername) {
            username = `${username}_${Math.floor(Math.random() * 1000)}`;
          }

          user = await storage.createUser({
            username,
            email: email || undefined,
            firebaseUid: uid,
            fullName: name || "New User",
            photoURL: picture,
            password: null, // No password for social login
            isOnboardingCompleted: false,
          });
          console.log(`[Auth] New user created: ${user.id}`);
        }
      }

      if (!user) {
        console.error("[Auth] Failed to create or retrieve user");
        return res
          .status(500)
          .json({ message: "Failed to create or retrieve user" });
      }

      // Log the user in using Passport
      console.log("[Auth] Logging in via Passport...");
      req.login(user, (err) => {
        if (err) {
          console.error("[Auth] Passport login error:", err);
          return next(err);
        }
        console.log("[Auth] Login successful");
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (err: any) {
      console.error("Firebase auth error:", err);
      // Return the actual error message to help debugging
      res.status(401).json({ message: err.message || "Invalid token" });
    }
  });

  app.get("/api/auth/check-username", async (req, res) => {
    const username = req.query.username as string;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    const user = await storage.getUserByUsername(username);
    res.json({ available: !user });
  });

  app.get("/api/auth/me", requireAuth, (req: any, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // User routes
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Search users - MUST be before /api/users/:id to avoid route conflict
  // NOTE: This route searches the users table directly and is independent of the friend request schema
  app.get("/api/users/search", requireAuth, async (req: any, res) => {
    try {
      const query = (req.query.q as string) || "";
      console.log(`[search] Query: "${query}", User ID: ${req.user.id}`);
      const users = await storage.searchUsers(query, req.user.id);
      console.log(
        `[search] Found ${users.length} results for query "${query}"`
      );
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (err: any) {
      // Log the full error for debugging - search should work independently of friend request schema
      console.error(
        `[search] Database error for query "${req.query.q}":`,
        err.message
      );
      console.error(`[search] Full error:`, err);
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req: any, res) => {
    try {
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const parsed = updateUserSchema.parse(req.body);
      const updates: any = { ...parsed };
      if (parsed.password) {
        updates.password = await hashPassword(parsed.password);
      }
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // Friends routes - Now creates a friend request instead of direct connection
  app.post("/api/friends/:friendId", requireAuth, async (req: any, res) => {
    try {
      const friendId = req.params.friendId;
      const userId = req.user.id;

      if (userId === friendId) {
        return res
          .status(400)
          .json({ message: "Cannot add yourself as a friend" });
      }

      const friend = await storage.getUser(friendId);
      if (!friend) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if they're already friends
      const currentUser = await storage.getUser(userId);
      if (currentUser?.friends?.includes(friendId)) {
        return res.status(400).json({ message: "Already friends" });
      }

      // Check if a friend request already exists
      const existing = await storage.getFriendRequestBetween(userId, friendId);
      if (existing) {
        if (existing.status === "pending") {
          return res
            .status(400)
            .json({ message: "Friend request already pending" });
        }
        if (existing.status === "approved") {
          return res.status(400).json({ message: "Already friends" });
        }
      }

      // Create a friend request instead of direct connection
      console.log(
        `[friend-request/create] User ${userId} sending friend request to ${friendId}`
      );
      const request = await storage.createFriendRequest(userId, friendId);
      console.log(`[friend-request/create] Request created: ${request.id}`);

      res.json({ message: "Friend request sent", request });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/friends/:friendId", requireAuth, async (req: any, res) => {
    try {
      const friendId = req.params.friendId;
      const userId = req.user.id;

      await storage.removeFriend(userId, friendId);
      res.json({ message: "Friend removed successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/friends", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || !user.friends) {
        return res.json([]);
      }
      const friends = await storage.getUsersByIds(user.friends);
      const friendsWithoutPasswords = friends.map(
        ({ password, ...friend }) => friend
      );
      res.json(friendsWithoutPasswords);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Introduction request routes
  app.post("/api/intro-requests", requireAuth, async (req: any, res) => {
    try {
      const parsed = insertIntroRequestSchema.parse(req.body);

      console.log(`[intro-requests/create] Current user: ${req.user.id}`);
      console.log(
        `[intro-requests/create] Creating request: from=${parsed.fromUserId}, to=${parsed.toUserId}, via=${parsed.viaUserId}`
      );

      // Verify the from user is the current user
      if (parsed.fromUserId !== req.user.id) {
        console.log(
          `[intro-requests/create] ERROR: fromUserId (${parsed.fromUserId}) !== currentUser (${req.user.id})`
        );
        return res.status(403).json({ message: "Forbidden" });
      }

      // Check if request already exists
      const existing = await storage.getIntroRequestBetween(
        parsed.fromUserId,
        parsed.toUserId
      );
      if (existing) {
        return res.status(400).json({ message: "Request already exists" });
      }

      const request = await storage.createIntroRequest(parsed);
      console.log(
        `[intro-requests/create] Request created successfully: ${request.id}`
      );
      console.log(
        `[intro-requests/create] The VIA user (${parsed.viaUserId}) will see this in their Received tab`
      );
      res.json(request);
    } catch (err: any) {
      console.error(`[intro-requests/create] Error: ${err.message}`);
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/intro-requests/sent", requireAuth, async (req: any, res) => {
    try {
      const requests = await storage.getIntroRequestsForUser(req.user.id);
      const sent = requests.filter((r) => r.fromUserId === req.user.id);
      console.log(
        `[intro-requests/sent] User ${req.user.id} has ${sent.length} sent requests`
      );
      sent.forEach((r) => {
        console.log(
          `  - Request ${r.id}: from=${r.fromUserId}, to=${r.toUserId}, via=${r.viaUserId}, status=${r.status}`
        );
      });
      res.json(sent);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get(
    "/api/intro-requests/received",
    requireAuth,
    async (req: any, res) => {
      try {
        // Get all received requests (both friend and introduction)
        const requests = await storage.getAllReceivedRequests(req.user.id);
        console.log(
          `[intro-requests/received] User ${req.user.id} has ${requests.length} received requests`
        );
        requests.forEach((r) => {
          console.log(
            `  - Request ${r.id}: type=${r.type}, from=${r.fromUserId}, to=${r.toUserId}, via=${r.viaUserId}, status=${r.status}, connectorStatus=${r.connectorStatus}, targetStatus=${r.targetStatus}`
          );
        });
        res.json(requests);
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }
  );

  app.patch(
    "/api/intro-requests/:id/approve",
    requireAuth,
    async (req: any, res) => {
      try {
        const request = await storage.getIntroRequest(req.params.id);
        if (!request) {
          return res.status(404).json({ message: "Request not found" });
        }

        const currentUserId = req.user.id;

        // Handle FRIEND requests
        if (request.type === "friend") {
          if (request.toUserId !== currentUserId) {
            return res.status(403).json({
              message: "Forbidden - not authorized to approve this request",
            });
          }
          if (request.status !== "pending") {
            return res
              .status(400)
              .json({ message: "Request already processed" });
          }

          console.log(
            `[FRIEND REQUEST APPROVAL] User ${currentUserId} approved friend request from ${request.fromUserId}`
          );

          // Update status to approved
          const updated = await storage.updateIntroRequestStatus(
            request.id,
            "approved"
          );

          // Add them as friends
          await storage.addFriend(request.fromUserId, request.toUserId);

          console.log(
            `[FRIENDS ADDED] ${request.fromUserId} and ${request.toUserId} are now friends!`
          );

          res.json(updated);
          return;
        }

        // Handle INTRODUCTION requests (two-stage flow)
        // Stage 1: Connector (viaUser) approves
        if (
          request.viaUserId === currentUserId &&
          request.connectorStatus === "pending"
        ) {
          console.log(
            `[STAGE 1 APPROVAL] Connector ${currentUserId} approved request ${request.id}`
          );
          console.log(
            `  Request: ${request.fromUserId} wants to meet ${request.toUserId} via ${request.viaUserId}`
          );

          // Update connectorStatus to approved, targetStatus stays pending
          const updated = await storage.updateIntroRequestConnectorStatus(
            request.id,
            "approved"
          );

          console.log(
            `[STAGE 2 CREATED] Target ${request.toUserId} will now see this request in their Received tab`
          );

          res.json(updated);
          return;
        }

        // Stage 2: Target (toUser) approves
        if (
          request.toUserId === currentUserId &&
          request.connectorStatus === "approved" &&
          request.targetStatus === "pending"
        ) {
          console.log(
            `[STAGE 2 APPROVAL] Target ${currentUserId} approved request ${request.id}`
          );
          console.log(
            `  Request: ${request.fromUserId} wants to meet ${request.toUserId} via ${request.viaUserId}`
          );

          // Update targetStatus to approved and overall status
          const updated = await storage.updateIntroRequestTargetStatus(
            request.id,
            "approved"
          );

          // Now add fromUserId and toUserId as friends
          await storage.addFriend(request.fromUserId, request.toUserId);

          console.log(
            `[FRIENDS ADDED] ${request.fromUserId} and ${request.toUserId} are now friends!`
          );

          res.json(updated);
          return;
        }

        // User is not authorized to approve this request at this stage
        console.log(
          `[APPROVAL DENIED] User ${currentUserId} cannot approve request ${request.id}`
        );
        console.log(
          `  viaUserId=${request.viaUserId}, toUserId=${request.toUserId}`
        );
        console.log(
          `  connectorStatus=${request.connectorStatus}, targetStatus=${request.targetStatus}`
        );
        return res.status(403).json({
          message: "Forbidden - not authorized to approve at this stage",
        });
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }
  );

  app.patch(
    "/api/intro-requests/:id/decline",
    requireAuth,
    async (req: any, res) => {
      try {
        const request = await storage.getIntroRequest(req.params.id);
        if (!request) {
          return res.status(404).json({ message: "Request not found" });
        }

        const currentUserId = req.user.id;

        // Handle FRIEND requests
        if (request.type === "friend") {
          if (request.toUserId !== currentUserId) {
            return res.status(403).json({
              message: "Forbidden - not authorized to decline this request",
            });
          }
          if (request.status !== "pending") {
            return res
              .status(400)
              .json({ message: "Request already processed" });
          }

          console.log(
            `[FRIEND REQUEST DECLINE] User ${currentUserId} declined friend request from ${request.fromUserId}`
          );

          // Update status to declined
          const updated = await storage.updateIntroRequestStatus(
            request.id,
            "declined"
          );

          res.json(updated);
          return;
        }

        // Handle INTRODUCTION requests
        // Stage 1: Connector (viaUser) declines
        if (
          request.viaUserId === currentUserId &&
          request.connectorStatus === "pending"
        ) {
          console.log(
            `[STAGE 1 DECLINE] Connector ${currentUserId} declined request ${request.id}`
          );
          const updated = await storage.updateIntroRequestConnectorStatus(
            request.id,
            "declined"
          );
          res.json(updated);
          return;
        }

        // Stage 2: Target (toUser) declines
        if (
          request.toUserId === currentUserId &&
          request.connectorStatus === "approved" &&
          request.targetStatus === "pending"
        ) {
          console.log(
            `[STAGE 2 DECLINE] Target ${currentUserId} declined request ${request.id}`
          );
          const updated = await storage.updateIntroRequestTargetStatus(
            request.id,
            "declined"
          );
          res.json(updated);
          return;
        }

        // User is not authorized to decline this request at this stage
        console.log(
          `[DECLINE DENIED] User ${currentUserId} cannot decline request ${request.id}`
        );
        return res.status(403).json({
          message: "Forbidden - not authorized to decline at this stage",
        });
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }
  );

  // Delete user account
  app.delete("/api/users/:id", requireAuth, async (req: any, res) => {
    try {
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteUser(req.params.id);
      req.logout(() => {
        res.json({ message: "Account deleted successfully" });
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Friends of friends
  app.get("/api/friends/fof", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || !user.friends || user.friends.length === 0) {
        return res.json([]);
      }

      // Get all friends
      const friends = await storage.getUsersByIds(user.friends);

      // Collect all friends-of-friends (excluding self and direct friends)
      const fofIds = new Set<string>();
      for (const friend of friends) {
        if (friend.friends) {
          for (const fofId of friend.friends) {
            if (fofId !== req.user.id && !user.friends.includes(fofId)) {
              fofIds.add(fofId);
            }
          }
        }
      }

      if (fofIds.size === 0) {
        return res.json([]);
      }

      const fofUsers = await storage.getUsersByIds(Array.from(fofIds));
      const fofWithoutPasswords = fofUsers.map(({ password, ...u }) => ({
        ...u,
        mutualFriends: friends
          .filter((f) => f.friends?.includes(u.id))
          .map((f) => ({
            id: f.id,
            fullName: f.fullName,
            photoURL: f.photoURL,
          })),
      }));

      res.json(fofWithoutPasswords);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Activity history (all intro requests involving user)
  app.get("/api/activity", requireAuth, async (req: any, res) => {
    try {
      const requests = await storage.getAllIntroRequestsForUser(req.user.id);
      res.json(requests);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Settings routes
  app.get("/api/settings", requireAuth, async (req: any, res) => {
    try {
      let settings = await storage.getSettings(req.user.id);
      if (!settings) {
        settings = await storage.createSettings(req.user.id);
      }
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/settings", requireAuth, async (req: any, res) => {
    try {
      const parsed = updateSettingsSchema.parse(req.body);
      let settings = await storage.getSettings(req.user.id);
      if (!settings) {
        settings = await storage.createSettings(req.user.id);
      }
      const updated = await storage.updateSettings(req.user.id, parsed);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  return httpServer;
}
