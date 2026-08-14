# 営業日報システム API仕様書

作成日: 2026-08-14 / バージョン: 0.1(ドラフト)
関連ドキュメント: [要件定義書](./requirements.md) / [画面定義書](./screens.md)

## 1. 概要

| 項目 | 内容 |
|---|---|
| ベースURL | `/api/v1` |
| データ形式 | JSON(リクエスト・レスポンスとも `application/json`) |
| 文字コード | UTF-8 |
| 日時形式 | ISO 8601(例: `2026-08-14T09:30:00+09:00`) |
| 認証方式 | Bearer Token(JWT想定・要件定義書「4. 検討事項」の権限設計と合わせて確定) |

## 2. 認証

すべてのエンドポイント(`/auth/login` を除く)は、リクエストヘッダに以下を付与する。

```
Authorization: Bearer <access_token>
```

トークンには `staffId` と `role` を含め、サーバー側で以下のアクセス制御を行う。

| role | アクセス範囲 |
|---|---|
| 営業担当者 | 自分自身が作成した日報のみ参照・編集可 |
| 上長 | 自分の日報に加え、自分が `managerId` として紐づく担当者の日報を参照・コメント可 |
| 管理者 | 顧客マスタ・営業担当者マスタの参照・編集が可能 |

## 3. 共通仕様

### 3.1 レスポンス形式(成功時)

単一リソース、一覧ともに `data` キーの中にリソースを格納する。

```json
{
  "data": { }
}
```

一覧系エンドポイントはページネーション情報を `meta` に含める。

```json
{
  "data": [ ],
  "meta": {
    "page": 1,
    "perPage": 20,
    "totalCount": 42
  }
}
```

### 3.2 ページネーションクエリパラメータ

| パラメータ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `page` | integer | 1 | ページ番号 |
| `perPage` | integer | 20 | 1ページあたりの件数 |

### 3.3 エラーレスポンス形式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "customerId は必須です。",
    "details": [
      { "field": "customerId", "message": "必須項目です。" }
    ]
  }
}
```

### 3.4 HTTPステータスコード

| コード | 意味 |
|---|---|
| 200 | 成功(取得・更新) |
| 201 | 成功(新規作成) |
| 204 | 成功(本文なし、削除等) |
| 400 | リクエスト不正・バリデーションエラー |
| 401 | 未認証 |
| 403 | 権限なし(アクセス範囲外のリソース) |
| 404 | リソースが存在しない |
| 409 | 一意制約違反(例: 同一担当者・同一報告日の日報が既に存在) |
| 500 | サーバーエラー |

## 4. エンドポイント一覧

| メソッド | パス | 概要 | 関連FR |
|---|---|---|---|
| POST | `/auth/login` | ログイン | - |
| GET | `/staff` | 営業担当者マスタ一覧 | FR-12 |
| POST | `/staff` | 営業担当者マスタ登録 | FR-12 |
| GET | `/staff/{staffId}` | 営業担当者マスタ詳細 | FR-12 |
| PUT | `/staff/{staffId}` | 営業担当者マスタ更新 | FR-12, FR-14 |
| DELETE | `/staff/{staffId}` | 営業担当者マスタ削除 | FR-12 |
| GET | `/customers` | 顧客マスタ一覧 | FR-11 |
| POST | `/customers` | 顧客マスタ登録 | FR-11 |
| GET | `/customers/{customerId}` | 顧客マスタ詳細 | FR-11 |
| PUT | `/customers/{customerId}` | 顧客マスタ更新 | FR-11, FR-13 |
| DELETE | `/customers/{customerId}` | 顧客マスタ削除 | FR-11 |
| GET | `/reports` | 日報一覧 | FR-04, FR-05 |
| POST | `/reports` | 日報新規作成(訪問記録を含む) | FR-01, FR-02, FR-03, FR-06, FR-07 |
| GET | `/reports/{reportId}` | 日報詳細(訪問記録・コメント含む) | FR-04, FR-05 |
| PUT | `/reports/{reportId}` | 日報更新(訪問記録を含む) | FR-01, FR-02, FR-03, FR-06, FR-07 |
| DELETE | `/reports/{reportId}` | 日報削除 | - |
| GET | `/reports/{reportId}/comments` | コメント一覧 | FR-09, FR-10 |
| POST | `/reports/{reportId}/comments` | コメント投稿 | FR-08, FR-09, FR-10 |

## 5. エンドポイント定義

### 5.1 POST /auth/login

ログインし、アクセストークンを発行する。

**リクエストボディ**

| 項目 | 型 | 必須 | 説明 |
|---|---|---|---|
| `email` | string | ○ | メールアドレス |
| `password` | string | ○ | パスワード |

```json
{
  "email": "sato@example.com",
  "password": "********"
}
```

**レスポンス(200)**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJI...",
    "staff": {
      "staffId": 12,
      "name": "佐藤 太郎",
      "role": "営業担当者"
    }
  }
}
```

