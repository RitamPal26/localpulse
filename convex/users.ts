// convex/users.ts

import { mutation } from "./_generated/server";
import { ConvexError } from "convex/values";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get the user's identity from the auth token
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Called storeUser but user is not authenticated.");
    }

    // 2. Check if the user already exists in our database
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    // 3. If the user already exists, just return their ID
    if (user !== null) {
      // You could also update user details here if they've changed
      return user._id;
    }

    // 4. If it's a new user, create a new record
    const newUser = await ctx.db.insert("users", {
      name: identity.name!,
      email: identity.email!,
      tokenIdentifier: identity.tokenIdentifier,
      //credits: 10, // Example: Give new users some credits
    });

    return newUser;
  },
});