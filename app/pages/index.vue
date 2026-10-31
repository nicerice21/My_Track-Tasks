<template>
  <div class="min-h-screen bg-base-200">
    <header class="navbar bg-base-100 shadow-sm">
      <div class="flex-1">
        <span class="text-xl font-bold px-4">MyToDo</span>
      </div>
    </header>

    <main class="container mx-auto p-4 max-w-4xl">
      <h1 class="text-2xl font-bold mb-4">ダッシュボード</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">今日のタスク</h2>
            <p class="text-sm text-base-content/70">実装予定</p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">今週の宿題</h2>
            <p class="text-sm text-base-content/70">実装予定</p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">期限切れ</h2>
            <p class="text-sm text-base-content/70">実装予定</p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">進行中のプロジェクト</h2>
            <p class="text-sm text-base-content/70">実装予定</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
