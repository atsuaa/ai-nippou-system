import { z } from "zod";

import { commentSchema } from "./comment";
import { paginationQuerySchema } from "./common";

/**
 * docs/api.md 5.4 POST/PUT /reports の `visits[]` 要素。
 * VISIT_RECORDには独立したCRUD APIを持たせない(CLAUDE.md「維持すべきアーキテクチャ判断」)ため、
 * このスキーマは常に `reportMutationRequestSchema.visits` の要素としてのみ使用する。
 */
export const visitRecordInputSchema = z
  .object({
    customerId: z.number().int().positive().meta({
      description: "訪問した顧客のcustomerId(顧客マスタから選択)",
    }),
    visitTime: z.string().min(1).optional().meta({
      description: "訪問時刻・順序",
      example: "10:00",
    }),
    visitContent: z.string().min(1, "訪問内容は必須です。").meta({
      description: "訪問内容",
    }),
  })
  .meta({ id: "VisitRecordInput" });

export type VisitRecordInput = z.infer<typeof visitRecordInputSchema>;

/**
 * docs/api.md 5.4 POST /reports, PUT /reports/{reportId} リクエストボディ。
 * PUTは「`visits` は全件置き換え」とされているため、同一スキーマを使い回す。
 */
export const reportMutationRequestSchema = z
  .object({
    reportDate: z.iso.date("報告日はYYYY-MM-DD形式で指定してください。").meta({
      description: "報告日",
      example: "2026-08-14",
    }),
    problem: z.string().optional().meta({
      description: "課題・相談(FR-06)",
    }),
    plan: z.string().optional().meta({
      description: "明日やること(FR-07)",
    }),
    visits: z
      .array(visitRecordInputSchema)
      .min(1, "訪問記録は1件以上登録してください。")
      .meta({ description: "訪問記録の配列(FR-02)" }),
  })
  .meta({ id: "ReportMutationRequest" });

export type ReportMutationRequest = z.infer<typeof reportMutationRequestSchema>;

/** docs/api.md 5.4 GET /reports クエリパラメータ(ページネーション込み) */
export const reportListQuerySchema = z
  .object({
    staffId: z.coerce.number().int().positive().optional().meta({
      description: "上長・管理者が配下の担当者を指定する場合に使用",
    }),
    dateFrom: z.iso.date().optional().meta({ description: "報告日の範囲検索(開始)" }),
    dateTo: z.iso.date().optional().meta({ description: "報告日の範囲検索(終了)" }),
  })
  .extend(paginationQuerySchema.shape)
  .meta({ id: "ReportListQuery" });

export type ReportListQuery = z.infer<typeof reportListQuerySchema>;

/** docs/api.md 5.4 GET /reports 一覧レスポンスの要素 */
export const reportListItemSchema = z
  .object({
    reportId: z.number().int(),
    staffId: z.number().int(),
    staffName: z.string(),
    reportDate: z.iso.date(),
    visitCount: z.number().int(),
    commentCount: z.number().int(),
  })
  .meta({ id: "ReportListItem" });

export type ReportListItem = z.infer<typeof reportListItemSchema>;

/** docs/api.md 5.4 GET/POST/PUT /reports/{reportId} レスポンスに含まれる訪問記録 */
export const visitRecordSchema = z
  .object({
    visitId: z.number().int(),
    customerId: z.number().int(),
    customerName: z.string(),
    visitTime: z.string().nullable().optional(),
    visitContent: z.string(),
  })
  .meta({ id: "VisitRecord" });

export type VisitRecordOutput = z.infer<typeof visitRecordSchema>;

/**
 * docs/api.md 5.4 GET/POST/PUT /reports/{reportId} レスポンス(日報詳細)。
 * 訪問記録・コメントを含めて1つのオブジェクトとして返す(CLAUDE.md参照)。
 */
export const reportDetailSchema = z
  .object({
    reportId: z.number().int(),
    staffId: z.number().int(),
    staffName: z.string(),
    reportDate: z.iso.date(),
    problem: z.string().nullable().optional(),
    plan: z.string().nullable().optional(),
    visits: z.array(visitRecordSchema),
    comments: z.array(commentSchema),
    createdAt: z.iso.datetime({ offset: true }),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .meta({ id: "ReportDetail" });

export type ReportDetail = z.infer<typeof reportDetailSchema>;
