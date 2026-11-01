<script setup lang="ts">
import type { Subject, SubjectInput } from '~/types/models';

const subjectsStore = useSubjectsStore();

const name = ref('');
const code = ref('');
const color = ref('#3B82F6');

const editing = ref<Subject | null>(null);
const editName = ref('');
const editCode = ref('');
const editColor = ref('#3B82F6');

async function add() {
  if (!name.value.trim()) return;
  await subjectsStore.create({
    name: name.value.trim(),
    code: code.value || null,
    color: color.value,
  });
  name.value = '';
  code.value = '';
}

function startEdit(subject: Subject) {
  editing.value = subject;
  editName.value = subject.name;
  editCode.value = subject.code ?? '';
  editColor.value = subject.color ?? '#3B82F6';
}

async function saveEdit() {
  if (!editing.value || !editName.value.trim()) return;
  await subjectsStore.update(editing.value.id, {
    name: editName.value.trim(),
    code: editCode.value || null,
    color: editColor.value,
  });
  editing.value = null;
}

async function remove(subject: Subject) {
  await subjectsStore.remove(subject.id);
}

onMounted(() => subjectsStore.fetch());
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-4 text-2xl font-bold">科目</h1>

    <form class="mb-6 flex flex-wrap items-end gap-2" @submit.prevent="add">
      <div class="form-control">
        <label class="label"><span class="label-text">科目名</span></label>
        <input v-model="name" type="text" class="input input-bordered input-sm" placeholder="例：制御工学" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text">科目コード</span></label>
        <input v-model="code" type="text" class="input input-bordered input-sm" placeholder="例：MEC-301" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text">色</span></label>
        <input v-model="color" type="color" class="h-8 w-12 cursor-pointer rounded border" />
      </div>
      <button type="submit" class="btn btn-primary btn-sm">追加</button>
    </form>

    <div v-if="subjectsStore.items.length === 0" class="py-8 text-center">
      <p class="text-base-content/50">科目がありません</p>
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="s in subjectsStore.items"
        :key="s.id"
        class="flex items-center gap-3 rounded-box bg-base-100 px-4 py-3 shadow-sm"
      >
        <span
          class="inline-block h-4 w-4 rounded-full"
          :style="{ backgroundColor: s.color ?? '#ccc' }"
        />
        <span class="flex-1 font-medium">{{ s.name }}</span>
        <span v-if="s.code" class="text-sm text-base-content/50">{{ s.code }}</span>
        <button class="btn btn-ghost btn-xs" @click="startEdit(s)">編集</button>
        <button class="btn btn-ghost btn-xs text-error" @click="remove(s)">削除</button>
      </li>
    </ul>

    <!-- 編集モーダル -->
    <dialog v-if="editing" class="modal modal-open">
      <div class="modal-box">
        <h3 class="mb-4 text-lg font-bold">科目を編集</h3>
        <div class="space-y-3">
          <div class="form-control">
            <label class="label"><span class="label-text">科目名</span></label>
            <input v-model="editName" type="text" class="input input-bordered" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">科目コード</span></label>
            <input v-model="editCode" type="text" class="input input-bordered" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">色</span></label>
            <input v-model="editColor" type="color" class="h-10 w-16 cursor-pointer rounded border" />
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
