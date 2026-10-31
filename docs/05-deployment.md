# 05. デプロイ・Cloudflare Access 設定

## 1. 必要なもの

- Cloudflare アカウント
- カスタムドメイン（Workers 用）または `*.workers.dev`
- Cloudflare Access ポリシー（無料枠で利用可能）
- Wrangler CLI

## 2. Wrangler 初期設定

```bash
# プロジェクト作成後
npm install -g wrangler
wrangler login
```

## 3. wrangler.toml

```toml
name = "my-todo"
main = "./.output/server/index.mjs"
compatibility_date = "2026-04-01"
compatibility_flags = ["nodejs_compat_v2"]

[build]
command = "npx nuxt build --preset=cloudflare_module"

[[d1_databases]]
binding = "DB"
database_name = "my-todo-db"
database_id = "<your-database-id>"

[vars]
ALLOWED_EMAIL = "user@example.com"
ACCESS_AUDIENCE = "<your-access-audience-tag>"
ACCESS_TEAM_DOMAIN = "<your-team>.cloudflareaccess.com"
```

## 4. D1 データベース作成

```bash
wrangler d1 create my-todo-db
# 出力された database_id を wrangler.toml に記載
```

## 5. マイグレーション実行

```bash
wrangler d1 migrations create my-todo-db init
# migrations/0001_init.sql を編集
wrangler d1 migrations apply my-todo-db --local
wrangler d1 migrations apply my-todo-db --remote
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

### 6.4 Workers 側で検証

Nuxt サーバミドルウェアで Access からの JWT を検証する。

```ts
// server/middleware/auth.ts
import { createRemoteJWKSet, jwtVerify } from 'jose';

const ACCESS_CERTS_URL = `https://${process.env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`;

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/')) return;

  const token = getHeader(event, 'CF-Access-Jwt-Assertion');
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const JWKS = createRemoteJWKSet(new URL(ACCESS_CERTS_URL));
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://${process.env.ACCESS_TEAM_DOMAIN}`,
      audience: process.env.ACCESS_AUDIENCE,
    });

    const email = payload.email as string;
    if (email !== process.env.ALLOWED_EMAIL) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

    event.context.user = { email };
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
});
```

## 7. ビルド・デプロイ

```bash
# ローカル確認
npm run dev

# 本番ビルド
npm run build

# デプロイ
wrangler deploy
```

## 8. カスタムドメイン設定

1. Cloudflare ダッシュボード → Workers & Pages → `my-todo` → Triggers → Custom Domains
2. `todo.example.com` を追加
3. DNS レコードが自動作成される

## 9. 環境変数一覧

| 変数名 | 用途 | 設定場所 |
|---|---|---|
| `ALLOWED_EMAIL` | 許可するメールアドレス | wrangler.toml / Secrets |
| `ACCESS_AUDIENCE` | Access アプリケーションの Audience Tag | wrangler.toml |
| `ACCESS_TEAM_DOMAIN` | Cloudflare Zero Trust チームドメイン | wrangler.toml |
| `DB` | D1 バインディング | wrangler.toml |

## 10. CI/CD（オプション）

GitHub Actions でデプロイ：

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
      - run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```
