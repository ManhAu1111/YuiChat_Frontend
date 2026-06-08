import { defineStore } from 'pinia';
import api from '../services/api';
import { useRouter } from 'vue-router';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    viewingUserId: null,
    viewedUser: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async viewProfile(userId) {
      this.viewingUserId = userId;
      this.isLoading = true;
      this.error = null;
      this.viewedUser = null; // Clear previous

      try {
        const response = await api.get(`/users/${userId}`);
        this.viewedUser = response.data;
      } catch (err) {
        this.error = err?.response?.data?.message || 'Không thể tải thông tin người dùng.';
        console.error('[ProfileStore] viewProfile error:', err);
      } finally {
        this.isLoading = false;
      }
    },
    
    clearProfile() {
      this.viewingUserId = null;
      this.viewedUser = null;
    }
  },
});
