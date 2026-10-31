# 03. API 設計

Nuxt の `server/api/` 配下に Nitro ハンドラを配置。すべてのエンドポイントは `/api/v1/` 配下。

> **実装状況（Milestone 1）**: 科目・プロジェクト・タスクの CRUD とタスクの完了/未完了を実装済み。
> 進捗ログ（progress-logs）とダッシュボード集計は Milestone 2/3 で実装する。

## 1. ベース URL

```
https://todo.example.com/api/v1
```

## 2. 認証

リクエストヘッダーに Cloudflare Access の JWT が含まれる。`server/middleware/auth.ts` で検証し、失敗時は 401/403 を返す。

## 3. 共通レスポンス形式

成功時は `{ "success": true, "data": ... }` を返す（`server/utils/response.ts` の `ok()`）。

```json
{
  "success": true,
  "data": { ... }
}
```

エラー時は Nitro 標準の `createError` を使う（`{ statusCode, statusMessage, ... }`）。ステータスコードは 400（バリデーション）/ 401（未認証）/ 403（所有者外）/ 404（未検出）/ 500（DB 未接続等）。

### タイムスタンプ規約

- `created_at` / `updated_at` / `logged_at`（TEXT）: ISO 8601 文字列
- `due_date` / `target_completion_date` / `completed_date`（INTEGER）: UNIX **ミリ秒**（`Date.now()`）

## 4. エンドポイント一覧

### 4.1 ユーザー

#### GET /api/v1/me

現在のログインユーザー情報を返す。

**レスポンス:**

```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "displayName": "山田太郎"
  }
}
```

---

### 4.2 科目（Subjects）

#### GET /api/v1/subjects

科目一覧を取得。

#### POST /api/v1/subjects

科目を作成。

**リクエスト:**

```json
{
  "name": "制御工学",
  "code": "MEC-301",
  "color": "#3B82F6"
}
```

#### PATCH /api/v1/subjects/:id

科目を更新。

#### DELETE /api/v1/subjects/:id

科目を削除。紐づくタスクの `subject_id` は NULL にする。

---

### 4.3 プロジェクト（Projects）

#### GET /api/v1/projects

プロジェクト一覧を取得。

#### POST /api/v1/projects

プロジェクトを作成。

**リクエスト:**

```json
{
  "name": "歩行ロボットの制御系設計",
  "description": "卒業研究",
  "status": "active",
  "targetCompletionDate": 1751328000
}
```

#### GET /api/v1/projects/:id

プロジェクト詳細 + 進捗ログ一覧を取得。

#### PATCH /api/v1/projects/:id

プロジェクトを更新。

#### DELETE /api/v1/projects/:id

プロジェクトを削除。

---

### 4.4 タスク（Tasks）

#### GET /api/v1/tasks

タスク一覧を取得。クエリパラメータで絞り込み。

**クエリパラメータ:**

| パラメータ | 型 | 説明 |
|---|---|---|
| `status` | string | `not_started`, `in_progress`, `completed`, `archived` |
| `type` | string | `homework`, `report`, `research_progress` |
| `subject_id` | number | |
| `project_id` | number | |
| `due_before` | number | UNIX タイムスタンプ |
| `due_after` | number | UNIX タイムスタンプ |
| `priority` | string | |
| `limit` | number | デフォルト 50 |
| `offset` | number | デフォルト 0 |

**レスポンス:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "制御工学 演習問題",
        "type": "homework",
        "status": "not_started",
        "priority": "medium",
        "dueDate": 1743984000,
        "subject": { "id": 1, "name": "制御工学", "color": "#3B82F6" },
        "project": null,
        "recurrenceRule": "FREQ=WEEKLY;BYDAY=MO",
        "estimatedMinutes": 60,
        "actualMinutes": 0
      }
    ],
    "total": 12
  }
}
```

#### POST /api/v1/tasks

タスクを作成。

**リクエスト:**

```json
{
  "title": "中間レポート",
  "description": "締切に注意",
  "type": "report",
  "subjectId": 1,
  "projectId": null,
  "status": "not_started",
  "priority": "high",
  "dueDate": 1746057600,
  "estimatedMinutes": 480,
  "recurrenceRule": null,
  "tagIds": [1, 2]
}
```

#### GET /api/v1/tasks/:id

タスク詳細を取得。

#### PATCH /api/v1/tasks/:id

タスクを更新。部分更新を許容。

#### DELETE /api/v1/tasks/:id

タスクを削除。

#### POST /api/v1/tasks/:id/complete

タスクを完了状態にする。`recurrence_rule` がある場合は `task_completions` に完了履歴を記録。

**リクエスト:**

```json
{
  "completedDate": 1743984000
}
```

#### POST /api/v1/tasks/:id/uncomplete

タスクを未完了に戻す。

---

### 4.5 進捗ログ（Progress Logs）

#### GET /api/v1/projects/:projectId/progress-logs

進捗ログ一覧を取得。

#### POST /api/v1/projects/:projectId/progress-logs

進捗ログを作成。

**リクエスト:**

```json
{
  "content": "モータ特性の測定が完了",
  "progressPercent": 45
}
```

#### PATCH /api/v1/progress-logs/:id

進捗ログを更新。

#### DELETE /api/v1/progress-logs/:id

進捗ログを削除。

---

### 4.6 ダッシュボード

#### GET /api/v1/dashboard

ホーム画面用の集計情報を返す。

**レスポンス:**

```json
{
  "success": true,
  "data": {
    "todayTasks": [ ... ],
    "overdueTasks": [ ... ],
    "upcomingReports": [ ... ],
    "activeProjects": [ ... ],
    "weeklyHomework": [ ... ]
  }
}
```

## 5. ステータスコード

| コード | 用途 |
|---|---|
| 200 | 正常 |
| 201 | 作成成功 |
| 400 | バリデーションエラー |
| 401 | Access 認証未済 |
| 403 | 所有者ではない |
| 404 | リソースが存在しない |
| 500 | サーバエラー |

## 6. 実装ファイル対応例

| エンドポイント | ファイル |
|---|---|
| GET /api/v1/me | `server/api/v1/me.get.ts` |
| GET /api/v1/tasks | `server/api/v1/tasks/index.get.ts` |
| POST /api/v1/tasks | `server/api/v1/tasks/index.post.ts` |
| GET /api/v1/tasks/[id] | `server/api/v1/tasks/[id].get.ts` |
| PATCH /api/v1/tasks/[id] | `server/api/v1/tasks/[id].patch.ts` |
| POST /api/v1/tasks/[id]/complete | `server/api/v1/tasks/[id]/complete.post.ts` |
| GET /api/v1/dashboard | `server/api/v1/dashboard.get.ts` |
