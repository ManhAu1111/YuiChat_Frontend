import { defineStore } from 'pinia';
import api from '../services/api';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    /** Queue of notifications currently showing as toast popups */
    toastQueue: [],
    /** Map of toast timeout IDs for cleanup */
    _toastTimers: {},
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

    /**
     * Show a notification as a toast popup.
     * Auto-dismisses after `duration` ms (default 4000).
     */
    showToast(noti, duration = 4000) {
      // Avoid duplicate toasts
      if (this.toastQueue.some(t => t.id === noti.id)) return;

      this.toastQueue.push(noti);

      const timerId = setTimeout(() => {
        this.dismissToast(noti.id);
      }, duration);

      this._toastTimers[noti.id] = timerId;
    },

    /**
     * Dismiss a toast notification by ID.
     */
    dismissToast(id) {
      const idx = this.toastQueue.findIndex(t => t.id === id);
      if (idx !== -1) {
        this.toastQueue.splice(idx, 1);
      }
      if (this._toastTimers[id]) {
        clearTimeout(this._toastTimers[id]);
        delete this._toastTimers[id];
      }
    },

    /**
     * ═══════════════════════════════════════════════════════════════
     * CENTRALIZED real-time listener.
     *
     * This is the ONLY place that subscribes to the user's private
     * notification channel.  Both notification-UI updates AND
     * friendship-state updates are dispatched from here.
     * ═══════════════════════════════════════════════════════════════
     */
    listenForRealTimeUpdates(userId) {
      if (!window.Echo || !userId) return;

      // Echo now uses the 'api' axios instance (configured in api.js)
      // which automatically injects the latest Bearer token into the 
      // authEndpoint requests via its request interceptor. No manual 
      // token injection is needed here!

      console.log('[NotificationStore] Subscribing to private channel App.Models.User.' + userId);

      window.Echo.private(`App.Models.User.${userId}`)
      // Define a reusable handler for notifications
      const handleNotification = (notification) => {
          console.log('[NotificationStore] 🔔 Real-time notification received:', notification);
          const notiObj = {
            id: notification.id || Date.now(),
            type: notification.type || 'Unknown',
            data: notification.data || notification, // fallback if data is unwrapped
            read_at: null,
            created_at: new Date().toISOString(),
          };

          this.notifications.unshift(notiObj);
          this.unreadCount++;
          this.showToast(notiObj);

          import('./friendshipStore').then(({ useFriendshipStore }) => {
            const fs = useFriendshipStore();
            fs.handleRealtimeNotification(notiObj);
          });

          if (notiObj.type?.includes('GroupAddedNoti')) {
            import('./chatStore.js').then(({ useChatStore }) => {
              const chatStore = useChatStore();
              if (notiObj.data.conversation_id || notiObj.conversation_id) {
                chatStore.fetchConversations();
              }
            });
          }
      };

      const channel = window.Echo.private(`App.Models.User.${userId}`);
      
      // Standard Echo notification listener
      channel.notification(handleNotification);

      // Explicit class name listeners (Fallback for Reverb direct broadcasting)
      // Leading dot (.) prevents Echo from prepending default 'App.Events.' namespace
      channel.listen('.App\\\\Modules\\\\Chat\\\\Notifications\\\\GroupAddedNoti', handleNotification)
             .listen('.App\\\\Modules\\\\User\\\\Notifications\\\\FriendRequestNoti', handleNotification)
             .listen('.App\\\\Modules\\\\User\\\\Notifications\\\\FriendAcceptedNoti', handleNotification)
             .listen('.App\\\\Modules\\\\User\\\\Notifications\\\\FriendDeclinedNoti', handleNotification);

      // AddedToGroup event listener for chat list updates
      channel.listen('AddedToGroup', (e) => {
          console.log('[NotificationStore] 👥 AddedToGroup event received:', e);
          import('./chatStore.js').then(({ useChatStore }) => {
            const chatStore = useChatStore();
            chatStore.fetchConversations();
          });
      });
    },

    removeNotification(id) {
      const index = this.notifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        const noti = this.notifications[index];
        if (!noti.read_at) {
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
        this.notifications.splice(index, 1);
      }
      // Also dismiss toast if showing
      this.dismissToast(id);
    },

    stopListening(userId) {
      if (window.Echo && userId) {
        window.Echo.leave(`App.Models.User.${userId}`);
      }
    }
  }
});
