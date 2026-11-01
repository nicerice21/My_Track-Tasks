<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  title: 'MyToDo',
  meta: [
    { name: 'description', content: '個人用タスク管理ツール' },
    { name: 'theme-color', content: '#0F172A' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'manifest', href: '/manifest.json' },
    { rel: 'icon', type: 'image/svg+xml', href: '/icon-192x192.svg' },
  ],
});
</script>
