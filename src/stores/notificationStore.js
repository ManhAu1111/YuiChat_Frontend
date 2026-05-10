import { defineStore } from 'pinia';
import api from '../services/api';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchNotifications() {
      this.isLoading = true;
      try {
        const response = await api.get('/notifications');
        // Laravel paginate format: response.data.data.data
        this.notifications = response.data.data.data;
      } catch (err) {
        this.error = err?.response?.data?.message ?? 'Failed to fetch notifications.';
      } finally {
        this.isLoading = false;
      }
    },
    async fetchUnreadCount() {
      try {
        const response = await api.get('/notifications/unread-count');
        this.unreadCount = response.data.data.unread_count;
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    },
    async markAsRead(id) {
      try {
        await api.post(`/notifications/${id}/mark-read`);
        const notification = this.notifications.find((n) => n.id === id);
        if (notification && !notification.read_at) {
          notification.read_at = new Date().toISOString();
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    },
    async markAllAsRead() {
      try {
        await api.post('/notifications/mark-all-read');
        this.notifications.forEach((n) => { n.read_at = new Date().toISOString(); });
        this.unreadCount = 0;
      } catch (err) {
        console.error('Failed to mark all as read:', err);
      }
    },
    listenForRealTimeUpdates(userId) {
      if (!window.Echo || !userId) return;

      window.Echo.private(`App.Models.User.${userId}`)
        .notification((notification) => {
          // Add the notification to the list
          this.notifications.unshift({
            id: notification.id,
            type: notification.type,
            data: notification,
            read_at: null,
            created_at: new Date().toISOString(),
          });
          this.unreadCount++;
        });
    },
    stopListening(userId) {
      if (window.Echo && userId) {
        window.Echo.leave(`App.Models.User.${userId}`);
      }
    }
  }
});
