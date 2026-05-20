import { defineStore } from 'pinia';
import api from '../services/api'; // Sử dụng instance "xịn" có interceptor
import { useFriendshipStore } from './friendshipStore';
import { useNotificationStore } from './notificationStore';
import { useChatStore } from './chatStore';

function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID ? crypto.randomUUID() : 'dev-' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

let heartbeatInterval = null;

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
      try {
        const fs = useFriendshipStore();
        const ns = useNotificationStore();
        await fs.fetchStates();
        await ns.fetchNotifications();
        await ns.fetchUnreadCount();
        fs.listenForRealTimeUpdates(this.user?.id);
        ns.listenForRealTimeUpdates(this.user?.id);
        this.startHeartbeat();
      } catch { /* non-critical */ }
    },
    async loginWithGoogle(googleToken) {
      const response = await api.post('/auth/google', { token: googleToken });
      this.token = response.data.access_token;
      this.user = response.data.user;
      localStorage.setItem('token', this.token);
      try {
        const fs = useFriendshipStore();
        const ns = useNotificationStore();
        await fs.fetchStates();
        await ns.fetchNotifications();
        await ns.fetchUnreadCount();
        fs.listenForRealTimeUpdates(this.user?.id);
        ns.listenForRealTimeUpdates(this.user?.id);
        this.startHeartbeat();
      } catch { /* non-critical */ }
    },
    async logout() {
      try {
        useFriendshipStore().stopListening(this.user?.id);
        useNotificationStore().stopListening(this.user?.id);
        this.stopHeartbeat();
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
      this.stopHeartbeat();
      localStorage.removeItem('token');
      window.location.href = '/login';
    },
    startHeartbeat() {
      const deviceId = getOrCreateDeviceId();
      const sendHeartbeat = () => {
        if (this.token) {
          api.post('/heartbeat', { device_id: deviceId }).catch(e => console.error("Heartbeat error", e));
        }
      };
      
      sendHeartbeat();
      
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(sendHeartbeat, 30000);
      this.startListeningToUserStatus();
    },
    stopHeartbeat() {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      this.stopListeningToUserStatus();
    },
    startListeningToUserStatus() {
      if (window.Echo) {
        window.Echo.channel('user-status')
          .listen('.UserOnlineStatusChanged', (e) => {
            const { userId, isOnline, lastActiveAt } = e;
            const chatStore = useChatStore();
            chatStore.conversations.forEach(conv => {
              if (!conv.is_group && conv.participants) {
                const partner = conv.participants.find(p => p.user_id == userId);
                if (partner && partner.user) {
                  partner.user.is_online = isOnline;
                  if (lastActiveAt) partner.user.last_active_at = lastActiveAt;
                }
              }
            });

            const fs = useFriendshipStore();
            const friend = fs.friends.find(f => f.id === userId);
            if (friend) {
              friend.is_online = isOnline;
            }
          });
      }
    },
    stopListeningToUserStatus() {
      if (window.Echo) {
        window.Echo.leave('user-status');
      }
    }
  }
});
