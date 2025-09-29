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
    aiSummary: v.string(),
    amenities: v.optional(v.string()),
    area: v.optional(v.string()),
    bedrooms: v.optional(v.string()),
    category: v.optional(v.string()),
    contentType: v.string(),
    cuisine: v.optional(v.string()),
    description: v.string(),
    eventDate: v.optional(v.string()),
    location: v.string(),
    priceRange: v.optional(v.string()),
    pulseId: v.string(),
    rating: v.optional(v.float64()),
    rent: v.optional(v.string()),
    scrapedAt: v.float64(),
    source: v.string(),
    sourceUrl: v.string(),
    tags: v.array(v.string()),
    title: v.string(),
    venue: v.optional(v.string()),

    // ADD THESE MISSING FIELDS:
    //contactInfo: v.optional(v.string()), // ← This was missing!
    organizer: v.optional(v.string()),
    publishedTime: v.optional(v.string()),
    ticketPrice: v.optional(v.string()),

    // Enhanced AI fields:
    highlights: v.optional(v.array(v.string())),
    callToAction: v.optional(v.string()),
    localContext: v.optional(v.string()),
    extractedData: v.optional(v.any()),
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
