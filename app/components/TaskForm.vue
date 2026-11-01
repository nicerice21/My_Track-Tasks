<script setup lang="ts">
import type {
  Project,
  Subject,
  Task,
  TaskInput,
  TaskPriority,
  TaskType,
} from '~/types/models';
import { dateInputToMs, msToDateInput } from '~/utils/format';

const props = defineProps<{
  task?: Task | null;
  subjects: Subject[];
  projects: Project[];
}>();

const emit = defineEmits<{
  submit: [input: TaskInput];
  cancel: [];
}>();

const form = reactive({
  title: props.task?.title ?? '',
  type: (props.task?.type ?? 'homework') as TaskType,
  subjectId: props.task?.subjectId ?? null,
  projectId: props.task?.projectId ?? null,
  priority: (props.task?.priority ?? 'medium') as TaskPriority,
  dueDate: msToDateInput(props.task?.dueDate ?? null),
  estimatedMinutes: props.task?.estimatedMinutes ?? null,
  description: props.task?.description ?? '',
});

function onSubmit() {
  if (!form.title.trim()) return;
  emit('submit', {
    title: form.title.trim(),
    type: form.type,
    subjectId: form.subjectId,
    projectId: form.projectId,
    priority: form.priority,
    dueDate: dateInputToMs(form.dueDate),
    estimatedMinutes: form.estimatedMinutes,
    description: form.description || null,
  });
}
</script>

<template>
  <form class="card bg-base-100 shadow-sm" @submit.prevent="onSubmit">
    <div class="card-body gap-4">
      <h2 class="card-title">{{ task ? 'タスクを編集' : '新しいタスク' }}</h2>

      <div class="form-control">
        <label class="label">
          <span class="label-text">タイトル</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          class="input input-bordered"
          placeholder="例：制御工学 演習問題"
          required
        />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="form-control">
          <label class="label"><span class="label-text">種類</span></label>
          <select v-model="form.type" class="select select-bordered">
            <option value="homework">宿題</option>
            <option value="report">レポート</option>
            <option value="research_progress">研究進捗</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">優先度</span></label>
          <select v-model="form.priority" class="select select-bordered">
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
            <option value="urgent">緊急</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">科目</span></label>
          <select v-model="form.subjectId" class="select select-bordered">
            <option :value="null">なし</option>
            <option v-for="s in subjects" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">プロジェクト</span></label>
          <select v-model="form.projectId" class="select select-bordered">
            <option :value="null">なし</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">締切</span></label>
          <input v-model="form.dueDate" type="date" class="input input-bordered" />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">見積時間（分）</span></label>
          <input
            v-model.number="form.estimatedMinutes"
            type="number"
            min="0"
            class="input input-bordered"
            placeholder="例：120"
          />
        </div>
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text">メモ</span></label>
        <textarea
          v-model="form.description"
          class="textarea textarea-bordered"
          rows="3"
          placeholder="詳細・補足"
        />
      </div>

      <div class="card-actions justify-end">
        <button type="button" class="btn btn-ghost" @click="emit('cancel')">
          キャンセル
        </button>
        <button type="submit" class="btn btn-primary">
          {{ task ? '更新' : '作成' }}
        </button>
      </div>
    </div>
  </form>
</template>