**エラー**: 401(メールアドレスまたはパスワードが不正)

---

### 5.2 営業担当者マスタ

#### GET /staff

営業担当者マスタを一覧取得する。管理者のみ利用可。

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | string | - | 氏名の部分一致検索 |
| `role` | string | - | `営業担当者` / `上長` / `管理者` で絞り込み |

**レスポンス(200)**

```json
{
  "data": [
    {
      "staffId": 12,
      "name": "佐藤 太郎",
      "email": "sato@example.com",
      "role": "営業担当者",
      "managerId": 3,
      "managerName": "鈴木 一郎"
    }
  ],
  "meta": { "page": 1, "perPage": 20, "totalCount": 1 }
}
```

#### POST /staff

営業担当者を新規登録する。管理者のみ利用可。

**リクエストボディ**

| 項目 | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | string | ○ | 氏名 |
| `email` | string | ○ | メールアドレス(一意) |
| `role` | string | ○ | `営業担当者` / `上長` / `管理者` |
| `managerId` | integer | - | 上長の `staffId`。`role` が「上長」の担当者を指定 |

**レスポンス(201)**: 登録した営業担当者オブジェクト

**エラー**: 400(バリデーションエラー)、409(メールアドレス重複)

#### GET /staff/{staffId}

営業担当者の詳細を取得する。

**レスポンス(200)**: 営業担当者オブジェクト
**エラー**: 404

#### PUT /staff/{staffId}

営業担当者情報を更新する。リクエストボディはPOSTと同様。

**レスポンス(200)**: 更新後の営業担当者オブジェクト
**エラー**: 400, 404, 409

#### DELETE /staff/{staffId}

営業担当者を削除する。

**レスポンス**: 204
**エラー**: 404、409(配下に担当者や日報が存在する場合の扱いは検討事項)

---

### 5.3 顧客マスタ

#### GET /customers

顧客マスタを一覧取得する。

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | string | - | 顧客名の部分一致検索 |

**レスポンス(200)**

```json
{
  "data": [
    {
      "customerId": 101,
      "customerName": "株式会社サンプル",
      "industry": "製造業",
      "address": "東京都千代田区...",
      "phone": "03-xxxx-xxxx",
      "primaryStaffId": 12,
      "primaryStaffName": "佐藤 太郎"
    }
  ],
  "meta": { "page": 1, "perPage": 20, "totalCount": 1 }
}
```

#### POST /customers

顧客を新規登録する。管理者のみ利用可。

**リクエストボディ**

| 項目 | 型 | 必須 | 説明 |
|---|---|---|---|
| `customerName` | string | ○ | 顧客名 |
| `industry` | string | - | 業種 |
| `address` | string | - | 住所 |
| `phone` | string | - | 電話番号 |
| `primaryStaffId` | integer | - | 主担当営業の `staffId` |

**レスポンス(201)**: 登録した顧客オブジェクト
**エラー**: 400

#### GET /customers/{customerId}

顧客の詳細を取得する。

**レスポンス(200)**: 顧客オブジェクト
**エラー**: 404

#### PUT /customers/{customerId}

顧客情報を更新する。リクエストボディはPOSTと同様。

**レスポンス(200)**: 更新後の顧客オブジェクト
**エラー**: 400, 404

#### DELETE /customers/{customerId}

顧客を削除する。

**レスポンス**: 204
**エラー**: 404、409(訪問記録が存在する顧客の削除可否は検討事項)

---

### 5.4 日報

#### GET /reports

日報を一覧取得する。営業担当者は自分の日報のみ、上長は自分と配下の日報を取得する(サーバー側でアクセストークンの `staffId` / `role` を用いて絞り込む)。

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `staffId` | integer | - | 上長・管理者が配下の担当者を指定する場合に使用 |
| `dateFrom` | date | - | 報告日の範囲検索(開始) |
| `dateTo` | date | - | 報告日の範囲検索(終了) |

**レスポンス(200)**

```json
{
  "data": [
    {
      "reportId": 5001,
      "staffId": 12,
      "staffName": "佐藤 太郎",
      "reportDate": "2026-08-14",
      "visitCount": 3,
      "commentCount": 1
    }
  ],
  "meta": { "page": 1, "perPage": 20, "totalCount": 1 }
}
```

#### POST /reports

日報を新規作成する。訪問記録は配列として同時に登録する(FR-02)。

**リクエストボディ**

