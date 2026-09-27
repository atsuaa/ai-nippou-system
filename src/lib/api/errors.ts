import type { ApiErrorCode, ApiErrorDetail } from "@/lib/schemas/error";

/** docs/api.md 3.4節のエラーコード → HTTPステータスコード対応表 */
const ERROR_STATUS: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  DUPLICATE_REPORT: 409,
  DUPLICATE_EMAIL: 409,
  INTERNAL_ERROR: 500,
};

/**
 * docs/api.md 6章のエラーコード一覧に対応するアプリケーション例外。
 * Route Handlerからthrowし、`handleApiError`で共通エラーレスポンス(3.3節)に変換する。
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: ApiErrorDetail[];

  constructor(code: ApiErrorCode, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = ERROR_STATUS[code];
    this.details = details;
  }

  static unauthorized(message = "認証情報が無効です。"): ApiError {
    return new ApiError("UNAUTHORIZED", message);
  }

  static forbidden(message = "このリソースへのアクセス権限がありません。"): ApiError {
    return new ApiError("FORBIDDEN", message);
  }

  static notFound(message = "指定したリソースが見つかりません。"): ApiError {
    return new ApiError("NOT_FOUND", message);
  }

  static validation(message: string, details?: ApiErrorDetail[]): ApiError {
    return new ApiError("VALIDATION_ERROR", message, details);
  }

  static duplicateReport(
    message = "同一担当者・同一報告日の日報が既に存在します。",
  ): ApiError {
    return new ApiError("DUPLICATE_REPORT", message);
  }

  static duplicateEmail(
    message = "メールアドレスが既に登録されています。",
  ): ApiError {
    return new ApiError("DUPLICATE_EMAIL", message);
  }

  static internal(message = "サーバー内部でエラーが発生しました。"): ApiError {
    return new ApiError("INTERNAL_ERROR", message);
  }
}

export type { ApiErrorCode, ApiErrorDetail };
