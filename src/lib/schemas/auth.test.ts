import { describe, expect, it } from "vitest";

import { loginRequestSchema } from "./auth";

describe("loginRequestSchema", () => {
  it("accepts a valid POST /auth/login request body", () => {
    const result = loginRequestSchema.safeParse({
      email: "sato@example.com",
      password: "********",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginRequestSchema.safeParse({
      email: "not-an-email",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginRequestSchema.safeParse({
      email: "sato@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("returns a Japanese error message when password is missing entirely (not just empty)", () => {
    const result = loginRequestSchema.safeParse({
      email: "sato@example.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("パスワードは必須です。");
    }
  });
});
