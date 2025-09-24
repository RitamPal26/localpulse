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

// Save an item to a collection (or create default collection)
export const saveToCollection = mutation({
  args: {
    itemId: v.string(), // For now, we'll use mock data IDs
    collectionName: v.optional(v.string()),
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

    const collectionName = args.collectionName || "Saved Items";

    // Find or create the collection
    let collection = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("name"), collectionName))
      .first();

    if (!collection) {
      // Create new collection
      const collectionId = await ctx.db.insert("collections", {
        userId: user._id,
        name: collectionName,
        items: [args.itemId],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return collectionId;
    } else {
      // Add to existing collection (avoid duplicates)
      const currentItems = collection.items || [];
      if (!currentItems.includes(args.itemId)) {
        await ctx.db.patch(collection._id, {
          items: [...currentItems, args.itemId],
          updatedAt: Date.now(),
        });
      }
      return collection._id;
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
