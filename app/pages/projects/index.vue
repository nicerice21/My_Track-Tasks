<script setup lang="ts">
import type { Project, ProjectInput, ProjectStatus } from '~/types/models';
import { PROJECT_STATUS_LABELS, dateInputToMs, msToDateInput } from '~/utils/format';

const projectsStore = useProjectsStore();

const name = ref('');
const description = ref('');
const targetDate = ref('');

const editing = ref<Project | null>(null);
const editName = ref('');
const editDescription = ref('');
const editStatus = ref<ProjectStatus>('active');
const editTargetDate = ref('');

async function add() {
  if (!name.value.trim()) return;
  await projectsStore.create({
    name: name.value.trim(),
    description: description.value || null,
    targetCompletionDate: dateInputToMs(targetDate.value),
  });
  name.value = '';
  description.value = '';
  targetDate.value = '';
}

function startEdit(project: Project) {
  editing.value = project;
  editName.value = project.name;
  editDescription.value = project.description ?? '';
  editStatus.value = project.status;
  editTargetDate.value = msToDateInput(project.targetCompletionDate);
}

async function saveEdit() {
  if (!editing.value || !editName.value.trim()) return;
  await projectsStore.update(editing.value.id, {
    name: editName.value.trim(),
    description: editDescription.value || null,
    status: editStatus.value,
    targetCompletionDate: dateInputToMs(editTargetDate.value),
  });
  editing.value = null;
}

async function remove(project: Project) {
  await projectsStore.remove(project.id);
}

onMounted(() => projectsStore.fetch());
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-4 text-2xl font-bold">プロジェクト</h1>

    <form class="mb-6 flex flex-wrap items-end gap-2" @submit.prevent="add">
      <div class="form-control">
        <label class="label"><span class="label-text">プロジェクト名</span></label>
        <input v-model="name" type="text" class="input input-bordered input-sm" placeholder="例：歩行ロボットの制御系設計" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text">目標日</span></label>
        <input v-model="targetDate" type="date" class="input input-bordered input-sm" />
      </div>
      <button type="submit" class="btn btn-primary btn-sm">追加</button>
    </form>

    <div v-if="projectsStore.items.length === 0" class="py-8 text-center">
      <p class="text-base-content/50">プロジェクトがありません</p>
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="p in projectsStore.items"
        :key="p.id"
        class="flex items-center gap-3 rounded-box bg-base-100 px-4 py-3 shadow-sm"
      >
        <NuxtLink :to="`/projects/${p.id}`" class="flex-1 min-w-0">
          <p class="truncate font-medium">{{ p.name }}</p>
          <p v-if="p.description" class="truncate text-sm text-base-content/50">
            {{ p.description }}
          </p>
        </NuxtLink>
        <span class="badge badge-ghost badge-sm">
          {{ PROJECT_STATUS_LABELS[p.status] }}
        </span>
        <button class="btn btn-ghost btn-xs" @click="startEdit(p)">編集</button>
        <button class="btn btn-ghost btn-xs text-error" @click="remove(p)">削除</button>
      </li>
    </ul>

    <!-- 編集モーダル -->
    <dialog v-if="editing" class="modal modal-open">
      <div class="modal-box">
        <h3 class="mb-4 text-lg font-bold">プロジェクトを編集</h3>
        <div class="space-y-3">
          <div class="form-control">
            <label class="label"><span class="label-text">名前</span></label>
            <input v-model="editName" type="text" class="input input-bordered" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">説明</span></label>
            <textarea v-model="editDescription" class="textarea textarea-bordered" rows="2" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label"><span class="label-text">状態</span></label>
              <select v-model="editStatus" class="select select-bordered">
                <option value="active">進行中</option>
                <option value="paused">停止中</option>
                <option value="completed">完了</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">目標日</span></label>
              <input v-model="editTargetDate" type="date" class="input input-bordered" />
            </div>
          </div>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="editing = null">キャンセル</button>
          <button class="btn btn-primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </dialog>
  </div>
</template>
