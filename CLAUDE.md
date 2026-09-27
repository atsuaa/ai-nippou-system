# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## プロジェクトの現状

`create-next-app`でNext.jsプロジェクトを初期化済み(TypeScript / Tailwind CSS / App Router / `src`ディレクトリ構成)。ESLintとVitestは導入済み。Prismaも導入済み(`prisma/schema.prisma`にDBスキーマを定義、ローカル開発はSQLite)。UIコンポーネント(shadcn/ui)・OpenAPI/Zodはまだ未導入で、`src/app`の内容もテンプレートのまま。

## よく使うコマンド

```bash
npm run dev        # 開発サーバー起動(http://localhost:3000)
npm run build      # 本番ビルド
npm run start      # 本番ビルドの起動
npm run lint       # ESLint実行
npm run test       # Vitest実行(1回のみ)
npm run test:watch # Vitest実行(watchモード)
npm run db:migrate # マイグレーション作成・ローカルDB(SQLite)へ適用(prisma migrate dev)
npm run db:generate # Prisma Clientの再生成(prisma generate)
npm run db:seed    # シードデータ投入(docs/test.md 2章のテスト用マスタデータ)
npm run db:studio  # Prisma Studio起動(DBの中身をGUIで確認)
```

単体のテストファイルのみ実行する場合は `npm run test -- src/app/page.test.tsx` のようにパスを渡す。

## DBスキーマ設定(Prisma)

`prisma/schema.prisma` で `docs/requirements.md` 5章のER図・6章のテーブル定義に対応する5モデル(SalesStaff / Customer / DailyReport / VisitRecord / Comment)を定義している。各モデルのフィールド名はAPI仕様書(`docs/api.md`)に合わせたcamelCase、DBカラム名は`@map`/`@@map`でER図通りのsnake_caseにマッピングしている。

- ローカル開発DBはSQLite(`.env`の`DATABASE_URL="file:./dev.db"`。`.env`は`.gitignore`対象のため、初回は`.env.example`をコピーして使う)
- Prisma 7系のため、Prisma Client生成には`generator`ブロックの`output`指定と`@prisma/adapter-better-sqlite3`によるドライバアダプタが必須(Rust-freeクライアント)。生成先`src/generated/prisma`は`.gitignore`対象
- 設定ファイルは`prisma.config.ts`(スキーマ・マイグレーション・シードコマンドの参照先を定義)
- シードスクリプトは`prisma/seed.ts`。`npx prisma migrate dev`実行時、および`npm run db:seed`で`docs/test.md` 2章のテスト用マスタデータ(STAFF-1〜5, CUST-1〜2, REPORT-1)を投入する
- 本番DB接続・Cloud Run側の接続設定は未着手(別issueのスコープ)

## Lint設定

`eslint.config.mjs`(ESLint 9 flat config)で `eslint-config-next` の `core-web-vitals` と `typescript` ルールセットを適用している。`.next/`、`out/`、`build/`、`next-env.d.ts` はlint対象外。

## テスト設定

`vitest.config.mts`でVitestを設定。`jsdom`環境 + `@vitejs/plugin-react` + `resolve.tsconfigPaths: true`(`@/*`エイリアス解決)を使用し、`@testing-library/react` + `@testing-library/jest-dom`(`vitest.setup.ts`で読み込み)でコンポーネントテストを書く。テストファイルはテスト対象と同じディレクトリに`*.test.tsx`として置く(例: `src/app/page.test.tsx`)。

## Git hooks(Husky)

`npm install`時に`prepare`スクリプトが`husky`を実行し、`core.hooksPath`が`.husky/_`に設定される。`.husky/pre-commit`で`npm run lint`→`npm test`をコミット前に実行し、失敗時はコミットを止める。`.husky/_`は自動生成物のため`.gitignore`済み。

## CI/CD(GitHub Actions → Cloud Run)

- **GCPプロジェクト**: `ma-ai-nippou-system` / **リージョン**: `asia-northeast1` / **Cloud Runサービス名・Artifact Registryリポジトリ名**: `ai-nippou-system`
- **`.github/workflows/ci.yml`**: PRおよびmainへのpushで`lint` → `test` → `build`を実行
- **`.github/workflows/deploy.yml`**: mainへのpushで、Workload Identity Federation(`google-github-actions/auth`)経由でGCPに認証し、`make release`(Makefile参照)でビルド・push・Cloud Runデプロイまで一括実行する。GitHub側に`vars.WIF_PROVIDER` / `vars.WIF_SERVICE_ACCOUNT`(Repository variables)の設定が必要
- **デプロイコマンドは全て`Makefile`に集約**している(`make build` / `push` / `deploy` / `release`)。GCP側インフラの初回セットアップ(API有効化・Artifact Registry作成・サービスアカウント作成・WIF設定)も`make setup-*`ターゲットとして用意しており、Makefile内のコメントに手順がある
- **Dockerfile**: `next.config.ts`の`output: "standalone"`を前提にした3段階ビルド(`deps` → `builder` → `runner`)。Cloud Runは`PORT`環境変数を自動注入するため、Dockerfile側の`ENV PORT=3000`はローカル実行時のフォールバック
- **`--allow-unauthenticated`で公開している**。アプリ自体の認証方式は`docs/requirements.md`の検討事項として未確定なので、実データを扱う前にCloud Run側のアクセス制御(IAM invoker限定 or アプリ内認証)を見直すこと

