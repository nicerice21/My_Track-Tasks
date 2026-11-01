<script setup lang="ts">
import type { DashboardData, Task } from '~/types/models';
import { formatDueDate } from '~/utils/format';

const api = useApi();
const tasksStore = useTasksStore();

const data = ref<DashboardData | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    data.value = await api.get<DashboardData>('/dashboard');
  } catch {
    error.value = 'データの取得に失敗しました';
  } finally {
    loading.value = false;
  }
}

async function toggle(task: Task) {
  if (task.status === 'completed') {
    await tasksStore.uncomplete(task.id);
  } else {
    await tasksStore.complete(task.id);
  }
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <h1 class="mb-4 text-2xl font-bold">ダッシュボード</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-else-if="error" class="alert alert-error">{{ error }}</div>

    <div v-else-if="data" class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section>
        <h2 class="mb-2 text-sm font-semibold text-base-content/60">
          今日のタスク（{{ data.todayTasks.length }}）
        </h2>
        <div class="space-y-2">
          <TaskCard
            v-for="t in data.todayTasks"
            :key="t.id"
            :task="t"
            @toggle="toggle"
          />
          <p v-if="data.todayTasks.length === 0" class="text-sm text-base-content/50">
            今日締切のタスクはありません
          </p>
        </div>
      </section>

      <section>
        <h2 class="mb-2 text-sm font-semibold text-base-content/60">
          期限切れ（{{ data.overdueTasks.length }}）
        </h2>
        <div class="space-y-2">
          <TaskCard
            v-for="t in data.overdueTasks"
            :key="t.id"
            :task="t"
            @toggle="toggle"
          />
          <p v-if="data.overdueTasks.length === 0" class="text-sm text-base-content/50">
            期限切れのタスクはありません
          </p>
        </div>
      </section>

      <section>
        <h2 class="mb-2 text-sm font-semibold text-base-content/60">
          今週の宿題（{{ data.weeklyHomework.length }}）
        </h2>
        <div class="space-y-2">
          <TaskCard
            v-for="t in data.weeklyHomework"
            :key="t.id"
            :task="t"
            @toggle="toggle"
          />
          <p v-if="data.weeklyHomework.length === 0" class="text-sm text-base-content/50">
            今週の宿題はありません
          </p>
        </div>
      </section>

      <section>
        <h2 class="mb-2 text-sm font-semibold text-base-content/60">
          今後のレポート（{{ data.upcomingReports.length }}）
        </h2>
        <div class="space-y-2">
          <div
            v-for="t in data.upcomingReports"
            :key="t.id"
            class="rounded-box bg-base-100 px-4 py-3 shadow-sm"
          >
            <p class="font-medium">{{ t.title }}</p>
            <p class="text-xs text-base-content/60">
              {{ formatDueDate(t.dueDate) }}
            </p>
          </div>
          <p v-if="data.upcomingReports.length === 0" class="text-sm text-base-content/50">
            今後のレポートはありません
          </p>
        </div>
      </section>

      <section class="md:col-span-2">
        <h2 class="mb-2 text-sm font-semibold text-base-content/60">
          進行中のプロジェクト（{{ data.activeProjects.length }}）
        </h2>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="p in data.activeProjects"
            :key="p.id"
            :to="`/projects/${p.id}`"
            class="card bg-base-100 shadow-sm hover:shadow"
          >
            <div class="card-body">
              <h3 class="card-title text-base">{{ p.name }}</h3>
              <p v-if="p.description" class="text-sm text-base-content/60">
                {{ p.description }}
              </p>
            </div>
          </NuxtLink>
          <p
            v-if="data.activeProjects.length === 0"
            class="text-sm text-base-content/50"
          >
            進行中のプロジェクトはありません
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
