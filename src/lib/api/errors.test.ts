import { describe, expect, it } from "vitest";

import { ApiError } from "./errors";

describe("ApiError", () => {
  it.each([
    ["unauthorized" as const, "UNAUTHORIZED", 401],
    ["forbidden" as const, "FORBIDDEN", 403],
    ["notFound" as const, "NOT_FOUND", 404],
    ["duplicateReport" as const, "DUPLICATE_REPORT", 409],
    ["duplicateEmail" as const, "DUPLICATE_EMAIL", 409],
    ["internal" as const, "INTERNAL_ERROR", 500],
  ])("%s() sets code=%s and status=%d", (factory, code, status) => {
    const error = ApiError[factory]();
    expect(error.code).toBe(code);
    expect(error.status).toBe(status);
    expect(error.message.length).toBeGreaterThan(0);
  });

  it("validation() sets code=VALIDATION_ERROR, status=400 and carries details", () => {
    const error = ApiError.validation("customerId は必須です。", [
      { field: "customerId", message: "必須項目です。" },
    ]);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.status).toBe(400);
    expect(error.details).toEqual([
      { field: "customerId", message: "必須項目です。" },
    ]);
  });

  it("is an instance of Error", () => {
    const error = ApiError.notFound();
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
  });
});
