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

export const getFeedContent = query({
  args: {},
  handler: async (ctx) => {
    console.log("getFeedContent called");

    const identity = await ctx.auth.getUserIdentity();
    console.log("Identity:", !!identity);

    if (!identity) {
      console.log("No identity, returning all content");
      // For testing, return all content if no auth
      const allContent = await ctx.db.query("pulseContent").collect();
      console.log("All content count:", allContent.length);
      return allContent
        .map((item) => ({
          id: item._id,
          pulseId: item.pulseId,
          title: item.title,
          description: item.aiSummary || item.description,
          source: item.source,
          sourceUrl: item.sourceUrl,
          scrapedAt: item.scrapedAt,
          location: item.location,
          tags: item.tags,
          pulseIcon: getPulseIcon(item.pulseId),
          pulseColor: getPulseColor(item.pulseId),
          timeAgo: getTimeAgo(item.scrapedAt),
          contentType: item.contentType,
          cuisine: item.cuisine,
          priceRange: item.priceRange,
          rating: item.rating,
        }))
        .sort((a, b) => b.scrapedAt - a.scrapedAt);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    console.log("User found:", !!user);

    if (!user) {
      console.log("No user found, returning all content");
      const allContent = await ctx.db.query("pulseContent").collect();
      return allContent
        .map((item) => ({
          id: item._id,
          pulseId: item.pulseId,
          title: item.title,
          description: item.aiSummary || item.description,
          source: item.source,
          sourceUrl: item.sourceUrl,
          scrapedAt: item.scrapedAt,
          location: item.location,
          tags: item.tags,
          pulseIcon: getPulseIcon(item.pulseId),
          pulseColor: getPulseColor(item.pulseId),
          timeAgo: getTimeAgo(item.scrapedAt),
          contentType: item.contentType,
          cuisine: item.cuisine,
          priceRange: item.priceRange,
          rating: item.rating,
        }))
        .sort((a, b) => b.scrapedAt - a.scrapedAt);
    }

    const userPulses = await ctx.db
      .query("userPulsePreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    console.log("User pulses:", userPulses?.selectedPulses);

    const allContent = await ctx.db.query("pulseContent").collect();
    console.log("Total content in DB:", allContent.length);

    let filteredContent = allContent;
    if (userPulses?.selectedPulses) {
      filteredContent = allContent.filter((item) =>
        userPulses.selectedPulses.includes(item.pulseId)
      );
      console.log("Filtered content count:", filteredContent.length);
    }

    return filteredContent
      .map((item) => ({
        id: item._id,
        pulseId: item.pulseId,
        title: item.title,
        description: item.aiSummary || item.description,
        source: item.source,
        sourceUrl: item.sourceUrl,
        scrapedAt: item.scrapedAt,
        location: item.location,
        tags: item.tags,
        pulseIcon: getPulseIcon(item.pulseId),
        pulseColor: getPulseColor(item.pulseId),
        timeAgo: getTimeAgo(item.scrapedAt),
        contentType: item.contentType,
        cuisine: item.cuisine,
        priceRange: item.priceRange,
        rating: item.rating,
      }))
      .sort((a, b) => b.scrapedAt - a.scrapedAt);
  },
});

// Add this temporary debug query
export const getRawFeedContent = query({
  args: {},
  handler: async (ctx) => {
    // Get ALL content without any filtering
    const allContent = await ctx.db.query("pulseContent").collect();
    console.log("Raw content count:", allContent.length);
    console.log("Sample item:", allContent[0]);
    return allContent;
  },
});

export const addPulseContent = mutation({
  args: {
    pulseId: v.string(),
    title: v.string(),
    description: v.string(),
    source: v.string(),
    sourceUrl: v.string(),
    scrapedAt: v.number(),
    location: v.optional(v.string()),
    contentType: v.string(),
    cuisine: v.optional(v.string()),
    priceRange: v.optional(v.string()),
    rating: v.optional(v.number()),
    eventDate: v.optional(v.string()),
    venue: v.optional(v.string()),
    aiSummary: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pulseContent", args);
  },
});

// Helper queries for data management
export const getAllPulseContent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pulseContent").collect();
  },
});

export const deletePulseContent = mutation({
  args: { id: v.id("pulseContent") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const getContentStats = query({
  args: {},
  handler: async (ctx) => {
    const allContent = await ctx.db.query("pulseContent").collect();

    const stats = {
      total: allContent.length,
      byPulse: {} as Record<string, number>,
      byContentType: {} as Record<string, number>,
      lastUpdated: Math.max(...allContent.map((c) => c.scrapedAt), 0),
    };

    allContent.forEach((item) => {
      stats.byPulse[item.pulseId] = (stats.byPulse[item.pulseId] || 0) + 1;
      stats.byContentType[item.contentType] =
        (stats.byContentType[item.contentType] || 0) + 1;
    });

    return stats;
  },
});

// Helper functions
function getPulseIcon(pulseId: string): string {
  const icons = {
    restaurants: "🍽️",
    events: "🎉",
    "tech-meetups": "💻",
    "local-news": "📰",
    apartments: "🏠",
  };
  return icons[pulseId] || "📍";
}

function getPulseColor(pulseId: string): string {
  const colors = {
    restaurants: "#FF6B6B",
    events: "#4ECDC4",
    "tech-meetups": "#FFEAA7",
    "local-news": "#45B7D1",
    apartments: "#96CEB4",
  };
  return colors[pulseId] || "#888888";
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
