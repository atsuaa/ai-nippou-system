import { describe, expect, it } from "vitest";

import {
  customerListQuerySchema,
  customerMutationRequestSchema,
} from "./customer";

describe("customerMutationRequestSchema", () => {
  it("accepts a valid POST /customers request body", () => {
    const result = customerMutationRequestSchema.safeParse({
      customerName: "株式会社サンプル",
      industry: "製造業",
      address: "東京都千代田区...",
      phone: "03-xxxx-xxxx",
      primaryStaffId: 12,
    });
    expect(result.success).toBe(true);
  });

  it("only requires customerName", () => {
    const result = customerMutationRequestSchema.safeParse({
      customerName: "株式会社サンプル",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing customerName", () => {
    const result = customerMutationRequestSchema.safeParse({
      industry: "製造業",
    });
    expect(result.success).toBe(false);
  });

  it("returns a Japanese error message when customerName is missing entirely (not just empty)", () => {
    const result = customerMutationRequestSchema.safeParse({
      industry: "製造業",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path[0] === "customerName",
      );
      expect(issue?.message).toBe("顧客名は必須です。");
    }
  });

  it("returns a Japanese error message when primaryStaffId is not a number", () => {
    const result = customerMutationRequestSchema.safeParse({
      customerName: "株式会社サンプル",
      primaryStaffId: "abc",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "primaryStaffIdは数値で指定してください。",
      );
    }
  });
});

describe("customerListQuerySchema", () => {
  it("allows the name filter to be omitted", () => {
    const result = customerListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("includes page/perPage with defaults when parsed directly (regression: pagination must be built into the schema itself)", () => {
    const result = customerListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(20);
  });

  it("coerces page/perPage from query strings", () => {
    const result = customerListQuerySchema.parse({ page: "3", perPage: "10" });
    expect(result.page).toBe(3);
    expect(result.perPage).toBe(10);
  });
});
