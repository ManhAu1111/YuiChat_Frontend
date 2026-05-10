import { defineStore } from 'pinia';
import api from '../services/api'; // Sử dụng instance "xịn" có interceptor
import { useFriendshipStore } from './friendshipStore';
import { useNotificationStore } from './notificationStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async fetchUser() {
      if (!this.token) return;
      try {
        const response = await api.get('/user');
        this.user = response.data;
      } catch (error) {
        console.error("Lỗi lấy thông tin user:", error);
        this.clearAuth();
      }
    },
    async login(credentials) {
      const response = await api.post('/login', credentials);
      this.token = response.data.access_token;
      this.user = response.data.user;
      localStorage.setItem('token', this.token);
      // Hydrate friendship and notification states immediately after login
      try {
        const fs = useFriendshipStore();
        const ns = useNotificationStore();
        await fs.fetchStates();
        await ns.fetchNotifications();
        await ns.fetchUnreadCount();
        fs.listenForRealTimeUpdates(this.user?.id);
        ns.listenForRealTimeUpdates(this.user?.id);
      } catch { /* non-critical */ }
    },
    async loginWithGoogle(googleToken) {
      const response = await api.post('/auth/google', { token: googleToken });
      this.token = response.data.access_token;
      this.user = response.data.user;
      localStorage.setItem('token', this.token);
      // Hydrate friendship and notification states immediately after Google login
      try {
        const fs = useFriendshipStore();
        const ns = useNotificationStore();
        await fs.fetchStates();
        await ns.fetchNotifications();
        await ns.fetchUnreadCount();
        fs.listenForRealTimeUpdates(this.user?.id);
        ns.listenForRealTimeUpdates(this.user?.id);
      } catch { /* non-critical */ }
    },
    async logout() {
      try {
        useFriendshipStore().stopListening(this.user?.id);
        useNotificationStore().stopListening(this.user?.id);
        await api.post('/logout');
      } catch (error) {
        console.error("Lỗi Logout (có thể hết hạn):", error);
      } finally {
        this.clearAuth();
      }
    },
    clearAuth() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      // Chuyển hướng về login để sạch state
      window.location.href = '/login';
    }
  }
});
