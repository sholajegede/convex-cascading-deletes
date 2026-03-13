/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    lib: {
      getDeletionLog: FunctionReference<
        "query",
        "internal",
        { rootId: string; rootTable: string },
        null | {
          _creationTime: number;
          _id: string;
          deletedAt: number;
          deletedCounts: string;
          rootId: string;
          rootTable: string;
        },
        Name
      >;
      listDeletionLogs: FunctionReference<
        "query",
        "internal",
        {},
        Array<{
          _creationTime: number;
          _id: string;
          deletedAt: number;
          deletedCounts: string;
          rootId: string;
          rootTable: string;
        }>,
        Name
      >;
      recordDeletion: FunctionReference<
        "mutation",
        "internal",
        { deletedCounts: string; rootId: string; rootTable: string },
        null,
        Name
      >;
      validateIndexes: FunctionReference<
        "mutation",
        "internal",
        {
          relationships: Array<{
            fieldName: string;
            indexName: string;
            sourceTable: string;
            targetTable: string;
          }>;
        },
        null,
        Name
      >;
    };
  };
