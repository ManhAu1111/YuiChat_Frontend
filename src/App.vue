<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useFriendshipStore } from './stores/friendshipStore';
import { useNotificationStore } from './stores/notificationStore';
import { useThemeStore } from './stores/themeStore';
import { onMessageListener } from './services/firebase';
import NotificationToast from './components/chat/notifications/NotificationToast.vue';

const authStore = useAuthStore();
const friendshipStore = useFriendshipStore();
const notificationStore = useNotificationStore();
const themeStore = useThemeStore();


onMounted(async () => {
  // Only bootstrap when the user already has a saved token (page refresh).
  // For fresh logins the auth store's login() / loginWithGoogle() handles this.
  if (!localStorage.getItem('token')) return;

  // 1. Make sure we have the user object (needed for the Echo channel ID)
  if (!authStore.user) {
    await authStore.fetchUser();
  }

  // 2. Hydrate friendship and notification states from the server
  await friendshipStore.fetchStates();
  await notificationStore.fetchNotifications();
  await notificationStore.fetchUnreadCount();

  // 3. Start the real-time listener so we get live updates while online
  //    Only notificationStore subscribes; it dispatches friendship events internally.
  notificationStore.listenForRealTimeUpdates(authStore.user?.id);
  authStore.startHeartbeat();

  // 4. Lắng nghe thông báo FCM khi đang mở web
  onMessageListener((payload) => {
    console.log('[App.vue] Nhận được FCM Foreground:', payload);
    const title = payload.notification?.title || payload.data?.title || 'Thông báo mới';
    const body = payload.notification?.body || payload.data?.body || 'Bạn có một tin nhắn mới.';
    
    // Tạo đối tượng giả để đẩy vào Toast Notification UI có sẵn
    const notiObj = {
      id: payload.messageId || Date.now(),
      type: 'FCMMessageNoti',
      data: {
        title: title,
        message: body,
        conversation_id: payload.data?.conversation_id
      },
      read_at: null,
      created_at: new Date().toISOString(),
    };
    notificationStore.showToast(notiObj);
  });
});
</script>

<template>
  <RouterView />
  <!-- Global toast notifications – rendered on top of everything -->
  <NotificationToast />
</template>

<style>
/* Bạn có thể để trống thẻ style này, vì CSS mình đã dùng Tailwind hết rồi */
</style>
