import { z } from "zod";

import { staffRoleSchema } from "./common";

/** docs/api.md 5.1 POST /auth/login リクエストボディ */
export const loginRequestSchema = z
  .object({
    email: z
      .email("メールアドレスの形式が不正です。")
      .meta({ description: "メールアドレス", example: "sato@example.com" }),
    password: z
      .string("パスワードは必須です。")
      .min(1, "パスワードは必須です。")
      .meta({ description: "パスワード" }),
  })
  .meta({ id: "LoginRequest" });

export type LoginRequest = z.infer<typeof loginRequestSchema>;

/** docs/api.md 5.1 POST /auth/login レスポンス(200) */
export const loginResponseSchema = z
  .object({
    accessToken: z.string().meta({ description: "アクセストークン(JWT想定)" }),
    staff: z.object({
      staffId: z.number().int(),
      name: z.string(),
      role: staffRoleSchema,
    }),
  })
  .meta({ id: "LoginResponse" });

export type LoginResponse = z.infer<typeof loginResponseSchema>;
