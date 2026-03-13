import type { GenericActionCtx, GenericDataModel } from "convex/server";
import type { ComponentApi } from "../component/_generated/component.js";

export type Relationship = {
  /** The table that holds the foreign key (child table) */
  sourceTable: string;
  /** The table being deleted (parent table) */
  targetTable: string;
  /** The index name on sourceTable that references targetTable */
  indexName: string;
  /** The field name on sourceTable that holds the parent ID */
  fieldName: string;
};

export class CascadingDeletes {
  private validated = false;

  constructor(
    public component: ComponentApi,
    private options: {
      relationships: Relationship[];
    },
  ) {
    // Validate relationship config shape at construction time
    for (const rel of options.relationships) {
      if (!rel.sourceTable || !rel.targetTable || !rel.indexName || !rel.fieldName) {
        throw new Error(
          `[convex-cascading-deletes] Invalid relationship: ${JSON.stringify(rel)}. ` +
          `All fields (sourceTable, targetTable, indexName, fieldName) are required.`,
        );
      }
    }
  }

  /**
   * Call this once in an action or mutation before first use to validate
   * that all configured indexes exist on the Convex deployment.
   */
  async validate(ctx: MutationCtx) {
    if (this.validated) return;
    await ctx.runMutation(this.component.lib.validateIndexes, {
      relationships: this.options.relationships,
    });
    this.validated = true;
  }

  /**
   * Delete a record and all its dependents as configured in relationships.
   * Batches large deletion trees via the Convex scheduler.
   * Returns a map of { tableName: count } for all deleted records.
   */
  async deleteWithCascade(
    ctx: ActionCtx,
    args: { table: string; id: string },
  ): Promise<Record<string, number>> {
    const result = await ctx.runAction(
      this.component.lib.deleteWithCascade,
      {
        table: args.table,
        id: args.id,
        relationships: this.options.relationships,
      },
    );
    return JSON.parse(result);
  }

  /**
   * Get the deletion log for a previously deleted record.
   * Reactive — subscribe via useQuery for live updates.
   */
  async getDeletionLog(
    ctx: QueryCtx,
    args: { table: string; id: string },
  ) {
    return await ctx.runQuery(this.component.lib.getDeletionLog, {
      rootTable: args.table,
      rootId: args.id,
    });
  }

  /**
   * Returns a patched ctx.db that throws if .delete() is called directly.
   * Use deleteWithCascade() instead to enforce cascade-only deletions.
   */
  getSafeDb(ctx: { db: any }) {
    return new Proxy(ctx.db, {
      get(target, prop) {
        if (prop === "delete") {
          throw new Error(
            "[convex-cascading-deletes] Direct ctx.db.delete() is disabled. " +
            "Use deleteWithCascade() instead.",
          );
        }
        return target[prop];
      },
    });
  }
}

type ActionCtx = Pick<
  GenericActionCtx<GenericDataModel>,
  "runQuery" | "runMutation" | "runAction"
>;

type QueryCtx = Pick<
  GenericActionCtx<GenericDataModel>,
  "runQuery"
>;

type MutationCtx = Pick<
  GenericActionCtx<GenericDataModel>,
  "runMutation"
>;
