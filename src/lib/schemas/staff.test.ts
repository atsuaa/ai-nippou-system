import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/errors";
import { parseWithSchema } from "@/lib/api/validate";

import {
  staffListQuerySchema,
  staffMutationRequestSchema,
} from "./staff";

describe("staffMutationRequestSchema", () => {
  it("accepts a valid POST /staff request body", () => {
    const result = staffMutationRequestSchema.safeParse({
      name: "佐藤 太郎",
      email: "sato@example.com",
      role: "営業担当者",
      managerId: 3,
    });
    expect(result.success).toBe(true);
  });

  it("allows managerId to be omitted", () => {
    const result = staffMutationRequestSchema.safeParse({
      name: "鈴木 一郎",
      email: "suzuki@example.com",
      role: "上長",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = staffMutationRequestSchema.safeParse({
      name: "佐藤 太郎",
      email: "not-an-email",
      role: "営業担当者",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a role outside 営業担当者/上長/管理者", () => {
    const result = staffMutationRequestSchema.safeParse({
      name: "佐藤 太郎",
      email: "sato@example.com",
      role: "課長",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing name", () => {
    const result = staffMutationRequestSchema.safeParse({
      email: "sato@example.com",
      role: "営業担当者",
    });
    expect(result.success).toBe(false);
  });

  it("returns a Japanese error message when name is missing entirely (not just empty)", () => {
    const result = staffMutationRequestSchema.safeParse({
      email: "sato@example.com",
      role: "営業担当者",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameIssue = result.error.issues.find(
        (issue) => issue.path[0] === "name",
      );
      expect(nameIssue?.message).toBe("氏名は必須です。");
    }
  });

  it("returns a Japanese error message when managerId is not a number", () => {
    const result = staffMutationRequestSchema.safeParse({
      name: "佐藤 太郎",
      email: "sato@example.com",
      role: "上長",
      managerId: "abc",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "managerIdは数値で指定してください。",
      );
    }
  });

  it("throws a VALIDATION_ERROR ApiError when role has an invalid value (e.g. \"admin\")", () => {
    let thrown: unknown;
    try {
      parseWithSchema(staffMutationRequestSchema, {
        name: "佐藤 太郎",
        email: "sato@example.com",
        role: "admin",
      });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).code).toBe("VALIDATION_ERROR");
  });
});

describe("staffListQuerySchema", () => {
  it("allows all query params to be omitted", () => {
    const result = staffListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("includes page/perPage with defaults when parsed directly (regression: pagination must be built into the schema itself)", () => {
    const result = staffListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(20);
  });

  it("coerces page/perPage from query strings", () => {
    const result = staffListQuerySchema.parse({ page: "2", perPage: "50" });
    expect(result.page).toBe(2);
    expect(result.perPage).toBe(50);
  });

  it("accepts a name/role filter", () => {
    const result = staffListQuerySchema.safeParse({
      name: "佐藤",
      role: "管理者",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid role value (e.g. \"admin\")", () => {
    const result = staffListQuerySchema.safeParse({ role: "admin" });
    expect(result.success).toBe(false);
  });
});
