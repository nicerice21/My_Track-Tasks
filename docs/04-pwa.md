# 04. PWA 設計

ブラウザからの利用に限定し、PWA としてホーム画面に追加できるようにする。オフライン編集は行わず、基本的なキャッシュ・マニフェスト対応とする。

## 1. 目標

- ホーム画面 / スタンドアロン起動に対応
- アイコン・テーマカラー・表示モードの設定
- Service Worker によるアセットキャッシュ（オフライン表示の補助）
- ブラウザ限定利用なので、iOS Safari / Android Chrome 両方で動作確認

## 2. 使用ライブラリ

```bash
npm install -D @vite-pwa/nuxt
```

## 3. Nuxt 設定

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'MyToDo',
      short_name: 'MyToDo',
      description: '個人用タスク管理ツール',
      theme_color: '#0F172A',
      background_color: '#FFFFFF',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
});
```

## 4. 必要な静的アセット

`app/public/` に配置：

- `icon-192x192.png`
- `icon-512x512.png`
- `favicon.ico`

推奨：SVG アイコンも用意し、`favicon.svg` として配置。

## 5. Service Worker 方針

`@vite-pwa/nuxt` が生成する Workbox ベースの Service Worker を使用。

- **プリキャッシュ**: ビルド済み JS/CSS/HTML/アイコン
- **ランタイムキャッシュ**: API レスポンスはキャッシュしない（認証付きのため）
- **フォールバック**: オフライン時はトップページを表示

## 6. インストール促進

`app/components/PwaInstallPrompt.vue` のようなコンポーネントを作成し、beforeinstallprompt イベントを捕捉してインストールボタンを表示する（Android / Chrome）。

```vue
<script setup lang="ts">
const deferredPrompt = ref<Event | null>(null);
const showInstall = ref(false);

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    showInstall.value = true;
  });
});

async function installPwa() {
  if (!deferredPrompt.value) return;
  (deferredPrompt.value as any).prompt();
  const { outcome } = await (deferredPrompt.value as any).userChoice;
  if (outcome === 'accepted') {
    showInstall.value = false;
  }
}
</script>

<template>
  <div v-if="showInstall" class="pwa-prompt">
    <p>ホーム画面に追加して素早くアクセスできます</p>
    <button @click="installPwa">インストール</button>
  </div>
</template>
```

## 7. 制約事項

- iOS Safari は `beforeinstallprompt` に非対応。共有メニューから「ホーム画面に追加」を案内する。
- Cloudflare Access の認証 Cookie は Service Worker 経由でも維持されるが、キャッシュ戦略で認証情報が漏れないよう注意。
