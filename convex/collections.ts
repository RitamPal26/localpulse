import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

// Create a new collection
export const createCollection = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new ConvexError("User not found");

    return await ctx.db.insert("collections", {
      userId: user._id,
      name: args.name,
      description: args.description,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const saveToCollection = mutation({
  args: {
    itemId: v.id("pulseContent"),
    collectionName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
      
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Find a collection with the given name for the current user
    let collection = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("name"), args.collectionName))
      .first();

    // If the collection doesn't exist, create it
    if (!collection) {
      const collectionId = await ctx.db.insert("collections", {
        name: args.collectionName,
        userId: user._id,
        items: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      collection = await ctx.db.get(collectionId);
    }
    
    if (!collection) {
        throw new ConvexError("Could not find or create collection");
    }

    // Add the item to the collection if it's not already there
    if (!collection.items.includes(args.itemId)) {
      await ctx.db.patch(collection._id, {
        items: [...collection.items, args.itemId],
        updatedAt: Date.now(),
      });
      return { success: true, message: "Item saved!" };
    } else {
      return { success: true, message: "Item already in collection." };
    }
  },
});

// Get user's collections
export const getUserCollections = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Remove item from collection
export const removeFromCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new ConvexError("Collection not found");

    const updatedItems = (collection.items || []).filter(
      (id) => id !== args.itemId
    );

    await ctx.db.patch(args.collectionId, {
      items: updatedItems,
      updatedAt: Date.now(),
    });
  },
});

// Add this new query to get collections with resolved items
export const getUserCollectionsWithItems = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return [];

    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get all pulse content to resolve item IDs
    const allContent = await ctx.db.query("pulseContent").collect();

    // Helper function to transform pulse content to display format
    const transformItem = (item) => ({
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
    });

    // Resolve item IDs to actual items for each collection
    return collections.map((collection) => ({
      _id: collection._id,
      name: collection.name,
      description: collection.description,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      itemCount: collection.items?.length || 0,
      // Resolve items from IDs
      resolvedItems: (collection.items || [])
        .map((itemId) => {
          const pulseItem = allContent.find(
            (content) => content._id.toString() === itemId
          );
          return pulseItem ? transformItem(pulseItem) : null;
        })
        .filter((item) => item !== null), // Remove null items
    }));
  },
});

// Keep the helper functions at the bottom (copy from pulses.ts)
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
