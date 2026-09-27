import { describe, expect, it } from "vitest";

import { commentMutationRequestSchema } from "./comment";

describe("commentMutationRequestSchema", () => {
  it("accepts a valid POST /reports/{reportId}/comments request body", () => {
    const result = commentMutationRequestSchema.safeParse({
      commentContent: "値引きは15%まで許容可能。明日相談しよう。",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty commentContent", () => {
    const result = commentMutationRequestSchema.safeParse({
      commentContent: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing commentContent", () => {
    const result = commentMutationRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("returns a Japanese error message when commentContent is missing entirely (not just empty)", () => {
    const result = commentMutationRequestSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("コメント内容は必須です。");
    }
  });
});
