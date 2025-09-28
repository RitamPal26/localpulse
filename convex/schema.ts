import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  collections: defineTable({
    createdAt: v.float64(),
    description: v.optional(v.string()), // ← Keep this line
    items: v.array(v.string()),
    name: v.string(),
    updatedAt: v.float64(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]), // ← CRITICAL: Keep this index!

  pulseContent: defineTable({
    // Core fields
    aiSummary: v.optional(v.string()),
    contentType: v.string(),
    description: v.string(),
    location: v.optional(v.string()),
    pulseId: v.string(),
    scrapedAt: v.float64(),
    source: v.string(),
    sourceUrl: v.string(),
    tags: v.array(v.string()),
    title: v.string(),

    // Restaurant fields
    cuisine: v.optional(v.string()),
    priceRange: v.optional(v.string()),
    rating: v.optional(v.float64()),

    // Event/Meetup fields
    eventDate: v.optional(v.string()),
    venue: v.optional(v.string()),
    category: v.optional(v.string()),
    organizer: v.optional(v.string()),
    ticketPrice: v.optional(v.string()),

    // News fields
    publishedTime: v.optional(v.string()),

    // Apartment fields
    rent: v.optional(v.string()),
    bedrooms: v.optional(v.string()),
    area: v.optional(v.string()),
    amenities: v.optional(v.string()),
    furnishing: v.optional(v.string()),
  })
    .index("by_content_type", ["contentType"]) // ← Keep indices
    .index("by_pulse", ["pulseId"]),

  userPulsePreferences: defineTable({
    createdAt: v.float64(),
    onboardingCompleted: v.boolean(),
    selectedPulses: v.array(v.string()),
    updatedAt: v.float64(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]), // ← CRITICAL: Keep this index!

  users: defineTable({
    createdAt: v.optional(v.float64()),
    email: v.string(),
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]), // ← CRITICAL: Keep this index!
});
