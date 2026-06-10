<script setup>
import { onMounted } from 'vue';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useFriendshipStore } from '../../../stores/friendshipStore';
import NotificationItem from './NotificationItem.vue';

const emit = defineEmits(['back']);
const notificationStore = useNotificationStore();
const friendshipStore = useFriendshipStore();

onMounted(() => {
  notificationStore.fetchNotifications();
  notificationStore.fetchUnreadCount();
  friendshipStore.fetchStates();
});

const handleMarkAsRead = async (notification) => {
  if (!notification.read_at) {
    await notificationStore.markAsRead(notification.id);
  }
};
</script>

<template>
  <div class="flex flex-col h-full transition-colors duration-300"
       style="background: var(--bg-primary);">
    <!-- Header -->
    <div class="h-[68px] flex items-center px-5 flex-shrink-0 justify-between transition-colors duration-300 relative z-10"
         style="background: var(--glass-bg); border-bottom: 1px solid var(--glass-border); backdrop-filter: saturate(180%) blur(20px);">
      <div class="flex items-center">
        <button
          class="md:hidden p-1.5 mr-3 rounded-full transition-colors"
          style="color: var(--text-secondary);"
          onmouseover="this.style.background='var(--hover-bg)'"
          onmouseout="this.style.background='transparent'"
          @click="emit('back')"
          aria-label="Quay lại"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 class="font-semibold transition-colors duration-300"
            style="font-size: 17px; letter-spacing: -0.374px; color: var(--text-primary);">
          Thông báo
        </h2>
      </div>
      <button 
        v-if="notificationStore.unreadCount > 0"
        @click="notificationStore.markAllAsRead()"
        class="text-sm transition-colors duration-300 font-medium"
        style="color: var(--accent-color);"
      >
        Đánh dấu đã đọc
      </button>
    </div>

    <!-- Notifications list -->
    <div class="flex-1 overflow-y-auto p-4 pb-[120px] space-y-3 relative z-0">
      <!-- Loading skeleton -->
      <div v-if="notificationStore.isLoading" class="space-y-3 animate-pulse">
        <div v-for="i in 4" :key="i"
             class="flex items-start gap-3 p-4 rounded-[16px] relative"
             style="background: var(--bg-secondary);">
          <!-- Avatar skeleton -->
          <div class="w-10 h-10 rounded-full flex-shrink-0"
               style="background: var(--hover-bg);"></div>
          
          <!-- Text and buttons skeleton -->
          <div class="flex-1 space-y-3">
            <div class="space-y-1.5">
              <div class="h-3 rounded-full"
                   style="background: var(--hover-bg);"
                   :class="i % 2 === 0 ? 'w-3/4' : 'w-5/6'"></div>
              <div class="h-2.5 rounded-full w-1/2"
                   style="background: var(--glass-border);"></div>
            </div>
            
            <!-- Friend request action buttons skeleton -->
            <div v-if="i === 1" class="flex gap-2">
              <div class="h-8 w-20 rounded-[8px]" style="background: var(--hover-bg);"></div>
              <div class="h-8 w-20 rounded-[8px]" style="background: var(--glass-border);"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="notificationStore.notifications.length === 0" class="flex flex-col items-center justify-center h-full text-center p-4">
        <svg class="w-16 h-16 mb-4 transition-colors duration-300" fill="none" stroke="var(--text-tertiary)" stroke-width="1.2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p class="text-[15px] font-medium transition-colors duration-300"
           style="color: var(--text-secondary);">
          Bạn chưa có thông báo nào.
        </p>
      </div>

      <!-- Notification items (reusable component) -->
      <NotificationItem
        v-else
        v-for="noti in notificationStore.notifications"
        :key="noti.id"
        :noti="noti"
        @mark-read="handleMarkAsRead"
      />
    </div>
  </div>
</template>
