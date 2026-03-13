import { action, mutation, query } from "./_generated/server.js";
import { components, api } from "./_generated/api.js";
import { CascadingDeletes } from "../../src/client/index.js";
import { v } from "convex/values";
import { GenericId } from "convex/values";

const cascadingDeletes = new CascadingDeletes(components.convexCascadingDeletes, {
  relationships: [
    { sourceTable: "posts", targetTable: "users", indexName: "by_user", fieldName: "userId" },
    { sourceTable: "comments", targetTable: "posts", indexName: "by_post", fieldName: "postId" },
  ],
});

const NAMES = ["Alice", "Marcus", "Yuki", "Priya", "Tobias", "Zara", "Eliot", "Nadia"];
const POSTS = [
  ["Getting started with Convex", "Why I switched from Postgres", "Building real-time apps"],
  ["The case for reactive databases", "Serverless is not what I expected", "My stack in 2025"],
  ["Ship faster with components", "Stop polling, start reacting", "Full-stack TypeScript tips"],
  ["Database design patterns", "When to use indexes", "Mutations vs actions explained"],
  ["Open source contributions", "Reading other people's code", "Code review etiquette"],
  ["Deploying on a budget", "Edge functions in practice", "Vercel vs Fly vs Railway"],
  ["Testing async code", "Mocking Convex in tests", "Integration tests that actually work"],
  ["Design systems from scratch", "Dark mode done right", "CSS you'll actually remember"],
];
const COMMENTS = [
  ["This is exactly what I needed.", "Saved me hours of debugging."],
  ["Really well explained!", "Going to try this today."],
  ["Underrated post.", "More of this please."],
  ["Bookmarked.", "Shared with my whole team."],
  ["Finally someone said it.", "This changed how I think about it."],
  ["Clean and concise.", "Would love a follow-up on this."],
  ["Just implemented this.", "Works perfectly, thanks!"],
  ["Didn't know about this.", "Mind blown honestly."],
];

export const seed = mutation({
  args: {},
  returns: v.object({ userId: v.id("users"), postCount: v.number(), commentCount: v.number() }),
  handler: async (ctx) => {
    const existing = await ctx.db.query("users").collect();
    const idx = existing.length % NAMES.length;
    const name = NAMES[idx];
    const postTitles = POSTS[idx];
    const userId = await ctx.db.insert("users", { name });
    let commentCount = 0;
    for (let i = 0; i < postTitles.length; i++) {
      const postId = await ctx.db.insert("posts", { userId, title: postTitles[i] });
      const commentPair = COMMENTS[(idx + i) % COMMENTS.length];
      for (const text of commentPair) {
        await ctx.db.insert("comments", { postId, text });
        commentCount++;
      }
    }
    return { userId, postCount: postTitles.length, commentCount };
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return await Promise.all(
      users.map(async (user) => {
        const posts = await ctx.db
          .query("posts")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        const postsWithComments = await Promise.all(
          posts.map(async (post) => {
            const comments = await ctx.db
              .query("comments")
              .withIndex("by_post", (q) => q.eq("postId", post._id))
              .collect();
            return { ...post, comments };
          }),
        );
        return { ...user, posts: postsWithComments };
      }),
    );
  },
});

export const getPostsByUser = query({
  args: { userId: v.string() },
  returns: v.array(v.string()),
  handler: async (ctx, args): Promise<string[]> => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as GenericId<"users">))
      .collect();
    return posts.map((p) => p._id as string);
  },
});

export const getCommentsByPost = query({
  args: { postId: v.string() },
  returns: v.array(v.string()),
  handler: async (ctx, args): Promise<string[]> => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId as GenericId<"posts">))
      .collect();
    return comments.map((c) => c._id as string);
  },
});

export const deleteRecord = mutation({
  args: { table: v.string(), id: v.string() },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await ctx.db.delete(args.id as GenericId<any>);
    return null;
  },
});

export const deleteWithCascade = action({
  args: { table: v.string(), id: v.string() },
  returns: v.record(v.string(), v.number()),
  handler: async (ctx, args): Promise<Record<string, number>> => {
    return await cascadingDeletes.deleteWithCascade(ctx, {
      table: args.table,
      id: args.id,
      resolver: async (sourceTable: string, _parentTable: string, parentId: string): Promise<string[]> => {
        if (sourceTable === "posts") {
          return await ctx.runQuery(api.example.getPostsByUser, { userId: parentId });
        }
        if (sourceTable === "comments") {
          return await ctx.runQuery(api.example.getCommentsByPost, { postId: parentId });
        }
        return [];
      },
      deleter: async (table: string, id: string): Promise<void> => {
        await ctx.runMutation(api.example.deleteRecord, { table, id });
      },
    });
  },
});

export const getDeletionLog = query({
  args: { table: v.string(), id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.runQuery(components.convexCascadingDeletes.lib.getDeletionLog, {
      rootTable: args.table,
      rootId: args.id,
    });
  },
});

export const listDeletionLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.runQuery(components.convexCascadingDeletes.lib.listDeletionLogs, {});
  },
});
