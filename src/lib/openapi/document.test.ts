import { describe, expect, it } from "vitest";

import { buildOpenApiDocument } from "./document";

// docs/api.md 4章のエンドポイント一覧と一致させる。
const EXPECTED_PATHS: Record<string, string[]> = {
  "/auth/login": ["post"],
  "/staff": ["get", "post"],
  "/staff/{staffId}": ["get", "put", "delete"],
  "/customers": ["get", "post"],
  "/customers/{customerId}": ["get", "put", "delete"],
  "/reports": ["get", "post"],
  "/reports/{reportId}": ["get", "put", "delete"],
  "/reports/{reportId}/comments": ["get", "post"],
};

describe("buildOpenApiDocument", () => {
  const document = buildOpenApiDocument();

  it("covers every endpoint listed in docs/api.md 4章", () => {
    expect(Object.keys(document.paths ?? {}).sort()).toEqual(
      Object.keys(EXPECTED_PATHS).sort(),
    );
    for (const [path, methods] of Object.entries(EXPECTED_PATHS)) {
      const pathItem = document.paths?.[path] as Record<string, unknown>;
      expect(pathItem, `missing path: ${path}`).toBeDefined();
      expect(Object.keys(pathItem).sort()).toEqual(methods.sort());
    }
  });

  it("declares bearerAuth as a global security requirement, except for login", () => {
    expect(document.security).toEqual([{ bearerAuth: [] }]);
    const login = document.paths?.["/auth/login"] as { post: { security?: unknown[] } };
    expect(login.post.security).toEqual([]);
  });

  it("registers docs/api.md 6章's error codes as an OpenAPI component schema", () => {
    const errorCodeSchema = document.components?.schemas?.ApiErrorCode as {
      enum?: string[];
    };
    expect(errorCodeSchema?.enum).toEqual([
      "UNAUTHORIZED",
      "FORBIDDEN",
      "NOT_FOUND",
      "VALIDATION_ERROR",
      "DUPLICATE_REPORT",
      "DUPLICATE_EMAIL",
      "INTERNAL_ERROR",
    ]);
  });

  it("embeds visits[] directly inside ReportMutationRequest (no standalone VisitRecord CRUD)", () => {
    const reportMutation = document.components?.schemas
      ?.ReportMutationRequest as {
      properties?: { visits?: { items?: { $ref?: string } } };
    };
    expect(reportMutation.properties?.visits?.items?.$ref).toBe(
      "#/components/schemas/VisitRecordInput",
    );
    expect(document.paths?.["/reports/{reportId}/visits"]).toBeUndefined();
  });
});