| 項目 | 型 | 必須 | 説明 |
|---|---|---|---|
| `reportDate` | date | ○ | 報告日 |
| `problem` | string | - | 課題・相談(FR-06) |
| `plan` | string | - | 明日やること(FR-07) |
| `visits` | array | ○(1件以上) | 訪問記録の配列 |
| `visits[].customerId` | integer | ○ | 訪問した顧客(FR-03) |
| `visits[].visitTime` | string | - | 訪問時刻・順序 |
| `visits[].visitContent` | string | ○ | 訪問内容 |

```json
{
  "reportDate": "2026-08-14",
  "problem": "A社の見積もりが競合と価格差で止まっている。値引き判断の相談をしたい。",
  "plan": "明日はB社に再訪問し、C社に見積書を送付する。",
  "visits": [
    { "customerId": 101, "visitTime": "10:00", "visitContent": "新製品の提案。見積もり依頼を受領。" },
    { "customerId": 102, "visitTime": "14:00", "visitContent": "定期フォロー。次回訪問は来月。" }
  ]
}
```

**レスポンス(201)**: 作成した日報オブジェクト(訪問記録を含む)
**エラー**: 400(バリデーションエラー、訪問記録0件など)、409(同一担当者・同一報告日の日報が既に存在)

#### GET /reports/{reportId}

日報の詳細を、訪問記録・コメントを含めて取得する。

**レスポンス(200)**

```json
{
  "data": {
    "reportId": 5001,
    "staffId": 12,
    "staffName": "佐藤 太郎",
    "reportDate": "2026-08-14",
    "problem": "A社の見積もりが競合と価格差で止まっている。値引き判断の相談をしたい。",
    "plan": "明日はB社に再訪問し、C社に見積書を送付する。",
    "visits": [
      {
        "visitId": 9001,
        "customerId": 101,
        "customerName": "株式会社サンプル",
        "visitTime": "10:00",
        "visitContent": "新製品の提案。見積もり依頼を受領。"
      }
    ],
    "comments": [
      {
        "commentId": 3001,
        "staffId": 3,
        "staffName": "鈴木 一郎",
        "commentContent": "値引きは15%まで許容可能。明日相談しよう。",
        "createdAt": "2026-08-14T19:20:00+09:00"
      }
    ],
    "createdAt": "2026-08-14T18:05:00+09:00",
    "updatedAt": "2026-08-14T18:05:00+09:00"
  }
}
```

**エラー**: 403(自分・配下以外の日報)、404

#### PUT /reports/{reportId}

日報を更新する。作成者本人のみ利用可。リクエストボディはPOSTと同様(`visits` は全件置き換え)。

**レスポンス(200)**: 更新後の日報オブジェクト
**エラー**: 400, 403(作成者本人以外)、404

#### DELETE /reports/{reportId}

日報を削除する。作成者本人のみ利用可。

**レスポンス**: 204
**エラー**: 403, 404

---

### 5.5 コメント

#### GET /reports/{reportId}/comments

指定した日報のコメント一覧を取得する。

**レスポンス(200)**

```json
{
  "data": [
    {
      "commentId": 3001,
      "staffId": 3,
      "staffName": "鈴木 一郎",
      "commentContent": "値引きは15%まで許容可能。明日相談しよう。",
      "createdAt": "2026-08-14T19:20:00+09:00"
    }
  ]
}
```

**エラー**: 403(自分・配下以外の日報)、404

#### POST /reports/{reportId}/comments

日報にコメントを投稿する(FR-08)。

**リクエストボディ**

| 項目 | 型 | 必須 | 説明 |
|---|---|---|---|
| `commentContent` | string | ○ | コメント内容 |

```json
{
  "commentContent": "値引きは15%まで許容可能。明日相談しよう。"
}
```

**レスポンス(201)**: 作成したコメントオブジェクト
**エラー**: 400, 403(コメント権限がない担当者)、404

## 6. エラーコード一覧

| コード | HTTPステータス | 説明 |
|---|---|---|
| `UNAUTHORIZED` | 401 | 未認証、またはトークン無効・期限切れ |
| `FORBIDDEN` | 403 | アクセス権限がないリソースへの操作 |
| `NOT_FOUND` | 404 | 指定したリソースが存在しない |
| `VALIDATION_ERROR` | 400 | 入力値の不正 |
| `DUPLICATE_REPORT` | 409 | 同一担当者・同一報告日の日報が既に存在する |
| `DUPLICATE_EMAIL` | 409 | メールアドレスが既に登録されている |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |

## 7. 未確定事項

- 認証方式(パスワード認証/SSO)とトークンの有効期限・リフレッシュ方式
- 日報のステータス(下書き/提出済み)を採用する場合、`POST/PUT /reports` に `status` 項目とステータス遷移のバリデーションを追加する必要がある
- 営業担当者・顧客の削除時、関連する日報・訪問記録が存在する場合の扱い(論理削除 or 削除不可)
- コメントの編集・削除APIの要否
