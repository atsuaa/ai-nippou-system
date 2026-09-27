---
name: programmer-git-workflow
description: programmerサブエージェントが実装作業を行う際のgitワークフロー。mainブランチでは実装せずfeature/bugfixブランチを切ること、並列実装の指示がある場合はgit worktreeを使うこと、実装完了後のcommit/push/PR作成、worktree利用時の後片付けを規定する。実装タスクに着手する前・完了後に必ず参照する。
---

# programmer gitワークフロー

programmerサブエージェントがソースコードの実装(新機能・バグ修正・改修)を行う際は、このワークフローに従うこと。

## 1. 実装開始前: ブランチを切る

- **mainブランチのまま実装を始めない。** 実装に着手する前に必ず `git status` / `git branch --show-current` で現在のブランチを確認する。
- mainブランチにいる場合、作業内容に応じて以下の命名規則でブランチを作成する。
  - 新機能・改修: `feature/<簡潔な説明>` (例: `feature/daily-report-comment-api`)
  - バグ修正: `bugfix/<簡潔な説明>` (例: `bugfix/visit-record-validation`)
- ブランチ名は英語・kebab-caseで、対応するFR番号やIssue番号がわかる場合は含める(例: `feature/fr-07-comment-api`)。
- すでにfeature/bugfixブランチ上で作業を依頼された場合は、新たにブランチを切らずそのブランチ上で作業を続けてよい。

## 2. 並列実装が指示された場合: git worktreeを使う

複数の実装タスクを並列に進めるよう指示された場合、通常の`git checkout -b`ではなく`git worktree`を使い、作業ディレクトリを分離する。

```bash
# リポジトリルートの一つ上の階層に worktree 用ディレクトリを作る例
git worktree add ../ai-nippou-system-worktrees/<branch-name> -b <branch-name>
```

- worktreeの配置先はリポジトリ本体の外(例: `../ai-nippou-system-worktrees/<branch-name>`)にし、プロジェクト本体の`.gitignore`や既存ファイルと衝突しない場所を選ぶ。
- 各worktree内で`npm install`(必要な場合)を行い、以後の実装・lint・test・buildはそのworktreeのディレクトリ内で行う。
- 並列実装の指示がない通常の単一タスクでは、worktreeを使わず通常のブランチ切り替えで十分。過剰に使わないこと。

## 3. 実装完了後: commit → push → PR作成

実装が完了し、`npm run lint` / `npm run test` / `npm run build` などで問題がないことを確認したら、以下を行う。

1. **commit**
   - 変更ファイルを確認し(`git status` / `git diff`)、関連するファイルのみを`git add`する。
   - コミットメッセージはHEREDOCで渡し、「なぜ」を中心に簡潔に記述する。
   - Git Safety Protocol(destructiveなコマンドを使わない、hooksをスキップしない等)を守る。
   - コミットメッセージの末尾には、このセッションのsystem-reminderで指定されているattribution line(`Co-Authored-By: ...`)を付与する。
2. **push**
   - 作業ブランチをリモートにpushする(`git push -u origin <branch-name>`)。mainへの直接pushやforce pushは行わない。
3. **PR作成**
   - `gh pr create`でPRを作成する。タイトルは70文字以内で簡潔に。
   - 本文には実装内容(何を・なぜ変更したか)、対応するFR番号/SC番号/APIエンドポイント、テスト計画(チェックリスト形式)を記載する。
   - 未確定事項に依存して暫定実装した箇所やTODOコメントを残した箇所がある場合、PR本文にも明記し、レビュアー(設計者)が判断できるようにする。
   - 本文末尾には、system-reminderで指定されているPR用attribution line(`🤖 Generated with [Claude Code](...)`)を付与する。

## 4. worktreeを使っていた場合: 後片付け

worktreeを使って実装した場合、PR作成後(実装完了後)に必ず後片付けを行う。

```bash
# worktreeの削除(コミット・pushが完了していることを確認した上で実行)
git worktree remove ../ai-nippou-system-worktrees/<branch-name>
```

- 削除前に、そのworktree内の変更がすべてcommit・push済みであることを確認する。未commitの変更が残っている場合は削除せず、ユーザーに報告する。
- `git worktree remove`が未commit変更を検知して失敗する場合、`--force`で強制削除せず、まず状況を確認してから対応する。
- worktreeを使わなかった通常のブランチ作業では、この後片付け手順は不要(ブランチ自体は残してPRのレビュー・マージに使う)。

## 禁止事項

- mainブランチに直接コミットしない。
- 未確認のままforce push・`git worktree remove --force`・`git branch -D`など破壊的操作を行わない。
- 並列実装の指示がないのにworktreeを使う、または並列実装の指示があるのにworktreeを使わず同一ディレクトリで複数ブランチを切り替えながら並行作業する、といった不整合な進め方をしない。