## 採用技術

| 分類 | 技術 | 状態 |
|---|---|---|
| 言語 | TypeScript | 導入済み |
| フレームワーク | Next.js(App Router) | 導入済み |
| Lint | ESLint(eslint-config-next) | 導入済み |
| スタイリング | Tailwind CSS | 導入済み |
| UIコンポーネント | shadcn/ui | 未導入 |
| APIスキーマ定義 | OpenAPI(Zodによる検証) | 未導入 |
| DBスキーマ定義 | Prisma(ローカル開発はSQLite) | 導入済み |
| テスト | Vitest + React Testing Library | 導入済み |
| デプロイ | Google Cloud Run | 未設定 |

`docs/api.md` のREST API設計はOpenAPI定義として、`docs/requirements.md` のER図はPrismaスキーマとして、それぞれ実装に落とし込む前提。

## このシステムについて

営業日報システム: 営業担当者がその日に訪問した顧客と訪問内容を記録する。各日報にはProblem(現在の課題・相談)とPlan(明日やること)も記載でき、それらに対して上長がコメントできる。顧客・営業担当者はマスタデータとして管理する。

## ドキュメントマップ

設計ドキュメントは `docs/` にあり、互いに参照し合っている。作業に着手する際は以下の順で読むこと。

1. `docs/requirements.md` — 機能要件(FR-01〜FR-14)と、未確定事項(「検討事項」)のリスト: 認証方式、日報が1担当者1日1件に限定されるか、下書き/提出済みステータス、通知、保存期間・履歴。
2. `docs/screens.md` — 7画面(SC-01〜SC-07)。Mermaidによる画面遷移図、項目レベルの定義、各項目とFR番号の対応付けを含む。
3. `docs/api.md` — `/api/v1` 配下のREST API。リソースごとのエンドポイント一覧表があり、それぞれFR番号に対応付けられている。
4. `docs/test.md` — 画面・APIの両方に対応するテストケースと、ロールベースの権限マトリクス。

## コアデータモデル

`docs/requirements.md` のMermaid `erDiagram` で定義され、他3つのドキュメントでも一貫して使われている。

- **SALES_STAFF** — 営業担当者と上長を1つのマスタで管理する。`role`で営業担当者/上長/管理者を区別し、`manager_id`が`SALES_STAFF`自身を自己参照することで上長関係を表現する(誰が誰の日報にコメントできるかを左右する)。
- **CUSTOMER** — `SALES_STAFF`への`primary_staff_id`(任意)を持つ。
- **DAILY_REPORT** — 1担当者1日1件(`UNIQUE(staff_id, report_date)`、暫定)。自由記述の`problem`と`plan`を直接保持する。
- **VISIT_RECORD** — `DAILY_REPORT`の1対多子テーブル。1行が1顧客への訪問(`CUSTOMER`へのFK)と、その内容を表す。日報には必ず1行以上の訪問記録が存在する。
- **COMMENT** — `DAILY_REPORT`の1対多子テーブル。上長からの返信であり、`problem`と`plan`個別にはスコープされない。

## 維持すべきアーキテクチャ判断

- **VISIT_RECORDには独立したCRUD APIを持たせない。** `docs/api.md`では`visits`を`POST/PUT /reports`に埋め込む配列として送信し、`GET /reports/{reportId}`も訪問記録・コメントをまとめて返す。これは`docs/screens.md`のSC-03(日報全体を1つのフォームとして保存する画面)と対応している。訪問記録用の別エンドポイントに分割する場合は、両ドキュメントを合わせて更新すること。
- **SC-03(日報詳細)は2画面ではなく、2モードを持つ単一画面である。** 作成者本人には編集可能なフォームが、それ以外(上長)には読み取り専用の日報本体とコメント欄のみが表示される。画面遷移ではなく、アクセス権制御によってモードが切り替わる。
- **権限モデルは`SALES_STAFF.manager_id`を軸に成り立つ。** 上長は、日報作成者の`manager_id`が自分を指している場合にのみ、その日報を閲覧・コメントできる。`docs/test.md`の権限マトリクスの一部(例: 本人が自分の日報にコメントできるか、管理者が日報を閲覧できるか)は「検討事項」として保留になっている。`docs/requirements.md` 4章が確定するまで、これらに勝手な答えを当てはめないこと。
