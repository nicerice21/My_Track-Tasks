import { defineStore } from 'pinia';
import type { Subject, SubjectInput } from '~/types/models';

export const useSubjectsStore = defineStore('subjects', {
  state: () => ({
    items: [] as Subject[],
    loading: false,
  }),
  actions: {
    async fetch() {
      this.loading = true;
      try {
        this.items = await useApi().get<Subject[]>('/subjects');
      } finally {
        this.loading = false;
      }
    },
    async create(input: SubjectInput) {
      const created = await useApi().post<Subject>('/subjects', input);
      this.items.unshift(created);
      return created;
    },
    async update(id: number, input: Partial<SubjectInput>) {
      const updated = await useApi().patch<Subject>(`/subjects/${id}`, input);
      const index = this.items.findIndex((s) => s.id === id);
      if (index !== -1) this.items[index] = updated;
      return updated;
    },
    async remove(id: number) {
      await useApi().del(`/subjects/${id}`);
      this.items = this.items.filter((s) => s.id !== id);
    },
  },
});
