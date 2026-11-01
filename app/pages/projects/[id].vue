<script setup lang="ts">
import type { ProjectDetail, Task } from '~/types/models';
import { PROJECT_STATUS_LABELS, formatDate } from '~/utils/format';
import { isTaskDone } from '~/utils/task';

const route = useRoute();
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();

const detail = ref<ProjectDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const logContent = ref('');
const logPercent = ref<number | null>(null);

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
  if (isTaskDone(task)) {
    await tasksStore.uncomplete(task.id);
  } else {
    await tasksStore.complete(task.id);
  }
  await load();
}

async function addLog() {
  if (!logContent.value.trim() || !detail.value) return;
  await projectsStore.addProgressLog(detail.value.project.id, {
    content: logContent.value.trim(),
    progressPercent: logPercent.value ?? undefined,
  });
  logContent.value = '';
  logPercent.value = null;
  await load();
}

async function removeLog(id: number) {
  await projectsStore.removeProgressLog(id);
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

        <form
          class="mb-4 flex flex-wrap items-end gap-2 rounded-box bg-base-100 p-3 shadow-sm"
          @submit.prevent="addLog"
        >
          <div class="form-control flex-1 min-w-[12rem]">
            <label class="label"><span class="label-text">進捗メモ</span></label>
            <input
              v-model="logContent"
              type="text"
              class="input input-bordered input-sm"
              placeholder="例：モータ特性の測定が完了"
            />
          </div>
          <div class="form-control w-24">
            <label class="label"><span class="label-text">進捗(%)</span></label>
            <input
              v-model.number="logPercent"
              type="number"
              min="0"
              max="100"
              class="input input-bordered input-sm"
              placeholder="0-100"
            />
          </div>
          <button type="submit" class="btn btn-primary btn-sm">追加</button>
        </form>

        <div v-if="detail.progressLogs.length > 0" class="space-y-2">
          <div
            v-for="log in detail.progressLogs"
            :key="log.id"
            class="rounded-box bg-base-100 px-4 py-3 shadow-sm"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-base-content/50">
                {{ formatDate(new Date(log.loggedAt).getTime()) }}
              </span>
              <div class="flex items-center gap-2">
                <span v-if="log.progressPercent > 0" class="badge badge-sm">
                  {{ log.progressPercent }}%
                </span>
                <button
                  class="btn btn-ghost btn-xs text-error"
                  @click="removeLog(log.id)"
                >
                  削除
                </button>
              </div>
            </div>
            <p class="mt-1 whitespace-pre-wrap">{{ log.content }}</p>
          </div>
        </div>
        <p v-else class="text-sm text-base-content/50">進捗ログはありません</p>
      </section>
    </div>
  </div>
</template>
