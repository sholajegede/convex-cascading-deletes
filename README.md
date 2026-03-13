# Convex Component Template

This is a Convex component, ready to be published on npm.

To create your own component:

1. Write code in src/component for your component. Component-specific tables,
   queries, mutations, and actions go here.
1. Write code in src/client for the Class that interfaces with the component.
   This is the bridge your users will access to get information into and out of
   your component
1. Write example usage in example/convex/example.ts.
1. Delete the text in this readme until `---` and flesh out the README.
1. Publish to npm with `npm run alpha` or `npm run release`.

To develop your component run a dev process in the example project:

```sh
npm i
npm run dev
```

`npm i` will do the install and an initial build. `npm run dev` will start a
file watcher to re-build the component, as well as the example project frontend
and backend, which does codegen and installs the component.

Modify the schema and index files in src/component/ to define your component.

Write a client for using this component in src/client/index.ts.

If you won't be adding frontend code (e.g. React components) to this component
you can delete "./react" references in package.json and "src/react/" directory.
If you will be adding frontend code, add a peer dependency on React in
package.json.

### Component Directory structure

```
.
├── README.md           documentation of your component
├── package.json        component name, version number, other metadata
├── package-lock.json   Components are like libraries, package-lock.json
│                       is .gitignored and ignored by consumers.
├── src
│   ├── component/
│   │   ├── _generated/ Files here are generated for the component.
│   │   ├── convex.config.ts  Name your component here and use other components
│   │   ├── lib.ts    Define functions here and in new files in this directory
│   │   └── schema.ts   schema specific to this component
│   ├── client/
│   │   └── index.ts    Code that needs to run in the app that uses the
│   │                   component. Generally the app interacts directly with
│   │                   the component's exposed API (src/component/*).
│   └── react/          Code intended to be used on the frontend goes here.
│       │               Your are free to delete this if this component
│       │               does not provide code.
│       └── index.ts
├── example/            example Convex app that uses this component
│   └── convex/
│       ├── _generated/       Files here are generated for the example app.
│       ├── convex.config.ts  Imports and uses this component
│       ├── myFunctions.ts    Functions that use the component
│       └── schema.ts         Example app schema
└── dist/               Publishing artifacts will be created here.
```

---

# Convex Convex Cascading Deletes

[![npm version](https://badge.fury.io/js/@example%2Fconvex-cascading-deletes.svg)](https://badge.fury.io/js/@example%2Fconvex-cascading-deletes)

<!-- START: Include on https://convex.dev/components -->

- [ ] What is some compelling syntax as a hook?
- [ ] Why should you use this component?
- [ ] Links to docs / other resources?

Found a bug? Feature request?
[File it here](https://github.com/sholajegede/convex-cascading-deletes/issues).

## Installation

Create a `convex.config.ts` file in your app's `convex/` folder and install the
component by calling `use`:

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import convexCascadingDeletes from "@sholajegede/convex-cascading-deletes/convex.config.js";

const app = defineApp();
app.use(convexCascadingDeletes);

export default app;
```

## Usage

```ts
import { components } from "./_generated/api";

export const addComment = mutation({
  args: { text: v.string(), targetId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.runMutation(components.convexCascadingDeletes.lib.add, {
      text: args.text,
      targetId: args.targetId,
      userId: await getAuthUserId(ctx),
    });
  },
});
```

See more example usage in [example.ts](./example/convex/example.ts).

### HTTP Routes

You can register HTTP routes for the component to expose HTTP endpoints:

```ts
import { httpRouter } from "convex/server";
import { registerRoutes } from "@sholajegede/convex-cascading-deletes";
import { components } from "./_generated/api";

const http = httpRouter();

registerRoutes(http, components.convexCascadingDeletes, {
  pathPrefix: "/comments",
});

export default http;
```

This will expose a GET endpoint that returns the most recent comment as JSON.
The endpoint requires a `targetId` query parameter. See
[http.ts](./example/convex/http.ts) for a complete example.

<!-- END: Include on https://convex.dev/components -->

Run the example:

```sh
npm i
npm run dev
```
