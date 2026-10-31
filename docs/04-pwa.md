# 04. PWA 設計

ブラウザからの利用に限定し、PWA としてホーム画面に追加できるようにする。オフライン編集は行わず、基本的なキャッシュ・マニフェスト対応とする。

## 1. 目標

- ホーム画面 / スタンドアロン起動に対応
- アイコン・テーマカラー・表示モードの設定
- Service Worker によるアセットキャッシュ（オフライン表示の補助）
- 対象は Windows PC（Chrome/Edge）と Android（Chrome）

## 2. 方針

`@vite-pwa/nuxt` ではなく、**手動で最小構成の PWA** を実装する。

理由：
- Nuxt 3.21 との互換性問題を回避
- 個人アプリに必要な機能のみを含め、軽量に保つ
- キャッシュ戦略を自分で完全にコントロールできる

## 3. ファイル構成

```
public/
├── manifest.json              # PWA マニフェスト
├── sw.js                      # Service Worker
├── icon-192x192.svg           # アイコン
├── icon-512x512.svg
└── icon-maskable-512x512.svg

app/
├── app.vue                    # manifest / favicon リンク
└── plugins/
    └── register-sw.client.ts  # Service Worker 登録
```

## 4. manifest.json

`public/manifest.json` に設定済み。

主な設定：
- `display: standalone`
- `theme_color: #0F172A`
- `background_color: #FFFFFF`
- アイコン：SVG 形式のプレースホルダー

## 5. Service Worker

`public/sw.js` にシンプルなキャッシュ戦略を実装。

- **install**: 静的アセットをプリキャッシュ
- **activate**: 古いキャッシュを削除
- **fetch**:
  - `/api/` はキャッシュしない
  - その他は Cache First
  - オフライン時はトップページをフォールバック

## 6. Service Worker 登録

`app/plugins/register-sw.client.ts` でクライアント側から登録。

## 7. インストール促進

Android Chrome では `beforeinstallprompt` イベントを利用してインストールボタンを表示可能。

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
```

## 8. 制約事項

- Windows PC（Chrome/Edge）と Android（Chrome）を対象とする。Apple デバイスは現時点では考慮しない。
- Android Chrome は `beforeinstallprompt` イベントを利用してインストールを促進する。
- Cloudflare Access の認証 Cookie は Service Worker 経由でも維持されるが、キャッシュ戦略で認証情報が漏れないよう注意。

## 9. 今後の改善

- SVG アイコンを PNG（特に maskable）に変換
- Web Push 通知（オプション）
- オフライン編集と同期（要件変更時）
