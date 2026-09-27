import {
  createDocument,
  type ZodOpenApiObject,
  type ZodOpenApiPathsObject,
  type ZodOpenApiResponseObject,
} from "zod-openapi";
import { z } from "zod";

import {
  loginRequestSchema,
  loginResponseSchema,
} from "@/lib/schemas/auth";
import {
  commentMutationRequestSchema,
  commentSchema,
} from "@/lib/schemas/comment";
import { staffRoleSchema } from "@/lib/schemas/common";
import {
  customerListQuerySchema,
  customerMutationRequestSchema,
  customerSchema,
} from "@/lib/schemas/customer";
import { dataEnvelope, listEnvelope } from "@/lib/schemas/envelope";
import { apiErrorResponseSchema } from "@/lib/schemas/error";
import {
  reportDetailSchema,
  reportListItemSchema,
  reportListQuerySchema,
  reportMutationRequestSchema,
} from "@/lib/schemas/report";
import {
  staffListQuerySchema,
  staffMutationRequestSchema,
  staffSchema,
} from "@/lib/schemas/staff";

/**
 * docs/api.md 6章のエラーコード一覧に対応する共通エラーレスポンス。
 * 同じZodスキーマ(`apiErrorResponseSchema`)を参照させることで、
 * OpenAPIドキュメント上は`components.schemas.ApiErrorResponse`への参照として重複なく出力される。
 */
function errorResponse(description: string): ZodOpenApiResponseObject {
  return {
    description,
    content: {
      "application/json": { schema: apiErrorResponseSchema },
    },
  };
}

const responses = {
  badRequest: errorResponse(
    "400 Bad Request: リクエスト不正・バリデーションエラー(VALIDATION_ERROR)",
  ),
  unauthorized: errorResponse("401 Unauthorized: 未認証(UNAUTHORIZED)"),
  forbidden: errorResponse(
    "403 Forbidden: アクセス範囲外のリソースへの操作(FORBIDDEN)",
  ),
  notFound: errorResponse(
    "404 Not Found: 指定したリソースが存在しない(NOT_FOUND)",
  ),
  conflict: errorResponse(
    "409 Conflict: 一意制約違反(DUPLICATE_REPORT / DUPLICATE_EMAIL)",
  ),
  internalError: errorResponse(
    "500 Internal Server Error: サーバー内部エラー(INTERNAL_ERROR)",
  ),
};

const pathIdParam = (name: string, description: string) =>
  z.object({
    [name]: z.coerce.number().int().positive().meta({ description }),
  });

