import { defineApp } from "convex/server";
import convexCascadingDeletes from "../../src/component/convex.config.js";

const app = defineApp();
app.use(convexCascadingDeletes);

export default app;
