<script setup lang="ts">
import type { TaskInput } from '~/types/models';

const tasksStore = useTasksStore();
const subjectsStore = useSubjectsStore();
const projectsStore = useProjectsStore();

onMounted(() => {
  subjectsStore.fetch();
  projectsStore.fetch();
});

async function onSubmit(input: TaskInput) {
  await tasksStore.create(input);
  await navigateTo('/tasks');
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-4 text-2xl font-bold">新しいタスク</h1>
    <TaskForm
      :subjects="subjectsStore.items"
      :projects="projectsStore.items"
      @submit="onSubmit"
      @cancel="navigateTo('/tasks')"
    />
  </div>
</template>
