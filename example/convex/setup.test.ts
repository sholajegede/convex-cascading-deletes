import { convexTest } from "convex-test";
import schema from "./schema.js";
import { test } from "vitest";

export function initConvexTest() {
  return convexTest(schema);
}

test("placeholder", () => {});
