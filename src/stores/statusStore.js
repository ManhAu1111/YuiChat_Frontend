import { defineStore } from 'pinia';
import api from '../services/api';

export const useStatusStore = defineStore('status', {
  state: () => ({
    statuses: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    // Current user's status might be needed separately
    // Or we can just get all friends
  },

  actions: {
    async fetchStatuses() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/statuses');
        this.statuses = response.data.data || [];
      } catch (err) {
        this.error = err?.response?.data?.message || 'Failed to fetch statuses.';
        console.error('[StatusStore] fetchStatuses error:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async updateStatus(iconCode, content = null) {
      try {
        await api.post('/statuses', { icon: iconCode, content });
        await this.fetchStatuses(); // Refresh the list
      } catch (err) {
        console.error('[StatusStore] updateStatus error:', err);
        throw err;
      }
    },
  },
});
