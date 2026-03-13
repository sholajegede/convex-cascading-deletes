import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  deletionLogs: defineTable({
    rootTable: v.string(),
    rootId: v.string(),
    deletedCounts: v.string(), // JSON: { tableName: count }
    deletedAt: v.number(),
  }).index("by_root", ["rootTable", "rootId"]),
});
