<script setup lang="ts">
import type { Task } from '~/types/models';
import { TASK_TYPE_LABELS, formatDueDate } from '~/utils/format';
import { isTaskDone } from '~/utils/task';

const props = defineProps<{
  task: Task;
  subjectColor?: string | null;
}>();

const emit = defineEmits<{
  toggle: [task: Task];
}>();

const isDone = computed(() => isTaskDone(props.task));
const isRecurring = computed(() => props.task.recurrenceRule !== null);
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-box bg-base-100 px-4 py-3 shadow-sm"
  >
    <input
      type="checkbox"
      class="checkbox checkbox-sm"
      :aria-label="isDone ? task.title + 'を未完了に戻す' : task.title + 'を完了にする'"
      :checked="isDone"
      @change="emit('toggle', task)"
    />

    <NuxtLink :to="`/tasks/${task.id}`" class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span
          v-if="subjectColor"
          class="inline-block h-3 w-3 rounded-full"
          :style="{ backgroundColor: subjectColor }"
        />
        <span
          class="truncate font-medium"
          :class="{ 'line-through opacity-60': isDone }"
        >
          {{ task.title }}
        </span>
      </div>
      <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-base-content/60">
        <span class="badge badge-ghost badge-sm">
          {{ TASK_TYPE_LABELS[task.type] }}
        </span>
        <span v-if="isRecurring" class="badge badge-outline badge-sm">毎週</span>
        <PriorityBadge :priority="task.priority" />
        <span>{{ formatDueDate(task.dueDate) }}</span>
      </div>
    </NuxtLink>
  </div>
</template>
