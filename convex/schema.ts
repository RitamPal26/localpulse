import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    // The unique ID from your auth provider (Clerk)
    tokenIdentifier: v.string(),
    // Add any other app-specific fields here
  }).index("by_token", ["tokenIdentifier"]), // Index for fast lookups
});