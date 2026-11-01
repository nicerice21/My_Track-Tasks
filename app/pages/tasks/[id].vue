<script setup lang="ts">
import type { Project, Subject, Task, TaskInput } from '~/types/models';

const route = useRoute();
const api = useApi();
const tasksStore = useTasksStore();
const subjectsStore = useSubjectsStore();
const projectsStore = useProjectsStore();

const task = ref<Task | null>(null);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    const res = await api.get<{ task: Task; subject: Subject | null; project: Project | null }>(
      `/tasks/${route.params.id}`,
    );
    task.value = res.task;
  } finally {
    loading.value = false;
  }
}

async function onSubmit(input: TaskInput) {
  await tasksStore.update(task.value!.id, input);
  await navigateTo('/tasks');
}

async function onRemove() {
  if (!task.value) return;
  await tasksStore.remove(task.value.id);
  await navigateTo('/tasks');
}

onMounted(() => {
  subjectsStore.fetch();
  projectsStore.fetch();
  load();
});
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-else-if="task">
      <h1 class="mb-4 text-2xl font-bold">タスクを編集</h1>
      <TaskForm
        :task="task"
        :subjects="subjectsStore.items"
        :projects="projectsStore.items"
        @submit="onSubmit"
        @cancel="navigateTo('/tasks')"
      />

      <button class="btn btn-error btn-outline btn-sm mt-4" @click="onRemove">
        このタスクを削除
      </button>
    </div>

    <div v-else class="alert alert-error">タスクが見つかりません</div>
  </div>
</template>
