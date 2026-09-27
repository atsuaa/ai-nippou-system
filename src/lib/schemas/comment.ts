import { z } from "zod";

/**
 * docs/api.md 5.5 POST /reports/{reportId}/comments リクエストボディ。
 * COMMENTはDAILY_REPORTの子テーブルであり(CLAUDE.md参照)、独立したreportIdの
 * 変更は行わない(reportIdはパスパラメータから取得する)。
 */
export const commentMutationRequestSchema = z
  .object({
    commentContent: z.string().min(1, "コメント内容は必須です。").meta({
      description: "コメント内容",
      example: "値引きは15%まで許容可能。明日相談しよう。",
    }),
  })
  .meta({ id: "CommentMutationRequest" });

export type CommentMutationRequest = z.infer<
  typeof commentMutationRequestSchema
>;

/** docs/api.md 5.5 各エンドポイントのレスポンスに含まれるコメントオブジェクト */
export const commentSchema = z
  .object({
    commentId: z.number().int(),
    staffId: z.number().int(),
    staffName: z.string(),
    commentContent: z.string(),
    createdAt: z.iso.datetime({ offset: true }),
  })
  .meta({ id: "Comment" });

export type Comment = z.infer<typeof commentSchema>;
