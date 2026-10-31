# MyToDo — 個人用タスク管理ツール

Asana 風の、機械・情報系学生向け個人用タスク管理ツールの設計ドキュメント・プロトタイプ置き場。

## 概要

- **対象ユーザー**: 機械・情報系の学生（1人利用）
- **管理対象**: 毎週の宿題、レポート、個人的な研究プロジェクトの進捗
- **アーキテクチャ**: フロントエンド・バックエンド統合型（Nuxt + Nitro）
- **データベース**: Cloudflare D1
- **デプロイ先**: Cloudflare Workers
- **認証**: Cloudflare Access（ブラウザ利用のみ）
- **PWA**: ホーム画面追加・マニフェスト・Service Worker キャッシュ

## 設計ドキュメント

1. [アーキテクチャ設計](docs/01-architecture.md)
2. [データベース設計](docs/02-database.md)
3. [API 設計](docs/03-api.md)
4. [PWA 設計](docs/04-pwa.md)
5. [デプロイ・Access 設定](docs/05-deployment.md)
6. [UI/画面設計](docs/06-ui-design.md)

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Vue 3 + Nuxt 3 + TypeScript |
| バックエンド API | Nitro（Nuxt 統合、Cloudflare Workers プリセット） |
| ORM | Drizzle ORM（D1 対応） |
| DB | Cloudflare D1 |
| 認証 | Cloudflare Access |
| PWA | `@vite-pwa/nuxt` |
| スタイリング | Tailwind CSS（推奨） |
