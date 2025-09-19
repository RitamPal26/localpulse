// convex/auth.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store for current sessions (simple approach)
const sessions = new Map<string, { userId: string, email: string, name: string }>();

// Query to get current user session
export const getCurrentUser = query({
  args: { sessionId: v.optional(v.string()) },
  handler: async (ctx, { sessionId }) => {
    if (!sessionId) return null;
    
    const session = sessions.get(sessionId);
    if (!session) return null;
    
    // Get full user data from database
    const user = await ctx.db.get(session.userId as any);
    return user ? { ...user, sessionId } : null;
  },
});

// Mutation for signing up
export const signUp = mutation({
  args: { 
    email: v.string(), 
    password: v.string(), 
    name: v.string() 
  },
  handler: async (ctx, { email, password, name }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const userId = await ctx.db.insert("users", {
      email,
      name,
      passwordHash: password,
      createdAt: Date.now(),
    });

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random()}`;
    sessions.set(sessionId, { userId: userId as string, email, name });

    return { 
      success: true, 
      user: { id: userId, email, name },
      sessionId
    };
  },
});

// Mutation for signing in
export const signIn = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    if (!user || user.passwordHash !== password) {
      throw new Error("Invalid email or password");
    }

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random()}`;
    sessions.set(sessionId, { 
      userId: user._id as string, 
      email: user.email, 
      name: user.name 
    });

    return { 
      success: true, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name 
      },
      sessionId
    };
  },
});

// Mutation for signing out
export const signOut = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    sessions.delete(sessionId);
    return { success: true };
  },
});
