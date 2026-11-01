import { defineStore } from 'pinia';
import type { Project, ProjectDetail, ProjectInput } from '~/types/models';

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    items: [] as Project[],
    loading: false,
  }),
  actions: {
    async fetch() {
      this.loading = true;
      try {
        this.items = await useApi().get<Project[]>('/projects');
      } finally {
        this.loading = false;
      }
    },
    async fetchDetail(id: number) {
      return useApi().get<ProjectDetail>(`/projects/${id}`);
    },
    async create(input: ProjectInput) {
      const created = await useApi().post<Project>('/projects', input);
      this.items.unshift(created);
      return created;
    },
    async update(id: number, input: Partial<ProjectInput>) {
      const updated = await useApi().patch<Project>(`/projects/${id}`, input);
      const index = this.items.findIndex((p) => p.id === id);
      if (index !== -1) this.items[index] = updated;
      return updated;
    },
    async remove(id: number) {
      await useApi().del(`/projects/${id}`);
      this.items = this.items.filter((p) => p.id !== id);
    },
  },
});
