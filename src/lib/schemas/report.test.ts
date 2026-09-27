import { describe, expect, it } from "vitest";

import {
  reportListQuerySchema,
  reportMutationRequestSchema,
} from "./report";

describe("reportMutationRequestSchema", () => {
  const valid = {
    reportDate: "2026-08-14",
    problem: "A社の見積もりが競合と価格差で止まっている。",
    plan: "明日はB社に再訪問する。",
    visits: [
      { customerId: 101, visitTime: "10:00", visitContent: "新製品の提案。" },
      { customerId: 102, visitTime: "14:00", visitContent: "定期フォロー。" },
    ],
  };

  it("accepts docs/api.md 5.4 POST /reports request example, including visits[]", () => {
    const result = reportMutationRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.visits).toHaveLength(2);
  });

  it("allows problem/plan to be omitted (both optional per docs/api.md)", () => {
    const result = reportMutationRequestSchema.safeParse({
      reportDate: "2026-08-14",
      visits: [{ customerId: 101, visitContent: "訪問しました" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty visits[] array (1件以上必須)", () => {
    const result = reportMutationRequestSchema.safeParse({
      ...valid,
      visits: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a visit missing the required customerId", () => {
    const result = reportMutationRequestSchema.safeParse({
      ...valid,
      visits: [{ visitContent: "内容のみ" }],
    });
    expect(result.success).toBe(false);
  });

  it("returns a Japanese error message when a visit is missing customerId entirely", () => {
    const result = reportMutationRequestSchema.safeParse({
      ...valid,
      visits: [{ visitContent: "内容のみ" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("customerId は必須です。");
    }
  });

  it("rejects a visit missing the required visitContent", () => {
    const result = reportMutationRequestSchema.safeParse({
      ...valid,
      visits: [{ customerId: 101 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a reportDate that is not YYYY-MM-DD", () => {
    const result = reportMutationRequestSchema.safeParse({
      ...valid,
      reportDate: "2026/08/14",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing reportDate", () => {
    const rest: Record<string, unknown> = { ...valid };
    delete rest.reportDate;
    const result = reportMutationRequestSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("reportListQuerySchema", () => {
  it("applies default pagination values when omitted", () => {
    const result = reportListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(20);
  });

  it("coerces staffId from a query string to a number", () => {
    const result = reportListQuerySchema.parse({ staffId: "12" });
    expect(result.staffId).toBe(12);
  });

  it("returns a Japanese error message when staffId is not a number", () => {
    const result = reportListQuerySchema.safeParse({ staffId: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "staffId は数値で指定してください。",
      );
    }
  });

  it("returns a Japanese error message when dateFrom is not a valid date", () => {
    const result = reportListQuerySchema.safeParse({ dateFrom: "2026/08/14" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "dateFrom はYYYY-MM-DD形式で指定してください。",
      );
    }
  });
});
