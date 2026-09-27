import { z } from "zod";

/**
 * SALES_STAFF.role の3値(docs/requirements.md 6章 SALES_STAFF定義)。
 * 権限モデル(CLAUDE.md「維持すべきアーキテクチャ判断」)の判定にも用いる値と一致させる。
 */
export const staffRoleSchema = z
  .enum(["営業担当者", "上長", "管理者"])
  .meta({
    id: "StaffRole",
    description: "営業担当者の役割",
    example: "営業担当者",
  });

export type StaffRole = z.infer<typeof staffRoleSchema>;

/** docs/api.md 3.2節の共通ページネーションクエリパラメータ */
export const paginationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .meta({ description: "ページ番号", example: 1 }),
  perPage: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .meta({ description: "1ページあたりの件数", example: 20 }),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/** docs/api.md 3.1節の一覧レスポンスに含まれる `meta` */
export const paginationMetaSchema = z
  .object({
    page: z.number().int().meta({ description: "ページ番号" }),
    perPage: z.number().int().meta({ description: "1ページあたりの件数" }),
    totalCount: z.number().int().meta({ description: "総件数" }),
  })
  .meta({ id: "PaginationMeta" });

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
