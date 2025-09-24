import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

// Save user's pulse preferences during onboarding
export const savePulsePreferences = mutation({
  args: {
    selectedPulses: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Use the SAME auth pattern as your users.ts
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Find the Convex user document using tokenIdentifier (same as users.ts)
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError("User not found in database");
    }

    const now = Date.now();

    // Check if preferences already exist
    const existing = await ctx.db
      .query("userPulsePreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      // Update existing preferences
      return await ctx.db.patch(existing._id, {
        selectedPulses: args.selectedPulses,
        onboardingCompleted: true,
        updatedAt: now,
      });
    } else {
      // Create new preferences
      return await ctx.db.insert("userPulsePreferences", {
        userId: user._id,
        selectedPulses: args.selectedPulses,
        onboardingCompleted: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get user's pulse preferences
export const getUserPulsePreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Find the Convex user document
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return null;

    return await ctx.db
      .query("userPulsePreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});

// Check if user has completed onboarding
export const hasCompletedOnboarding = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    // Find the Convex user document
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return false;

    const preferences = await ctx.db
      .query("userPulsePreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return preferences?.onboardingCompleted ?? false;
  },
});
