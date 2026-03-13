import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
  }),
  posts: defineTable({
    userId: v.string(),
    title: v.string(),
  }).index("by_user", ["userId"]),
  comments: defineTable({
    postId: v.string(),
    text: v.string(),
  }).index("by_post", ["postId"]),
});
