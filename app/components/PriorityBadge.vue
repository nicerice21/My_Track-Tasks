<script setup lang="ts">
import type { TaskPriority } from '~/types/models';
import { PRIORITY_BADGE_CLASS, TASK_PRIORITY_LABELS } from '~/utils/format';

const props = defineProps<{ priority: TaskPriority }>();
</script>

<template>
  <span class="badge badge-sm" :class="PRIORITY_BADGE_CLASS[props.priority]">
    {{ TASK_PRIORITY_LABELS[props.priority] }}
  </span>
</template>
