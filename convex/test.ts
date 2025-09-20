import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addTestUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      emailVerified: false,
    });
    return userId;
  },
});
