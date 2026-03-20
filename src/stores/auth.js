import { defineStore } from 'pinia';
import api from '../api/axios'; // Nhập cái "xe tải" chúng ta vừa tạo

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async fetchUser() {
      try {
        const response = await api.get('/user');
        this.user = response.data;
      } catch (error) {
        this.logout();
      }
    },
    async login(credentials) {
      const response = await api.post('/login', credentials);
      this.token = response.data.access_token;
      this.user = response.data.user;
      localStorage.setItem('token', this.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    },
    async loginWithGoogle(googleToken) {
      const response = await api.post('/auth/google', { token: googleToken });
      this.token = response.data.access_token;
      this.user = response.data.user;
      localStorage.setItem('token', this.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    },
    async logout() {
      try {
        await api.post('/logout');
      } catch (error) {
        console.error("Logout error (likely already expired):", error);
      } finally {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login'; // Chuyển hướng cứng để reset state hoàn toàn
      }
    }
  }
});
