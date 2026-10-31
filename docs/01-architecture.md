# 01. アーキテクチャ設計

## 1. 全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                         ユーザー                            │
│                    （ブラウザ / PWA）                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                  Cloudflare Access                          │
│            （メール/OTP/SAML による認証）                   │
│      未認証 → Cloudflare ログイン画面へリダイレクト         │
└──────────────────────────┬──────────────────────────────────┘
                           │ CF-Access-Audience / CF-Access-Jwt-Assertion
┌──────────────────────────▼──────────────────────────────────┐
│                 Cloudflare Workers                          │
│                   Nuxt 3 + Nitro                            │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │  Vue SPA/UI  │  Server API  │  PWA Assets  │             │
│  └──────────────┴──────────────┴──────────────┘             │
└──────────────┬─────────────────────────────┬────────────────┘
               │                             │
    ┌──────────▼──────────┐      ┌───────────▼────────────┐
    │   Cloudflare D1     │      │   Cloudflare R2        │
    │   （SQLite 互換）    │      │   添付ファイル（任意）  │
    └─────────────────────┘      └────────────────────────┘
```

## 2. 技術選定の理由

| 技術 | 選定理由 |
|---|---|
| **Nuxt 3** | Vue ベース、フロント/サーバ両方を 1 つのコードベースで管理でき、Cloudflare Workers プリセットでそのままデプロイ可能。 |
| **Nitro** | Nuxt のサーバエンジン。Workers 実行環境に最適化されており、D1 バインディングへ直接アクセス可能。 |
| **Drizzle ORM** | TypeScript ファーストで型安全。D1 対応が公式にサポートされている。 |
| **Cloudflare D1** | サーバレス SQLite。小〜中規模の個人アプリに十分な性能。無料枠が大きい。 |
| **Cloudflare Access** | Workers フロントの前に置くだけで全体を保護できる。認証ロジックを自前実装する必要がない。 |
| **Tailwind CSS + DaisyUI** | 軽量なユーティリティ CSS + シンプルなコンポーネント。PWA に最適。 |
| **手動 PWA** | `manifest.json` + カスタム Service Worker。ライブラリ依存を減らし軽量化。 |

## 3. 認証フロー

Cloudflare Access は Workers の前段で認証を完結させる。**アプリ側でログイン画面を作らない**。

```
1. ユーザーが https://todo.example.com にアクセス
2. Cloudflare Access が Cookie / JWT を確認
3. 未認証 → Cloudflare ログインページへリダイレクト
4. 認証済み → Workers へ転送
   ヘッダーに以下が追加される：
   - CF-Access-Client-Id
   - CF-Access-Jwt-Assertion
   - CF-Access-Audience
5. Workers（Nuxt server）で JWT を検証し、メールアドレスを取得
6. 取得したメールを `event.context.user.email` として後続処理に利用
```

### 所有者判定

単一ユーザー運用を前提とし、環境変数 `ALLOWED_EMAIL` に自分のメールアドレスを設定。
API ミドルウェアで `user.email === ALLOWED_EMAIL` をチェックし、不適合なら 403 を返す。

## 4. ディレクトリ構成（予定）

```
my-todo/
├── app/
│   ├── components/        # Vue コンポーネント
│   ├── composables/       # 状態管理・ロジック
│   ├── layouts/           # レイアウト
│   ├── pages/             # 画面ルート
│   ├── public/            # 静的ファイル（PWA アイコン等）
│   └── app.vue
├── server/
│   ├── api/               # API エンドポイント
│   ├── middleware/        # 認証ミドルウェア
│   ├── utils/             # DB 接続・ヘルパー
│   └── db/
│       └── schema.ts      # Drizzle スキーマ
├── migrations/            # D1 マイグレーション
├── docs/                  # 設計ドキュメント
├── nuxt.config.ts
├── wrangler.toml
└── package.json
```

## 5. データフロー

### タスク作成フロー

```
[ブラウザ]
   │ POST /api/v1/tasks { title, type, dueDate, ... }
   ▼
[Cloudflare Access] ── JWT 検証 ──▶ [Workers / Nuxt Server]
                                       │
                                       ▼
                              server/middleware/auth.ts
                              （JWT 検証 + 所有者判定）
                                       │
                                       ▼
                              server/api/v1/tasks.post.ts
                              （Drizzle で INSERT）
                                       │
                                       ▼
                              Cloudflare D1
```

### ページ表示フロー

```
[ブラウザ]
   │ GET / （Nuxt ルート）
   ▼
[Workers] ── SSR or SPA 配信 ──▶ [ブラウザ]
   │ 後続データ取得
   ▼
GET /api/v1/tasks?status=...
   ▼
D1 から該当タスクを取得
```

## 6. セキュリティ考慮事項

- **CORS**: 同一オリジン利用のみ許可。API はブラウザからの利用に限定。
- **CSRF**: Cloudflare Access の Cookie は `SameSite` 属性が付与される。自前のセッションは持たない。
- **認可**: すべての API で `user.email` を検証し、所有者のみ操作可能。
- **SQL インジェクション**: Drizzle ORM のパラメータクエリを使用。
- **入力検証**: `zod` でリクエストボディを検証。

## 7. 拡張性

将来的に以下を追加可能：

- **添付ファイル**: Cloudflare R2 + タスク紐付け
- **リマインダー**: Cloudflare Workers Cron Triggers + Email（SendGrid/Resend）
- **モバイル通知**: Web Push（Service Worker 経由）
