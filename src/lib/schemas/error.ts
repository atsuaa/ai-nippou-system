import { z } from "zod";

/**
 * docs/api.md 6章のエラーコード一覧に対応する。
 * `src/lib/api/errors.ts` の `ApiErrorCode` 型はこのスキーマから導出し、
 * エラーコードの一覧を単一のソースで管理する。
 */
export const apiErrorCodeSchema = z
  .enum([
    "UNAUTHORIZED",
    "FORBIDDEN",
    "NOT_FOUND",
    "VALIDATION_ERROR",
    "DUPLICATE_REPORT",
    "DUPLICATE_EMAIL",
    "INTERNAL_ERROR",
  ])
  .meta({
    id: "ApiErrorCode",
    description: "APIエラーコード(docs/api.md 6章)",
  });

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

/** docs/api.md 3.3節の `error.details[]` 要素 */
export const apiErrorDetailSchema = z
  .object({
    field: z.string().meta({ description: "エラーが発生したフィールド名" }),
    message: z.string().meta({ description: "フィールドごとのエラー内容" }),
  })
  .meta({ id: "ApiErrorDetail" });

export type ApiErrorDetail = z.infer<typeof apiErrorDetailSchema>;

/** docs/api.md 3.3節の共通エラーレスポンス形式 */
export const apiErrorResponseSchema = z
  .object({
    error: z.object({
      code: apiErrorCodeSchema,
      message: z.string().meta({ description: "エラーメッセージ" }),
      details: z
        .array(apiErrorDetailSchema)
        .optional()
        .meta({ description: "バリデーションエラー等の詳細" }),
    }),
  })
  .meta({ id: "ApiErrorResponse" });

export type ApiErrorResponseBody = z.infer<typeof apiErrorResponseSchema>;
