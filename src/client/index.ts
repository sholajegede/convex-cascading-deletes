import type { GenericActionCtx, GenericDataModel } from "convex/server";
import type { ComponentApi } from "../component/_generated/component.js";

export type Relationship = {
  sourceTable: string;
  targetTable: string;
  indexName: string;
  fieldName: string;
};

export class CascadingDeletes {
  constructor(
    public component: ComponentApi,
    private options: { relationships: Relationship[] },
  ) {}

  async deleteWithCascade(
    ctx: ActionCtx,
    args: {
      table: string;
      id: string;
      resolver: (sourceTable: string, parentTable: string, parentId: string) => Promise<string[]>;
      deleter: (table: string, id: string) => Promise<void>;
    },
  ): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    const visited = new Set<string>();

    const cascade = async (table: string, id: string) => {
      const key = `${table}:${id}`;
      if (visited.has(key)) return;
      visited.add(key);

      // First cascade into dependents
      const dependents = this.options.relationships.filter((r) => r.targetTable === table);
      for (const rel of dependents) {
        const ids = await args.resolver(rel.sourceTable, table, id);
        for (const depId of ids) {
          await cascade(rel.sourceTable, depId);
        }
      }

      // Then delete this record via app-provided deleter
      await args.deleter(table, id);
      counts[table] = (counts[table] ?? 0) + 1;
    };

    await cascade(args.table, args.id);

    // Log to component
    await ctx.runMutation(this.component.lib.recordDeletion, {
      rootTable: args.table,
      rootId: args.id,
      deletedCounts: JSON.stringify(counts),
    });

    return counts;
  }

  async getDeletionLog(ctx: QueryCtx, args: { table: string; id: string }) {
    return await ctx.runQuery(this.component.lib.getDeletionLog, {
      rootTable: args.table,
      rootId: args.id,
    });
  }

  getSafeDb(ctx: { db: any }) {
    return new Proxy(ctx.db, {
      get(target, prop) {
        if (prop === "delete") {
          throw new Error(
            "[convex-cascading-deletes] Direct ctx.db.delete() is disabled. Use deleteWithCascade() instead.",
          );
        }
        return target[prop];
      },
    });
  }
}

type ActionCtx = Pick<GenericActionCtx<GenericDataModel>, "runQuery" | "runMutation" | "runAction">;
type QueryCtx = Pick<GenericActionCtx<GenericDataModel>, "runQuery">;
