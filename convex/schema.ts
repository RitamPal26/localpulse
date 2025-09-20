import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  accounts: defineTable({
    access_token: v.optional(v.string()),
    expires_at: v.optional(v.number()), // Changed from v.float64()
    id_token: v.optional(v.string()),
    password: v.optional(v.string()),
    provider: v.string(),
    providerAccountId: v.string(),
    refresh_token: v.optional(v.string()),
    scope: v.optional(v.string()),
    session_state: v.optional(v.string()),
    token_type: v.optional(v.string()),
    type: v.string(),
    userId: v.id("users"), // Changed to reference users table
    salt: v.optional(v.string()), // Add salt field for password hashing
  }).index("by_userId", ["userId"])
    .index("by_provider_and_providerAccountId", ["provider", "providerAccountId"]),

  sessions: defineTable({
    expires: v.number(), // Changed from v.float64()
    sessionToken: v.string(),
    userId: v.id("users"), // Changed to reference users table
  }).index("by_sessionToken", ["sessionToken"])
    .index("by_userId", ["userId"]),

  users: defineTable({
    createdAt: v.number(), // Changed from optional v.float64()
    email: v.string(),
    emailVerified: v.optional(v.boolean()),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    updatedAt: v.number(), // Changed from optional v.float64()
  }).index("by_email", ["email"]),

  verificationTokens: defineTable({
    expires: v.number(), 
    identifier: v.string(),
    token: v.string(),
  }).index("by_identifier_token", ["identifier", "token"]),
});
