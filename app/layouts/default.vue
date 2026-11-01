<template>
  <div class="min-h-screen bg-base-200">
    <header class="navbar bg-base-100 shadow-sm sticky top-0 z-10">
      <div class="navbar-start">
        <NuxtLink to="/" class="btn btn-ghost text-xl font-bold">
          MyToDo
        </NuxtLink>
      </div>
      <div class="navbar-end">
        <nav class="flex gap-1 overflow-x-auto">
          <NuxtLink to="/" class="btn btn-ghost btn-sm">ダッシュボード</NuxtLink>
          <NuxtLink to="/tasks" class="btn btn-ghost btn-sm">タスク</NuxtLink>
          <NuxtLink to="/subjects" class="btn btn-ghost btn-sm">科目</NuxtLink>
          <NuxtLink to="/projects" class="btn btn-ghost btn-sm">プロジェクト</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="container mx-auto max-w-5xl p-4">
      <slot />
    </main>
  </div>
</template>
