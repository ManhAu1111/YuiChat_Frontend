import { defineStore } from 'pinia';
import api from '../api/axios'; // Nhập cái "xe tải" chúng ta vừa tạo

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async loginWithGoogle(googleToken) {
      const response = await api.post('/auth/google', { token: googleToken });
      this.token = response.data.access_token;
      this.user = response.data.user;
      localStorage.setItem('token', this.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }
});
