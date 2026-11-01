<script setup lang="ts">
import type { ProjectDetail, Task } from '~/types/models';
import { PROJECT_STATUS_LABELS, formatDate } from '~/utils/format';

const route = useRoute();
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();

const detail = ref<ProjectDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    detail.value = await projectsStore.fetchDetail(Number(route.params.id));
  } catch {
    error.value = 'プロジェクトの取得に失敗しました';
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
  <div class="mx-auto max-w-3xl">
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-else-if="error" class="alert alert-error">{{ error }}</div>

    <div v-else-if="detail">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">{{ detail.project.name }}</h1>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <span class="badge badge-ghost">
            {{ PROJECT_STATUS_LABELS[detail.project.status] }}
          </span>
          <span v-if="detail.project.targetCompletionDate" class="text-sm text-base-content/60">
            目標: {{ formatDate(detail.project.targetCompletionDate) }}
          </span>
        </div>
        <p v-if="detail.project.description" class="mt-3 text-base-content/70">
          {{ detail.project.description }}
        </p>
      </div>

      <section class="mb-6">
        <h2 class="mb-2 text-sm font-semibold text-base-content/60">
          関連タスク（{{ detail.tasks.length }}）
        </h2>
        <div v-if="detail.tasks.length > 0" class="space-y-2">
          <TaskCard
            v-for="t in detail.tasks"
            :key="t.id"
            :task="t"
            @toggle="toggle"
          />
        </div>
        <p v-else class="text-sm text-base-content/50">関連タスクはありません</p>
      </section>

      <section>
        <h2 class="mb-2 text-sm font-semibold text-base-content/60">
          進捗ログ（{{ detail.progressLogs.length }}）
        </h2>
        <div v-if="detail.progressLogs.length > 0" class="space-y-2">
          <div
            v-for="log in detail.progressLogs"
            :key="log.id"
            class="rounded-box bg-base-100 px-4 py-3 shadow-sm"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs text-base-content/50">
                {{ formatDate(new Date(log.loggedAt).getTime()) }}
              </span>
              <span v-if="log.progressPercent" class="badge badge-sm">
                {{ log.progressPercent }}%
              </span>
            </div>
            <p class="mt-1 whitespace-pre-wrap">{{ log.content }}</p>
          </div>
        </div>
        <p v-else class="text-sm text-base-content/50">進捗ログはありません</p>
      </section>
    </div>
  </div>
</template>
