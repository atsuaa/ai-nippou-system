import { describe, expect, it } from "vitest";

import { ApiError } from "./errors";
import {
  apiErrorResponse,
  apiNoContent,
  apiSuccess,
  apiSuccessList,
  handleApiError,
} from "./response";

describe("apiSuccess", () => {
  it("wraps the payload in docs/api.md 3.1's `{ data }` envelope", async () => {
    const response = apiSuccess({ staffId: 1 });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { staffId: 1 } });
  });

  it("honors a custom status code (e.g. 201 Created)", () => {
    const response = apiSuccess({ staffId: 1 }, { status: 201 });
    expect(response.status).toBe(201);
  });
});

describe("apiSuccessList", () => {
  it("wraps the payload in docs/api.md 3.1's `{ data, meta }` envelope", async () => {
    const response = apiSuccessList(
      [{ staffId: 1 }],
      { page: 1, perPage: 20, totalCount: 1 },
    );
    await expect(response.json()).resolves.toEqual({
      data: [{ staffId: 1 }],
      meta: { page: 1, perPage: 20, totalCount: 1 },
    });
  });
});

describe("apiNoContent", () => {
  it("returns a 204 response with no body", async () => {
    const response = apiNoContent();
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });
});

describe("apiErrorResponse", () => {
  it("matches docs/api.md 3.3's error envelope, including details", async () => {
    const error = ApiError.validation("customerId は必須です。", [
      { field: "customerId", message: "必須項目です。" },
    ]);
    const response = apiErrorResponse(error);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "customerId は必須です。",
        details: [{ field: "customerId", message: "必須項目です。" }],
      },
    });
  });

  it("omits `details` when not provided", async () => {
    const response = apiErrorResponse(ApiError.notFound("見つかりません。"));
    const body = await response.json();
    expect(body.error).not.toHaveProperty("details");
  });
});

describe("handleApiError", () => {
  it("passes ApiError through as-is", async () => {
    const response = handleApiError(ApiError.forbidden());
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("converts unknown errors to INTERNAL_ERROR (500)", async () => {
    const response = handleApiError(new Error("boom"));
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });
});
