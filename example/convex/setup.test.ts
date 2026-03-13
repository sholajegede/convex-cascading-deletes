import { convexTest } from "convex-test";
import schema from "./schema.js";

export function initConvexTest() {
  return convexTest(schema);
}
