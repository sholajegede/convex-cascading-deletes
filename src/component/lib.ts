import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server.js";
import { internal } from "./_generated/api.js";

const relationshipValidator = v.object({
  sourceTable: v.string(),
  targetTable: v.string(),
  indexName: v.string(),
  fieldName: v.string(),
});

const BATCH_SIZE = 64;

export const getDependentIds = internalQuery({
  args: {
    table: v.string(),
    indexName: v.string(),
    fieldName: v.string(),
    parentId: v.string(),
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const results = await (ctx.db as any)
      .query(args.table)
      .withIndex(args.indexName, (q: any) => q.eq(args.fieldName, args.parentId))
      .collect();
    return results.map((r: any) => r._id);
  },
});

export const deleteBatch = internalMutation({
  args: {
    table: v.string(),
    ids: v.array(v.string()),
    remainingIds: v.array(v.string()),
    rootTable: v.string(),
    rootId: v.string(),
    relationships: v.array(relationshipValidator),
    counts: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await (ctx.db as any).delete(args.table, id);
    }

    const counts: Record<string, number> = JSON.parse(args.counts);
    counts[args.table] = (counts[args.table] ?? 0) + args.ids.length;

    if (args.remainingIds.length > 0) {
      const nextBatch = args.remainingIds.slice(0, BATCH_SIZE);
      const remaining = args.remainingIds.slice(BATCH_SIZE);
      await ctx.scheduler.runAfter(0, internal.lib.deleteBatch, {
        table: args.table,
        ids: nextBatch,
        remainingIds: remaining,
        rootTable: args.rootTable,
        rootId: args.rootId,
        relationships: args.relationships,
        counts: JSON.stringify(counts),
      });
    } else {
      await ctx.scheduler.runAfter(0, internal.lib.logDeletion, {
        rootTable: args.rootTable,
        rootId: args.rootId,
        deletedCounts: JSON.stringify(counts),
      });
    }
    return null;
  },
});

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

export const deleteWithCascade = action({
  args: {
    table: v.string(),
    id: v.string(),
    relationships: v.array(relationshipValidator),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const counts: Record<string, number> = {};
    const visited = new Set<string>();

    async function cascade(table: string, id: string) {
      const key = `${table}:${id}`;
      if (visited.has(key)) return;
      visited.add(key);

      const dependents = args.relationships.filter(
        (r) => r.targetTable === table,
      );
      for (const rel of dependents) {
        const ids: string[] = await ctx.runQuery(internal.lib.getDependentIds, {
          table: rel.sourceTable,
          indexName: rel.indexName,
          fieldName: rel.fieldName,
          parentId: id,
        });
        for (const depId of ids) {
          await cascade(rel.sourceTable, depId);
        }
      }

      const firstBatch = [id].slice(0, BATCH_SIZE);
      const remaining = [id].slice(BATCH_SIZE);
      await ctx.runMutation(internal.lib.deleteBatch, {
        table,
        ids: firstBatch,
        remainingIds: remaining,
        rootTable: args.table,
        rootId: args.id,
        relationships: args.relationships,
        counts: JSON.stringify(counts),
      });
      counts[table] = (counts[table] ?? 0) + 1;
    }

    await cascade(args.table, args.id);

    return JSON.stringify(counts);
  },
});

export const validateIndexes = mutation({
  args: {
    relationships: v.array(relationshipValidator),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    for (const rel of args.relationships) {
      if (!rel.sourceTable || !rel.targetTable || !rel.indexName || !rel.fieldName) {
        throw new Error(
          `Invalid relationship config: ${JSON.stringify(rel)}. All fields are required.`,
        );
      }
    }
    return null;
  },
});
