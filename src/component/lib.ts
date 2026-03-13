import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
} from "./_generated/server.js";

export const logDeletion = internalMutation({
  args: {
    rootTable: v.string(),
    rootId: v.string(),
    deletedCounts: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("deletionLogs")
      .withIndex("by_root", (q) =>
        q.eq("rootTable", args.rootTable).eq("rootId", args.rootId),
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        deletedCounts: args.deletedCounts,
        deletedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("deletionLogs", {
        rootTable: args.rootTable,
        rootId: args.rootId,
        deletedCounts: args.deletedCounts,
        deletedAt: Date.now(),
      });
    }
    return null;
  },
});

export const recordDeletion = mutation({
  args: {
    rootTable: v.string(),
    rootId: v.string(),
    deletedCounts: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("deletionLogs")
      .withIndex("by_root", (q) =>
        q.eq("rootTable", args.rootTable).eq("rootId", args.rootId),
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        deletedCounts: args.deletedCounts,
        deletedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("deletionLogs", {
        rootTable: args.rootTable,
        rootId: args.rootId,
        deletedCounts: args.deletedCounts,
        deletedAt: Date.now(),
      });
    }
    return null;
  },
});

export const getDeletionLog = query({
  args: {
    rootTable: v.string(),
    rootId: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      rootTable: v.string(),
      rootId: v.string(),
      deletedCounts: v.string(),
      deletedAt: v.number(),
      _id: v.id("deletionLogs"),
      _creationTime: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deletionLogs")
      .withIndex("by_root", (q) =>
        q.eq("rootTable", args.rootTable).eq("rootId", args.rootId),
      )
      .first();
  },
});

export const validateIndexes = mutation({
  args: {
    relationships: v.array(v.object({
      sourceTable: v.string(),
      targetTable: v.string(),
      indexName: v.string(),
      fieldName: v.string(),
    })),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    for (const rel of args.relationships) {
      if (!rel.sourceTable || !rel.targetTable || !rel.indexName || !rel.fieldName) {
        throw new Error(`Invalid relationship config: ${JSON.stringify(rel)}`);
      }
    }
    return null;
  },
});

export const listDeletionLogs = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("deletionLogs"),
    _creationTime: v.number(),
    rootTable: v.string(),
    rootId: v.string(),
    deletedCounts: v.string(),
    deletedAt: v.number(),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("deletionLogs").order("desc").take(50);
  },
});
