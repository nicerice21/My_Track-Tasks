# 07. UI ライブラリ選定案

## 前提

- デザインは**軽量・シンプル**を最優先
- SAP Fundamental Library のような「デザインシステム + コンポーネント提供」型を検討
- ブラウザ/PWA 利用、個人アプリなので巨大なライブラリは避けたい
- Vue 3 / Nuxt 3 で動作すること

## 推奨ランキング

### 1. Tailwind CSS + カスタムコンポーネント（最も推奨）

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

**メリット**
- 最も軽量（ビルド時に未使用スタイルを削除）
- デザインの自由度が最高
- PWA 起動時の CSS サイズを最小化できる
- Nuxt 公式統合 `@nuxtjs/tailwindcss` あり

**デメリット**
- コンポーネントは自作する必要がある
- 一貫性を保つために自前デザインシステムが必要

**向いているケース**
- Asana 風の独自 UI を作りたい
- パフォーマンスを最重視

### 2. Tailwind CSS + DaisyUI（シンプル実装を重視）

```bash
npm install -D tailwindcss daisyui
```

**メリット**
- Tailwind 上に構築された軽量コンポーネントライブラリ
- クラス名が意味ベース：`btn btn-primary`, `card`, `badge`
- テーマ切り替えが簡単
- バンドルサイズは PurgeCSS で小さくなる

**デメリット**
- 独自のクラス命名がある
- 高度なカスタマイズには Tailwind の知識が必要

**向いているケース**
- Fundamental Library ほど重量級ではなく、かしこまったデザインにしたい
- 実装コストを抑えつつ、ある程度整った見た目にしたい

### 3. Oruga

```bash
npm install @oruga-ui/oruga-next
```

**メリット**
- Vue 3 専用の軽量コンポーネントライブラリ
- デフォルトで最小限の CSS、自分でスタイルを当てやすい
- Bulma / Tailwind / Bootstrap などの CSS フレームワークと組み合わせ可能
- 柔軟なテーマ設定

**デメリット**
- 日本語情報が少ない
- コンポーネント数は多くない

**向いているケース**
- 「コンポーネントライブラリを使いたい」かつ「CSS は自分でコントロールしたい」

### 4. Naive UI

```bash
npm install naive-ui
```

**メリット**
- Vue 3 用、tree-shakeable
- モダンでクリーンなデザイン
- 豊富なコンポーネント
- TypeScript サポートが充実

**デメリット**
- プリセットの見た目が「中国系 UI」に近く、カスタマイズが必要
- ライブラリサイズは大きめ

**向いているケース**
- 豊富なコンポーネントをすぐに使いたい
- カスタマイズして独自色を出せる

### 5. Headless UI / Radix Vue

```bash
npm install @headlessui/vue
# または
npm install radix-vue
```

**メリット**
- アクセシビリティ対応の「骨格」コンポーネント
- スタイルは完全に自分で自由
- Tailwind と相性が良い

**デメリット**
- 見た目はすべて自作
- コンポーネント数が限定的

**向いているケース**
- アクセシビリティを確保しつつ、見た目は最小限に自作したい

## 比較表

| ライブラリ | 重さ | コンポーネント数 | カスタマイズ性 | 推奨度 |
|---|---|---|---|---|
| Tailwind CSS | 最小 | なし（自作） | 最高 | ★★★★★ |
| Tailwind + DaisyUI | 小 | 多め | 高 | ★★★★☆ |
| Oruga | 小 | 中程度 | 高 | ★★★★☆ |
| Naive UI | 中 | 多い | 中 | ★★★☆☆ |
| Headless UI | 小 | 少ない | 最高 | ★★★★☆ |
| SAP Fundamental Library | 大 | 多い | 中 | ★★☆☆☆ |

## 本プロジェクトへの推奨

**「Tailwind CSS + 一部 DaisyUI」** が最適です。

理由：
1. PWA 起動時の CSS サイズを最小化できる
2. 学生向け個人アプリなので、重厚なエンタープライズ UI は過剰
3. DaisyUI の `btn`, `card`, `badge`, `modal` などで実装コストを抑えつつ、Tailwind で独自調整可能
4. Nuxt 3 との統合が簡単

## 採用例（Nuxt 設定）

```bash
npm install -D @nuxtjs/tailwindcss daisyui
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    config: {
      plugins: [require('daisyui')],
      daisyui: {
        themes: ['light', 'dark'],
        logs: false,
      },
    },
  },
});
```

```vue
<!-- 使用例 -->
<template>
  <button class="btn btn-primary btn-sm">新規タスク</button>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h2 class="card-title">制御工学 演習問題</h2>
      <div class="badge badge-secondary">宿題</div>
    </div>
  </div>
</template>
```

## 結論

- **軽量・シンプル最重視** → Tailwind CSS のみ
- **実装の手間を減らしつつ軽量** → Tailwind + DaisyUI（推奨）
- **Vue コンポーネントライブラリが欲しい** → Oruga

SAP Fundamental Library はエンタープライズ向けで重厚なため、個人の PWA タスク管理ツールには過剰です。
