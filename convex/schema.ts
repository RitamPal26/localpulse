import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    createdAt: v.optional(v.number()),
  }).index("by_token", ["tokenIdentifier"]), // Index for fast lookups

  userPulsePreferences: defineTable({
    userId: v.id("users"), // references your existing users table
    selectedPulses: v.array(v.string()),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Content for the feed (we'll add this later)
  pulseContent: defineTable({
    pulseId: v.string(),
    title: v.string(),
    description: v.string(),
    source: v.string(),
    sourceUrl: v.string(),
    scrapedAt: v.number(),
    location: v.optional(v.string()),
    tags: v.array(v.string()),
  }).index("by_pulse", ["pulseId"]),

  // User's saved collections
  collections: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    items: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
