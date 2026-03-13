/// <reference types="vite/client" />
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api } from "./_generated/api.js";
import { initConvexTest } from "./setup.test.js";

describe("component lib", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test("getDeletionLog returns null when nothing deleted", async () => {
    const t = initConvexTest();
    const result = await t.query(api.lib.getDeletionLog, {
      rootTable: "users",
      rootId: "abc123",
    });
    expect(result).toBeNull();
  });
});
