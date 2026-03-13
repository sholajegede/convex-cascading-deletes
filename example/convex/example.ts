import { action, query } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { CascadingDeletes } from "../../src/client/index.js";
import { v } from "convex/values";

const cascadingDeletes = new CascadingDeletes(components.convexCascadingDeletes, {
  relationships: [],
});

export const deleteWithCascade = action({
  args: { table: v.string(), id: v.string() },
  handler: async (ctx, args) => {
    return await cascadingDeletes.deleteWithCascade(ctx, args);
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
