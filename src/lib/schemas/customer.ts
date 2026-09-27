import { z } from "zod";

import { paginationQuerySchema } from "./common";

/**
 * docs/api.md 5.3 POST /customers, PUT /customers/{customerId} リクエストボディ。
 * PUTは「リクエストボディはPOSTと同様」とされているため、同一スキーマを使い回す。
 */
export const customerMutationRequestSchema = z
  .object({
    customerName: z
      .string("顧客名は必須です。")
      .min(1, "顧客名は必須です。")
      .meta({
        description: "顧客名",
        example: "株式会社サンプル",
      }),
    industry: z
      .string("業種は文字列で指定してください。")
      .optional()
      .meta({ description: "業種" }),
    address: z
      .string("住所は文字列で指定してください。")
      .optional()
      .meta({ description: "住所" }),
    phone: z
      .string("電話番号は文字列で指定してください。")
      .optional()
      .meta({ description: "電話番号" }),
    primaryStaffId: z
      .number("primaryStaffIdは数値で指定してください。")
      .int("primaryStaffIdは整数で指定してください。")
      .positive("primaryStaffIdは正の整数で指定してください。")
      .optional()
      .meta({
        description: "主担当営業のstaffId",
      }),
  })
  .meta({ id: "CustomerMutationRequest" });

export type CustomerMutationRequest = z.infer<
  typeof customerMutationRequestSchema
>;

/** docs/api.md 5.3 GET /customers クエリパラメータ(ページネーション込み) */
export const customerListQuerySchema = z
  .object({
    name: z
      .string("顧客名は1文字以上の文字列で指定してください。")
      .min(1, "顧客名は1文字以上の文字列で指定してください。")
      .optional()
      .meta({ description: "顧客名の部分一致検索" }),
  })
  .extend(paginationQuerySchema.shape)
  .meta({ id: "CustomerListQuery" });

export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;

/** docs/api.md 5.3 各エンドポイントのレスポンスに含まれる顧客オブジェクト */
export const customerSchema = z
  .object({
    customerId: z.number().int(),
    customerName: z.string(),
    industry: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    primaryStaffId: z.number().int().nullable().optional(),
    primaryStaffName: z.string().nullable().optional(),
  })
  .meta({ id: "Customer" });

export type Customer = z.infer<typeof customerSchema>;
