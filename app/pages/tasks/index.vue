<script setup lang="ts">
import type { Subject, Task } from '~/types/models';
import type { TaskFilters } from '~/stores/tasks';
import { isTaskDone } from '~/utils/task';

const tasksStore = useTasksStore();
const subjectsStore = useSubjectsStore();

const statusFilter = ref('all');
const typeFilter = ref('all');

const subjectMap = computed(() => {
  const map = new Map<number, Subject>();
  for (const s of subjectsStore.items) {
    map.set(s.id, s);
  }
  return map;
});

function subjectColor(task: Task): string | null {
  const s = task.subjectId ? subjectMap.value.get(task.subjectId) : undefined;
  return s?.color ?? null;
}

async function load() {
  const filters: TaskFilters = {};
  if (statusFilter.value !== 'all') filters.status = statusFilter.value;
  if (typeFilter.value !== 'all') filters.type = typeFilter.value;
  await tasksStore.fetch(filters);
}

async function toggle(task: Task) {
  if (isTaskDone(task)) {
    await tasksStore.uncomplete(task.id);
  } else {
    await tasksStore.complete(task.id);
  }
  await load();
}

onMounted(() => {
  subjectsStore.fetch();
  load();
});

watch([statusFilter, typeFilter], load);
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">タスク</h1>
      <NuxtLink to="/tasks/new" class="btn btn-primary btn-sm">
        新規タスク
      </NuxtLink>
    </div>

    <div class="mb-4 flex flex-wrap gap-2">
      <select v-model="statusFilter" class="select select-bordered select-sm">
        <option value="all">すべての状態</option>
        <option value="not_started">未着手</option>
        <option value="in_progress">進行中</option>
        <option value="completed">完了</option>
      </select>

      <select v-model="typeFilter" class="select select-bordered select-sm">
        <option value="all">すべての種類</option>
        <option value="homework">宿題</option>
        <option value="report">レポート</option>
        <option value="research_progress">研究進捗</option>
      </select>
    </div>

    <div v-if="tasksStore.loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-else-if="tasksStore.items.length === 0" class="py-12 text-center">
      <p class="text-base-content/50">タスクがありません</p>
    </div>

    <div v-else class="space-y-2">
      <TaskCard
        v-for="t in tasksStore.items"
        :key="t.id"
        :task="t"
        :subject-color="subjectColor(t)"
        @toggle="toggle"
      />
    </div>
  </div>
</template>
