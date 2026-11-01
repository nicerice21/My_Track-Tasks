import { defineStore } from 'pinia';
import type { Task, TaskInput, TaskListResponse } from '~/types/models';

export interface TaskFilters {
  status?: string;
  type?: string;
  subjectId?: number;
  projectId?: number;
  priority?: string;
  dueBefore?: number;
  dueAfter?: number;
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    items: [] as Task[],
    total: 0,
    loading: false,
  }),
  actions: {
    async fetch(filters: TaskFilters = {}) {
      this.loading = true;
      try {
        const query = new URLSearchParams();
        if (filters.status) query.set('status', filters.status);
        if (filters.type) query.set('type', filters.type);
        if (filters.subjectId !== undefined) {
          query.set('subject_id', String(filters.subjectId));
        }
        if (filters.projectId !== undefined) {
          query.set('project_id', String(filters.projectId));
        }
        if (filters.priority) query.set('priority', filters.priority);

        const qs = query.toString();
        const res = await useApi().get<TaskListResponse>(
          `/tasks${qs ? `?${qs}` : ''}`,
        );
        this.items = res.items;
        this.total = res.total;
      } finally {
        this.loading = false;
      }
    },
    async create(input: TaskInput) {
      return useApi().post<Task>('/tasks', input);
    },
    async update(id: number, input: Partial<TaskInput>) {
      return useApi().patch<Task>(`/tasks/${id}`, input);
    },
    async remove(id: number) {
      await useApi().del(`/tasks/${id}`);
      this.items = this.items.filter((t) => t.id !== id);
    },
    async complete(id: number) {
      const res = await useApi().post<{ status: string; recurring: boolean }>(
        `/tasks/${id}/complete`,
      );
      const task = this.items.find((t) => t.id === id);
      if (task) {
        if (res.recurring) {
          task.completedThisWeek = true;
        } else {
          task.status = 'completed';
        }
      }
    },
    async uncomplete(id: number) {
      await useApi().post(`/tasks/${id}/uncomplete`);
      const task = this.items.find((t) => t.id === id);
      if (task) {
        task.completedThisWeek = false;
        task.status = 'not_started';
      }
    },
  },
});
