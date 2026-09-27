import { z } from "zod";
import { describe, expect, it } from "vitest";

import { ApiError } from "./errors";
import { parseJsonBody, parseSearchParams, parseWithSchema } from "./validate";

const schema = z.object({
  customerId: z.number().int().positive(),
  name: z.string().min(1),
});

describe("parseWithSchema", () => {
  it("returns the parsed data on success", () => {
    const result = parseWithSchema(schema, { customerId: 1, name: "a" });
    expect(result).toEqual({ customerId: 1, name: "a" });
  });

  it("throws a VALIDATION_ERROR ApiError with field/message details on failure", () => {
    let thrown: unknown;
    try {
      parseWithSchema(schema, { name: "" });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(ApiError);
    const apiError = thrown as ApiError;
    expect(apiError.code).toBe("VALIDATION_ERROR");
    expect(apiError.status).toBe(400);
    expect(apiError.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "customerId" }),
        expect.objectContaining({ field: "name" }),
      ]),
    );
  });
});

describe("parseJsonBody", () => {
  it("validates the visits[] nested array used by POST/PUT /reports", async () => {
    const reportSchema = z.object({
      reportDate: z.iso.date(),
      visits: z
        .array(
          z.object({
            customerId: z.number().int().positive(),
            visitContent: z.string().min(1),
          }),
        )
        .min(1),
    });
    const request = new Request("http://localhost/api/v1/reports", {
      method: "POST",
      body: JSON.stringify({
        reportDate: "2026-08-14",
        visits: [{ customerId: 101, visitContent: "訪問しました" }],
      }),
    });
    const result = await parseJsonBody(request, reportSchema);
    expect(result.visits).toHaveLength(1);
  });

  it("throws VALIDATION_ERROR when visits[] is empty", async () => {
    const reportSchema = z.object({
      reportDate: z.iso.date(),
      visits: z.array(z.object({ customerId: z.number() })).min(1),
    });
    const request = new Request("http://localhost/api/v1/reports", {
      method: "POST",
      body: JSON.stringify({ reportDate: "2026-08-14", visits: [] }),
    });
    await expect(parseJsonBody(request, reportSchema)).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it("throws VALIDATION_ERROR when the body is not valid JSON", async () => {
    const request = new Request("http://localhost/api/v1/reports", {
      method: "POST",
      body: "not json",
    });
    await expect(parseJsonBody(request, schema)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });
});

describe("parseSearchParams", () => {
  it("coerces string query params to numbers via z.coerce", () => {
    const querySchema = z.object({
      staffId: z.coerce.number().int().positive().optional(),
    });
    const params = new URLSearchParams({ staffId: "12" });
    const result = parseSearchParams(params, querySchema);
    expect(result.staffId).toBe(12);
  });
});
