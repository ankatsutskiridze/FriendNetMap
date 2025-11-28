import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { insertUserSchema, insertIntroRequestSchema, updateUserSchema, updateSettingsSchema } from "@shared/schema";
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
  stored: string,
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
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "friends-map-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport setup
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
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
  app.get("/api/users/search", requireAuth, async (req: any, res) => {
    try {
      const query = (req.query.q as string) || "";
      console.log(`[search] Query: "${query}", User ID: ${req.user.id}`);
      const users = await storage.searchUsers(query, req.user.id);
      console.log(`[search] Found ${users.length} results for query "${query}"`);
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (err: any) {
      console.error(`[search] Database error:`, err);
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

  // Friends routes
  app.post("/api/friends/:friendId", requireAuth, async (req: any, res) => {
    try {
      const friendId = req.params.friendId;
      const userId = req.user.id;
      
      if (userId === friendId) {
        return res.status(400).json({ message: "Cannot add yourself as a friend" });
      }
      
      const friend = await storage.getUser(friendId);
      if (!friend) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.addFriend(userId, friendId);
      res.json({ message: "Friend added successfully" });
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
      const friendsWithoutPasswords = friends.map(({ password, ...friend }) => friend);
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
      console.log(`[intro-requests/create] Creating request: from=${parsed.fromUserId}, to=${parsed.toUserId}, via=${parsed.viaUserId}`);
      
      // Verify the from user is the current user
      if (parsed.fromUserId !== req.user.id) {
        console.log(`[intro-requests/create] ERROR: fromUserId (${parsed.fromUserId}) !== currentUser (${req.user.id})`);
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
      console.log(`[intro-requests/create] Request created successfully: ${request.id}`);
      console.log(`[intro-requests/create] The VIA user (${parsed.viaUserId}) will see this in their Received tab`);
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
      console.log(`[intro-requests/sent] User ${req.user.id} has ${sent.length} sent requests`);
      sent.forEach(r => {
        console.log(`  - Request ${r.id}: from=${r.fromUserId}, to=${r.toUserId}, via=${r.viaUserId}, status=${r.status}`);
      });
      res.json(sent);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/intro-requests/received", requireAuth, async (req: any, res) => {
    try {
      // Get requests where I am the VIA user (connector) - I need to approve these
      const requests = await storage.getIntroRequestsViaUser(req.user.id);
      console.log(`[intro-requests/received] User ${req.user.id} has ${requests.length} received requests`);
      requests.forEach(r => {
        console.log(`  - Request ${r.id}: from=${r.fromUserId}, to=${r.toUserId}, via=${r.viaUserId}, status=${r.status}`);
      });
      res.json(requests);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/intro-requests/:id/approve", requireAuth, async (req: any, res) => {
    try {
      const request = await storage.getIntroRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      // Only the via user can approve
      if (request.viaUserId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Update status to approved
      const updated = await storage.updateIntroRequestStatus(req.params.id, "approved");
      
      // Add fromUserId and toUserId as friends
      await storage.addFriend(request.fromUserId, request.toUserId);
      
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/intro-requests/:id/decline", requireAuth, async (req: any, res) => {
    try {
      const request = await storage.getIntroRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      // Only the via user can decline
      if (request.viaUserId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updated = await storage.updateIntroRequestStatus(req.params.id, "declined");
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

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
        mutualFriends: friends.filter(f => f.friends?.includes(u.id)).map(f => ({ id: f.id, fullName: f.fullName, photoURL: f.photoURL }))
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
