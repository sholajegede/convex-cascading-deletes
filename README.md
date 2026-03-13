# @sholajegede/convex-cascading-deletes

A [Convex component](https://www.convex.dev/components) for managing cascading deletes across related documents. Configure relationships via your existing indexes — when you delete a record, all dependent records are cleaned up automatically.

[![npm version](https://badge.fury.io/js/@sholajegede%2Fconvex-cascading-deletes.svg)](https://badge.fury.io/js/@sholajegede%2Fconvex-cascading-deletes)
[![Convex Component](https://www.convex.dev/components/badge/sholajegede/convex-cascading-deletes)](https://www.convex.dev/components/sholajegede/convex-cascading-deletes)

Found a bug? Feature request? [File it here](https://github.com/sholajegede/convex-cascading-deletes/issues).

<!-- START: Include on https://convex.dev/components -->

## Features

- **Cascading deletes** — delete a record and all its dependents in one call
- **Relationship config** — declare relationships once using your existing indexes
- **Scheduler-based batching** — large deletion trees are processed in batches via the Convex scheduler; deletes within a batch are atomic
- **Circular relationship protection** — visited tracking prevents infinite loops
- **Safe db helper** — patch `ctx.db` to throw on direct `.delete()` calls, enforcing cascade-only deletions
- **Deletion logs** — every cascade is logged with a per-table count, queryable reactively
- **Index validation** — validate your relationship config against the deployment at startup

## Installation
```sh
npm install @sholajegede/convex-cascading-deletes
```

Add the component to your `convex/convex.config.ts`:
```ts
import { defineApp } from "convex/server";
import convexCascadingDeletes from "@sholajegede/convex-cascading-deletes/convex.config.js";

const app = defineApp();
app.use(convexCascadingDeletes);

export default app;
```

## Usage

Instantiate the client once, declaring your table relationships:
```ts
// convex/cascadeDeletes.ts
import { components } from "./_generated/api.js";
import { CascadingDeletes } from "@sholajegede/convex-cascading-deletes";

export const cascadingDeletes = new CascadingDeletes(components.convexCascadingDeletes, {
  relationships: [
    {
      sourceTable: "posts",      // child table
      targetTable: "users",      // parent table
      indexName: "by_user",      // index on posts that references users
      fieldName: "userId",       // field on posts that holds the user ID
    },
    {
      sourceTable: "comments",
      targetTable: "posts",
      indexName: "by_post",
      fieldName: "postId",
    },
  ],
});
```

### Delete with cascade
```ts
// convex/users.ts
import { action } from "./_generated/server.js";
import { cascadingDeletes } from "./cascadeDeletes.js";
import { v } from "convex/values";

export const deleteUser = action({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const counts = await cascadingDeletes.deleteWithCascade(ctx, {
      table: "users",
      id: args.userId,
    });
    // counts: { users: 1, posts: 4, comments: 12 }
    return counts;
  },
});
```

Deleting a user cascades to their posts, then to each post's comments — all automatically, in the correct order.

### Enforce cascade-only deletions
```ts
export const updatePost = mutation({
  args: { postId: v.id("posts"), title: v.string() },
  handler: async (ctx, args) => {
    const db = cascadingDeletes.getSafeDb(ctx);
    // db.delete() now throws — use deleteWithCascade instead
    await db.patch(args.postId, { title: args.title }); // fine
  },
});
```

### Query deletion logs
```ts
// convex/logs.ts
import { query } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { v } from "convex/values";

export const getDeletionLog = query({
  args: { table: v.string(), id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.runQuery(components.convexCascadingDeletes.lib.getDeletionLog, {
      rootTable: args.table,
      rootId: args.id,
    });
  },
});
```
```tsx
// React — subscribes reactively
const log = useQuery(api.logs.getDeletionLog, { table: "users", id: userId });
// log.deletedCounts — JSON string: { "users": 1, "posts": 4, "comments": 12 }
// log.deletedAt     — timestamp of when the cascade ran
```

### Validate indexes at startup
```ts
export const onStartup = mutation({
  handler: async (ctx) => {
    await cascadingDeletes.validate(ctx);
  },
});
```

## API

### `CascadingDeletes` class

| Method | Description |
|--------|-------------|
| `deleteWithCascade(ctx, { table, id })` | Delete a record and all configured dependents. Returns `{ [table]: count }`. |
| `getDeletionLog(ctx, { table, id })` | Query the deletion log for a previously deleted record. |
| `getSafeDb(ctx)` | Returns a patched `ctx.db` that throws on `.delete()`. |
| `validate(ctx)` | Validates all configured relationships against the deployment. |

### Relationship config

| Field | Description |
|-------|-------------|
| `sourceTable` | The child table (holds the foreign key) |
| `targetTable` | The parent table (the one being deleted) |
| `indexName` | Index on `sourceTable` that references `targetTable` |
| `fieldName` | Field on `sourceTable` that holds the parent ID |

<!-- END: Include on https://convex.dev/components -->

## Development
```sh
npm i
npm run dev
```

## License

Apache-2.0