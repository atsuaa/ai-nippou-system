import { NextResponse } from "next/server";

import { ApiError } from "./errors";
import type { PaginationMeta } from "@/lib/schemas/common";

/** docs/api.md 3.1節「単一リソース」の成功レスポンス `{ data }` を組み立てる。 */
export function apiSuccess<T>(
  data: T,
  init?: { status?: number },
): NextResponse<{ data: T }> {
  return NextResponse.json({ data }, { status: init?.status ?? 200 });
}

/** docs/api.md 3.1節「一覧」の成功レスポンス `{ data, meta }` を組み立てる。 */
export function apiSuccessList<T>(
  data: T[],
  meta: PaginationMeta,
  init?: { status?: number },
): NextResponse<{ data: T[]; meta: PaginationMeta }> {
  return NextResponse.json({ data, meta }, { status: init?.status ?? 200 });
}

/** 本文なしの成功レスポンス(204 No Content等)。 */
export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/** docs/api.md 3.3節の共通エラーレスポンス形式 `{ error: { code, message, details } }` を組み立てる。 */
export function apiErrorResponse(error: ApiError): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    },
    { status: error.status },
  );
}

/**
 * Route Handler内で発生した例外を共通エラーレスポンスに変換する。
 * `ApiError`以外の例外は`INTERNAL_ERROR`(500)として扱う。
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return apiErrorResponse(error);
  }
  console.error(error);
  return apiErrorResponse(ApiError.internal());
}
