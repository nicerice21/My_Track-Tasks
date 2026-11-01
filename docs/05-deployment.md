# 05. デプロイ・Cloudflare Access 設定

このドキュメントは [Cloudflare Developers](https://developers.cloudflare.com/) の最新情報を参考にしている。

## 1. 必要なもの

- Cloudflare アカウント
- カスタムドメイン（Workers 用）または `*.workers.dev`
- Cloudflare Access ポリシー（無料枠で利用可能）
- Wrangler CLI

## 2. Wrangler 初期設定

```bash
npm install -g wrangler
wrangler login
```

## 3. D1 データベースの作成

```bash
npx wrangler d1 create my-todo-db
```

出力例：

```text
✅ Successfully created DB 'my-todo-db' in region ENAM
Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads,
but backs up your data via point-in-time restore.

[[d1_databases]]
binding = "DB"
database_name = "my-todo-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

出力された `database_id` を `wrangler.toml` に記載する。

## 4. マイグレーションの適用

### ローカル

```bash
npx wrangler d1 migrations apply my-todo-db --local
```

### リモート

```bash
npx wrangler d1 migrations apply my-todo-db --remote
```

公式ドキュメント: [D1 wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/)

## 5. wrangler.toml

```toml
name = "my-todo"
main = "./.output/server/index.mjs"
compatibility_date = "2026-04-01"
compatibility_flags = ["nodejs_compat"]

[build]
command = "npx nuxt build --preset=cloudflare_module"

[assets]
directory = "./.output/public"
binding = "ASSETS"

[[d1_databases]]
binding = "MY_TODO_DB"
database_name = "my-todo-db"
database_id = "<your-database-id>"

[vars]
ALLOWED_EMAIL = "user@example.com"
ACCESS_AUDIENCE = "<your-access-audience-tag>"
ACCESS_TEAM_DOMAIN = "<your-team>.cloudflareaccess.com"
```

## 6. Cloudflare Access 設定

### 6.1 アプリケーション追加

1. Cloudflare Zero Trust コンソール → Access → Applications → Add an application
2. **Self-hosted** を選択
3. Application name: `MyToDo`
4. Session duration: `24h` 等適宜
5. **Application domain**: `todo.example.com` / `*.workers.dev`

### 6.2 Identity プロバイダー

- One-time PIN（メール認証）
- Google / GitHub OAuth
- または Microsoft Entra ID

推奨：個人利用なら **One-time PIN** が最も簡単。

### 6.3 アクセスポリシー

| 設定 | 値 |
|---|---|
| Policy name | `Allow owner` |
| Action | Allow |
| Rule | `Emails` → 自分のメールアドレス |

### 6.4 Workers 側で JWT を検証

Cloudflare Access は `cf-access-jwt-assertion` ヘッダーに JWT を渡す。`server/middleware/auth.ts` で検証している。

公式ドキュメント: [Validate Access JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)

## 7. ビルド・デプロイ

```bash
# 本番ビルド
npm run build:cloudflare

# デプロイ
npx wrangler deploy
```

または Wrangler の自動検出を使う場合：

```bash
npx wrangler deploy
```

公式ドキュメント: [Deploy a Nuxt application to Workers](https://developers.cloudflare.com/workers/frameworks/web-apps/nuxt/)

## 8. カスタムドメイン設定

1. Cloudflare ダッシュボード → Workers & Pages → `my-todo` → Triggers → Custom Domains
2. `todo.example.com` を追加
3. DNS レコードが自動作成される

## 9. 環境変数一覧

| 変数名 | 用途 | 設定場所 |
|---|---|---|
| `ALLOWED_EMAIL` | 許可するメールアドレス | wrangler.toml / Secrets |
| `ACCESS_AUDIENCE` | Access アプリケーションの Audience Tag | wrangler.toml |
| `ACCESS_TEAM_DOMAIN` | Cloudflare Zero Trust チームドメイン（`https://` 不要） | wrangler.toml |
| `DB` | D1 バインディング | wrangler.toml |

## 10. CI/CD

2 つの GitHub Actions ワークフローを設定済み。

### 10.1 CI（`.github/workflows/ci.yml`）

全ブランチへの push と main への PR で実行。`typecheck` → `test` → `build:cloudflare` を実行する。

### 10.2 Deploy（`.github/workflows/deploy.yml`）

`main` への push と手動実行（`workflow_dispatch`）で実行。[cloudflare/wrangler-action](https://github.com/cloudflare/wrangler-action) を使い、`wrangler.toml` の `[build]` コマンド（`npx nuxt build --preset=cloudflare_module`）を実行してからデプロイする。

### 10.3 必要なリポジトリシークレット

| シークレット | 説明 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 「Edit Cloudflare Workers」権限を持つ API トークン |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID |

GitHub CLI で設定する場合：

```bash
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
```

公式ドキュメント: [Cloudflare Workers CI/CD](https://developers.cloudflare.com/workers/wrangler/ci-cd/)
