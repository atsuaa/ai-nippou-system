import { describe, expect, it } from "vitest";

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
});

describe("staffListQuerySchema", () => {
  it("allows all query params to be omitted", () => {
    const result = staffListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a name/role filter", () => {
    const result = staffListQuerySchema.safeParse({
      name: "佐藤",
      role: "管理者",
    });
    expect(result.success).toBe(true);
  });
});
