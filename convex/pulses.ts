import { mutation, query, internalMutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { Doc } from "./_generated/dataModel";

const mapContentItem = (item: Doc<"pulseContent">) => ({
  id: item._id,
  pulseId: item.pulseId,
  title: item.title,
  description: item.aiSummary || item.description,
  source: item.source,
  sourceUrl: item.sourceUrl,
  scrapedAt: item.scrapedAt,
  location: item.location,
  tags: item.tags,
  contentType: item.contentType,
  cuisine: item.cuisine,
  priceRange: item.priceRange,
  rating: item.rating,
  pulseIcon: getPulseIcon(item.pulseId),
  pulseColor: getPulseColor(item.pulseId),
  timeAgo: getTimeAgo(item.scrapedAt),
});

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

export const saveUserCity = mutation({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    return await ctx.db.patch(user._id, { city: args.city });
  },
});

export const getFeedContent = query({
  args: {
    city: v.optional(v.string()),
    // ADDED: Allow the app to specify which pulse types to show
    selectedPulses: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // 1. Determine the city to filter by
    let cityToFilter = args.city;
    let pulsesToFilter = args.selectedPulses;
    const identity = await ctx.auth.getUserIdentity();

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .unique();

      // If no city is passed, use the user's saved city as a default
      if (!cityToFilter && user?.city) {
        cityToFilter = user.city;
      }

      // If no pulse preferences are passed, use the user's saved preferences
      if (!pulsesToFilter) {
        const userPrefs = await ctx.db
          .query("userPulsePreferences")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        if (userPrefs?.selectedPulses && userPrefs.selectedPulses.length > 0) {
          pulsesToFilter = userPrefs.selectedPulses;
        }
      }
    }

    // 2. Fetch all content for the selected city (this is fast)
    let contentQuery;
    if (cityToFilter) {
      contentQuery = ctx.db
        .query("pulseContent")
        .withIndex("by_city", (q) => q.eq("city", cityToFilter));
    } else {
      // Fallback if no city is known
      contentQuery = ctx.db.query("pulseContent");
    }

    // Get all items for the city, ordered by most recent
    const cityContent = await contentQuery.order("desc").collect();

    // 3. Filter the city's content by pulse preferences
    if (pulsesToFilter && pulsesToFilter.length > 0) {
      const filteredContent = cityContent.filter((item) =>
        pulsesToFilter.includes(item.pulseId)
      );
      // Return content for the city that ALSO matches the user's preferences
      return filteredContent.map(mapContentItem);
    }

    // If no preferences, return all content for that city
    return cityContent.map(mapContentItem);
  },
});

export const addPulseContent = mutation({
  args: {
    pulseId: v.string(),
    title: v.string(),
    description: v.string(),
    source: v.string(),
    sourceUrl: v.string(),
    scrapedAt: v.float64(),
    location: v.optional(v.string()),
    contentType: v.string(),
    cuisine: v.optional(v.string()),
    priceRange: v.optional(v.string()),
    rating: v.optional(v.float64()),
    eventDate: v.optional(v.string()),
    venue: v.optional(v.string()),
    aiSummary: v.optional(v.string()),
    tags: v.array(v.string()),
    category: v.optional(v.string()),
    organizer: v.optional(v.string()),
    ticketPrice: v.optional(v.string()),
    publishedTime: v.optional(v.string()),
    rent: v.optional(v.string()),
    bedrooms: v.optional(v.string()),
    area: v.optional(v.string()),
    amenities: v.optional(v.string()),
    furnishing: v.optional(v.string()),
    city: v.string(),
    highlights: v.optional(v.array(v.string())),
    callToAction: v.optional(v.string()),
    localContext: v.optional(v.string()),
    extractedData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pulseContent", args);
  },
});

export const getPulseContentById = query({
  args: {
    id: v.id("pulseContent"), // Argument is the ID of the document
  },
  handler: async (ctx, args) => {
    const content = await ctx.db.get(args.id);
    if (!content) {
      return null;
    }
    // Reuse the mapping logic to keep the data shape consistent
    return mapContentItem(content);
  },
});

export const deleteAllPulseContent = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allContent = await ctx.db.query("pulseContent").collect();
    const deletePromises = allContent.map((doc) => ctx.db.delete(doc._id));
    await Promise.all(deletePromises);
    console.log(`🗑️ Cleared ${allContent.length} items.`);
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
    "weekend-events": "🎪", // ← UPDATE THIS (was "events")
    "tech-meetups": "💻",
    "local-news": "📰",
    "apartment-hunt": "🏠", // ← UPDATE THIS (was "apartments")
  };
  return icons[pulseId] || "📍";
}

function getPulseColor(pulseId: string): string {
  const colors = {
    restaurants: "#FF6B6B",
    "weekend-events": "#4ECDC4", // ← UPDATE THIS
    "tech-meetups": "#FFEAA7",
    "local-news": "#45B7D1",
    "apartment-hunt": "#96CEB4", // ← UPDATE THIS
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
