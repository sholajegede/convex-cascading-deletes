import { describe, expect, test } from "vitest";
import { CascadingDeletes } from "./index.js";
import { components } from "./setup.test.js";

describe("CascadingDeletes client", () => {
  test("instantiates with required options", () => {
    const client = new CascadingDeletes(components.convexCascadingDeletes, {
      relationships: [],
    });
    expect(client).toBeDefined();
    expect(client.component).toBeDefined();
  });
});
