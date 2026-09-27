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
});

describe("customerListQuerySchema", () => {
  it("allows the name filter to be omitted", () => {
    const result = customerListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
