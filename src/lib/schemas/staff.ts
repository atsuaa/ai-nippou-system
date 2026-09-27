import { z } from "zod";

import { paginationQuerySchema, staffRoleSchema } from "./common";

/**
 * docs/api.md 5.2 POST /staff, PUT /staff/{staffId} リクエストボディ。
 * PUTは「リクエストボディはPOSTと同様」とされているため、同一スキーマを使い回す。
 */
export const staffMutationRequestSchema = z
  .object({
    name: z.string("氏名は必須です。").min(1, "氏名は必須です。").meta({
      description: "氏名",
      example: "佐藤 太郎",
    }),
    email: z.email("メールアドレスの形式が不正です。").meta({
      description: "メールアドレス(一意)",
      example: "sato@example.com",
    }),
    role: staffRoleSchema,
    managerId: z
      .number("managerIdは数値で指定してください。")
      .int("managerIdは整数で指定してください。")
      .positive("managerIdは正の整数で指定してください。")
      .optional()
      .meta({
        description:
          "上長のstaffId。roleが「上長」の担当者を指定する(検討事項: 権限設計の詳細はrequirements.md 4章参照)",
      }),
  })
  .meta({ id: "StaffMutationRequest" });

export type StaffMutationRequest = z.infer<typeof staffMutationRequestSchema>;

/** docs/api.md 5.2 GET /staff クエリパラメータ(ページネーション込み) */
export const staffListQuerySchema = z
  .object({
    name: z
      .string("氏名は1文字以上の文字列で指定してください。")
      .min(1, "氏名は1文字以上の文字列で指定してください。")
      .optional()
      .meta({ description: "氏名の部分一致検索" }),
    role: staffRoleSchema.optional(),
  })
  .extend(paginationQuerySchema.shape)
  .meta({ id: "StaffListQuery" });

export type StaffListQuery = z.infer<typeof staffListQuerySchema>;

/** docs/api.md 5.2 各エンドポイントのレスポンスに含まれる営業担当者オブジェクト */
export const staffSchema = z
  .object({
    staffId: z.number().int(),
    name: z.string(),
    email: z.email(),
    role: staffRoleSchema,
    managerId: z.number().int().nullable().optional(),
    managerName: z.string().nullable().optional(),
  })
  .meta({ id: "Staff" });

export type Staff = z.infer<typeof staffSchema>;
