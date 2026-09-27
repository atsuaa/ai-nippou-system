import type { NextRequest } from "next/server";

import { handleApiError } from "./response";

/**
 * Route Handlerを共通エラーハンドリングでラップする。
 * `ApiError`(バリデーションエラー・権限エラー等)、および想定外の例外を
 * docs/api.md 3.3節の共通エラーレスポンス形式に変換して返す。
 *
 * 使用例:
 * ```ts
 * export const POST = withErrorHandling(async (request) => {
 *   const body = await parseJsonBody(request, reportMutationRequestSchema);
 *   // ...実際のCRUDロジック(別issueで実装)
 * });
 * ```
 */
export function withErrorHandling<
  Args extends unknown[] = [request: NextRequest],
>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
