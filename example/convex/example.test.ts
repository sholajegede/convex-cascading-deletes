import { describe, expect, test } from "vitest";
import { initConvexTest } from "./setup.test";
import { api } from "./_generated/api";

describe("cascading deletes example", () => {
  test("getDeletionLog returns null when nothing deleted", async () => {
    const t = initConvexTest();
    const result = await t.query(api.example.getDeletionLog, {
      table: "users",
      id: "abc123",
    });
    expect(result).toBeNull();
  });
});
