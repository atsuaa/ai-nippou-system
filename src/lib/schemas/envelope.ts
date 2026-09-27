import { z } from "zod";

import { paginationMetaSchema } from "./common";

/**
 * docs/api.md 3.1節「単一リソース」の共通レスポンス形式 `{ data: T }` を
 * OpenAPIドキュメント生成のために組み立てるヘルパー。
 */
export function dataEnvelope<T extends z.ZodType>(schema: T) {
  return z.object({ data: schema });
}

/**
 * docs/api.md 3.1節「一覧」の共通レスポンス形式 `{ data: T[], meta }` を
 * OpenAPIドキュメント生成のために組み立てるヘルパー。
 */
export function listEnvelope<T extends z.ZodType>(schema: T) {
  return z.object({ data: z.array(schema), meta: paginationMetaSchema });
}
