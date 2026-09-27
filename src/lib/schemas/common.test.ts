import { describe, expect, it } from "vitest";

import { paginationQuerySchema, staffRoleSchema } from "./common";

describe("paginationQuerySchema", () => {
  it("applies default values when page/perPage are omitted", () => {
    const result = paginationQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(20);
  });

  it("accepts page=1 (lower boundary)", () => {
    const result = paginationQuerySchema.safeParse({ page: "1" });
    expect(result.success).toBe(true);
  });

  it("rejects page=0", () => {
    const result = paginationQuerySchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative page", () => {
    const result = paginationQuerySchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer page", () => {
    const result = paginationQuerySchema.safeParse({ page: "1.5" });
    expect(result.success).toBe(false);
  });

  it("accepts perPage=1 (lower boundary)", () => {
    const result = paginationQuerySchema.safeParse({ perPage: "1" });
    expect(result.success).toBe(true);
  });

  it("accepts perPage=100 (upper boundary)", () => {
    const result = paginationQuerySchema.safeParse({ perPage: "100" });
    expect(result.success).toBe(true);
  });

  it("rejects perPage=101 (beyond upper boundary)", () => {
    const result = paginationQuerySchema.safeParse({ perPage: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects perPage=0", () => {
    const result = paginationQuerySchema.safeParse({ perPage: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative perPage", () => {
    const result = paginationQuerySchema.safeParse({ perPage: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer perPage", () => {
    const result = paginationQuerySchema.safeParse({ perPage: "1.5" });
    expect(result.success).toBe(false);
  });

  it("returns a Japanese error message when page is not a number", () => {
    const result = paginationQuerySchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "pageは数値で指定してください。",
      );
    }
  });

  it("returns a Japanese error message when perPage exceeds the upper boundary", () => {
    const result = paginationQuerySchema.safeParse({ perPage: "101" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "perPageは100以下で指定してください。",
      );
    }
  });
});

describe("staffRoleSchema", () => {
  it("rejects an invalid role value with a Japanese message", () => {
    const result = staffRoleSchema.safeParse("admin");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "役割は「営業担当者」「上長」「管理者」のいずれかを指定してください。",
      );
    }
  });
});