const paths: ZodOpenApiPathsObject = {
  "/auth/login": {
    post: {
      tags: ["auth"],
      summary: "ログイン",
      security: [],
      requestBody: {
        content: { "application/json": { schema: loginRequestSchema } },
      },
      responses: {
        "200": {
          description: "200 OK: ログイン成功",
          content: {
            "application/json": { schema: dataEnvelope(loginResponseSchema) },
          },
        },
        "401": responses.unauthorized,
      },
    },
  },

  "/staff": {
    get: {
      tags: ["staff"],
      summary: "営業担当者マスタ一覧(管理者のみ利用可、FR-12)",
      requestParams: {
        query: staffListQuerySchema,
      },
      responses: {
        "200": {
          description: "200 OK",
          content: {
            "application/json": { schema: listEnvelope(staffSchema) },
          },
        },
        "401": responses.unauthorized,
        "403": responses.forbidden,
      },
    },
    post: {
      tags: ["staff"],
      summary: "営業担当者マスタ登録(管理者のみ利用可、FR-12)",
      requestBody: {
        content: {
          "application/json": { schema: staffMutationRequestSchema },
        },
      },
      responses: {
        "201": {
          description: "201 Created",
          content: {
            "application/json": { schema: dataEnvelope(staffSchema) },
          },
        },
        "400": responses.badRequest,
        "401": responses.unauthorized,
        "403": responses.forbidden,
        "409": responses.conflict,
      },
    },
  },

  "/staff/{staffId}": {
    get: {
      tags: ["staff"],
      summary: "営業担当者マスタ詳細",
      requestParams: {
        path: pathIdParam("staffId", "営業担当者ID"),
      },
      responses: {
        "200": {
          description: "200 OK",
          content: {
            "application/json": { schema: dataEnvelope(staffSchema) },
          },
        },
        "401": responses.unauthorized,
        "404": responses.notFound,
      },
    },
    put: {
      tags: ["staff"],
      summary: "営業担当者マスタ更新(FR-12, FR-14)",
      requestParams: {
        path: pathIdParam("staffId", "営業担当者ID"),
      },
      requestBody: {
        content: {
          "application/json": { schema: staffMutationRequestSchema },
        },
      },
      responses: {
        "200": {
          description: "200 OK",
          content: {
            "application/json": { schema: dataEnvelope(staffSchema) },
          },
        },
        "400": responses.badRequest,
        "401": responses.unauthorized,
        "403": responses.forbidden,
        "404": responses.notFound,
        "409": responses.conflict,
      },
    },
    delete: {
      tags: ["staff"],
      summary: "営業担当者マスタ削除",
      requestParams: {
        path: pathIdParam("staffId", "営業担当者ID"),
      },
      responses: {
        "204": { description: "204 No Content" },
        "401": responses.unauthorized,
        "403": responses.forbidden,
        "404": responses.notFound,
        "409": responses.conflict,
      },
    },
  },

  "/customers": {
    get: {
      tags: ["customers"],
      summary: "顧客マスタ一覧(FR-11)",
      requestParams: {
        query: customerListQuerySchema,
      },
      responses: {
        "200": {
          description: "200 OK",
          content: {
            "application/json": { schema: listEnvelope(customerSchema) },
          },
        },
        "401": responses.unauthorized,
      },
    },
    post: {
      tags: ["customers"],
      summary: "顧客マスタ登録(管理者のみ利用可、FR-11)",
      requestBody: {
        content: {
          "application/json": { schema: customerMutationRequestSchema },
        },
      },
      responses: {
        "201": {
          description: "201 Created",
          content: {
            "application/json": { schema: dataEnvelope(customerSchema) },
          },
        },
        "400": responses.badRequest,
        "401": responses.unauthorized,
        "403": responses.forbidden,
      },
    },
  },

  "/customers/{customerId}": {
    get: {
      tags: ["customers"],
      summary: "顧客マスタ詳細",
      requestParams: {
        path: pathIdParam("customerId", "顧客ID"),
      },
      responses: {
        "200": {
          description: "200 OK",
          content: {
            "application/json": { schema: dataEnvelope(customerSchema) },
          },
        },
        "401": responses.unauthorized,
        "404": responses.notFound,
      },
    },
    put: {
      tags: ["customers"],
      summary: "顧客マスタ更新(FR-11, FR-13)",
      requestParams: {
        path: pathIdParam("customerId", "顧客ID"),
      },
      requestBody: {
        content: {
          "application/json": { schema: customerMutationRequestSchema },
        },
      },
      responses: {
        "200": {
          description: "200 OK",
          content: {
            "application/json": { schema: dataEnvelope(customerSchema) },
          },
        },
        "400": responses.badRequest,
        "401": responses.unauthorized,
        "403": responses.forbidden,
        "404": responses.notFound,
      },
    },
    delete: {
      tags: ["customers"],
      summary: "顧客マスタ削除",
      requestParams: {
        path: pathIdParam("customerId", "顧客ID"),
      },
      responses: {
        "204": { description: "204 No Content" },
        "401": responses.unauthorized,
        "403": responses.forbidden,
        "404": responses.notFound,
        "409": responses.conflict,
      },
    },
  },

  "/reports": {
    get: {
      tags: ["reports"],
      summary: "日報一覧(FR-04, FR-05)",
      requestParams: {
        query: reportListQuerySchema,
      },
      responses: {
        "200": {
          description: "200 OK",
          content: {
            "application/json": { schema: listEnvelope(reportListItemSchema) },
          },
        },
        "401": responses.unauthorized,
      },
    },
    post: {
      tags: ["reports"],
      summary:
        "日報新規作成(訪問記録を含む。FR-01, FR-02, FR-03, FR-06, FR-07)",
      requestBody: {
        content: {
          "application/json": { schema: reportMutationRequestSchema },
        },
      },
      responses: {
        "201": {
          description: "201 Created",
          content: {
            "application/json": { schema: dataEnvelope(reportDetailSchema) },
          },
        },
        "400": responses.badRequest,
        "401": responses.unauthorized,
        "409": responses.conflict,
      },
    },
  },

  "/reports/{reportId}": {
    get: {
      tags: ["reports"],
      summary: "日報詳細(訪問記録・コメント含む。FR-04, FR-05)",
      requestParams: {
        path: pathIdParam("reportId", "日報ID"),
      },
      responses: {
        "200": {
          description: "200 OK",
          content: {
            "application/json": { schema: dataEnvelope(reportDetailSchema) },
          },
        },
        "401": responses.unauthorized,
        "403": responses.forbidden,
        "404": responses.notFound,
      },
    },
    put: {
      tags: ["reports"],
      summary: "日報更新(作成者本人のみ。FR-01, FR-02, FR-03, FR-06, FR-07)",
      requestParams: {
        path: pathIdParam("reportId", "日報ID"),
      },
      requestBody: {
        content: {
          "application/json": { schema: reportMutationRequestSchema },
        },
      },
      responses: {
        "200": {
          description: "200 OK",
          content: {
            "application/json": { schema: dataEnvelope(reportDetailSchema) },
          },
        },
        "400": responses.badRequest,
        "401": responses.unauthorized,
        "403": responses.forbidden,
        "404": responses.notFound,
      },
    },
    delete: {
      tags: ["reports"],
      summary: "日報削除(作成者本人のみ)",
      requestParams: {
        path: pathIdParam("reportId", "日報ID"),
      },
      responses: {
        "204": { description: "204 No Content" },
        "401": responses.unauthorized,
        "403": responses.forbidden,
        "404": responses.notFound,
      },
    },
  },

  "/reports/{reportId}/comments": {
    get: {
      tags: ["comments"],
      summary: "コメント一覧(FR-09, FR-10)",
      requestParams: {
        path: pathIdParam("reportId", "日報ID"),
      },
      responses: {
        "200": {
          description: "200 OK",
          content: {
            "application/json": { schema: dataEnvelope(z.array(commentSchema)) },
          },
        },
        "401": responses.unauthorized,
        "403": responses.forbidden,
        "404": responses.notFound,
      },
    },
    post: {
      tags: ["comments"],
      summary: "コメント投稿(FR-08, FR-09, FR-10)",
      requestParams: {
        path: pathIdParam("reportId", "日報ID"),
      },
      requestBody: {
        content: {
          "application/json": { schema: commentMutationRequestSchema },
        },
      },
      responses: {
        "201": {
          description: "201 Created",
          content: {
            "application/json": { schema: dataEnvelope(commentSchema) },
          },
        },
        "400": responses.badRequest,
        "401": responses.unauthorized,
        "403": responses.forbidden,
        "404": responses.notFound,
      },
    },
  },
};

const document: ZodOpenApiObject = {
  openapi: "3.1.0",
  info: {
    title: "営業日報システム API",
    version: "0.1.0",
    description:
      "docs/api.md に対応するOpenAPI定義(自動生成)。編集する場合はdocs/api.mdとこのファイルの生成元(このファイル)を合わせて更新すること。",
  },
  servers: [{ url: "/api/v1" }],
  tags: [
    { name: "auth", description: "認証" },
    { name: "staff", description: "営業担当者マスタ" },
    { name: "customers", description: "顧客マスタ" },
    { name: "reports", description: "日報(訪問記録を含む)" },
    { name: "comments", description: "コメント" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "docs/api.md 2章参照。認証方式(パスワード認証/SSO)は要件定義書4章の検討事項として未確定。",
      },
    },
    schemas: {
      // 一覧クエリで使うroleを明示的にコンポーネント化しておく
      StaffRole: staffRoleSchema,
    },
  },
  security: [{ bearerAuth: [] }],
  paths,
};

export function buildOpenApiDocument() {
  return createDocument(document);
}
