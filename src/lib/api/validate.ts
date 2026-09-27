import type { z } from "zod";

import { ApiError } from "./errors";
import type { ApiErrorDetail } from "@/lib/schemas/error";

function issuesToDetails(error: z.ZodError): ApiErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : "(root)",
    message: issue.message,
  }));
}

/**
 * Zodスキーマでのバリデーションに失敗した場合、
 * docs/api.md 3.3節の形式(`VALIDATION_ERROR` + `details`)に沿った`ApiError`をthrowする。
 */
export function parseWithSchema<T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = issuesToDetails(result.error);
    throw ApiError.validation(
      details[0]?.message ?? "入力値が不正です。",
      details,
    );
  }
  return result.data;
}

/**
 * Route Handlerのリクエストボディ(JSON)をZodスキーマで検証する。
 * `POST/PUT /reports` の `visits[]` のようなネスト配列も含めてそのまま検証できる。
 */
export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw ApiError.validation("リクエストボディがJSON形式ではありません。", [
      { field: "(body)", message: "JSON形式で送信してください。" },
    ]);
  }
  return parseWithSchema(schema, json);
}

/**
 * Route HandlerのクエリパラメータをZodスキーマで検証する。
 * クエリパラメータは常に文字列で渡されるため、数値項目は各スキーマ側で`z.coerce.number()`を用いる。
 */
export function parseSearchParams<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T,
): z.infer<T> {
  return parseWithSchema(schema, Object.fromEntries(searchParams.entries()));
}
