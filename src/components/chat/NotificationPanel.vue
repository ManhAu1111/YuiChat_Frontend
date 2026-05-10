<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '../../stores/notificationStore';
import { useFriendshipStore } from '../../stores/friendshipStore';

const emit = defineEmits(['back']);
const notificationStore = useNotificationStore();
const friendshipStore = useFriendshipStore();

// Optional: you can mark all as read when opening this panel
onMounted(() => {
  // notificationStore.markAllAsRead(); // if we want to mark all read upon entering
});

onUnmounted(() => {
  // Or mark them read when leaving
});

const handleAccept = async (notification) => {
  const senderId = notification.data?.sender_id;
  if (!senderId) return;
  try {
    await friendshipStore.acceptRequest(senderId);
    await notificationStore.markAsRead(notification.id);
  } catch (error) {
    console.error('Accept error:', error);
  }
};

const handleDecline = async (notification) => {
  const senderId = notification.data?.sender_id;
  if (!senderId) return;
  try {
    await friendshipStore.declineRequest(senderId);
    await notificationStore.markAsRead(notification.id);
  } catch (error) {
    console.error('Decline error:', error);
  }
};

const handleMarkAsRead = async (notification) => {
  if (!notification.read_at) {
    await notificationStore.markAsRead(notification.id);
  }
};
</script>

<template>
  <div class="flex flex-col h-full" style="background: #f5f5f7;">
    <!-- Header -->
    <div class="h-14 flex items-center px-5 flex-shrink-0 bg-white justify-between"
         style="border-bottom: 1px solid rgba(0,0,0,0.08);">
      <div class="flex items-center">
        <button
          class="md:hidden p-1.5 mr-3 rounded-full hover:bg-black/5 transition-colors"
          style="color: rgba(0,0,0,0.48);"
          @click="emit('back')"
          aria-label="Quay lại"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 class="font-semibold text-apple-text-dark"
            style="font-size: 17px; letter-spacing: -0.374px;">
          Thông báo
        </h2>
      </div>
      <button 
        v-if="notificationStore.unreadCount > 0"
        @click="notificationStore.markAllAsRead()"
        class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        Đánh dấu đã đọc
      </button>
    </div>

    <!-- Notifications list -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3 relative">
      <div v-if="notificationStore.isLoading" class="flex justify-center p-4">
        <span class="text-sm" style="color: rgba(0,0,0,0.48);">Đang tải thông báo...</span>
      </div>
      <div v-else-if="notificationStore.notifications.length === 0" class="flex flex-col items-center justify-center h-full text-center p-4">
        <svg class="w-16 h-16 mb-4" fill="none" stroke="#c7c7cc" stroke-width="1.2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p class="text-sm" style="color: rgba(0,0,0,0.48);">Bạn chưa có thông báo nào.</p>
      </div>
      <div
        v-else
        v-for="noti in notificationStore.notifications"
        :key="noti.id"
        class="flex items-start gap-3 p-4 rounded-[12px] bg-white transition-shadow relative"
        :class="!noti.read_at ? 'ring-1 ring-blue-500/20 shadow-sm' : ''"
        style="box-shadow: rgba(0,0,0,0.06) 0 1px 4px 0;"
        @click="handleMarkAsRead(noti)"
      >
        <div v-if="!noti.read_at" class="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500"></div>
        <img
          :src="noti.data?.avatar || 'https://ui-avatars.com/api/?name=' + (noti.data?.sender_name || 'U') + '&background=f0f0f0'"
          alt="avatar"
          class="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div class="flex-1 min-w-0 pr-4">
          <p class="text-sm text-apple-text-dark leading-snug" style="letter-spacing: -0.224px;">
            <span class="font-semibold">{{ noti.data?.sender_name || 'Ai đó' }}</span>
            <span style="color: rgba(0,0,0,0.6);" v-if="noti.type.includes('FriendRequestNoti')">
               đã gửi cho bạn lời mời kết bạn
            </span>
            <span style="color: rgba(0,0,0,0.6);" v-else-if="noti.type.includes('FriendAcceptedNoti')">
               đã chấp nhận lời mời kết bạn
            </span>
            <span style="color: rgba(0,0,0,0.6);" v-else>
               đã gửi một thông báo
            </span>
          </p>
          <div class="flex gap-2 mt-3" v-if="noti.type.includes('FriendRequestNoti') && friendshipStore.getStatus(noti.data?.sender_id) === 'pending_received'">
            <button
              @click.stop="handleAccept(noti)"
              class="apple-btn text-sm px-4 py-1.5"
              style="font-size: 13px; padding: 6px 14px; border-radius: 6px;"
            >
              Đồng ý
            </button>
            <button
              @click.stop="handleDecline(noti)"
              class="text-sm px-4 py-1.5 rounded-[6px] transition-colors font-medium"
              style="
                background: rgba(0,0,0,0.06);
                color: rgba(0,0,0,0.6);
                font-size: 13px; padding: 6px 14px;
                letter-spacing: -0.224px;
              "
              onmouseover="this.style.background='rgba(0,0,0,0.1)'"
              onmouseout="this.style.background='rgba(0,0,0,0.06)'"
            >
              Từ chối
            </button>
          </div>
          <div v-else-if="noti.type.includes('FriendRequestNoti')" class="mt-2 text-xs text-gray-500">
            Đã phản hồi
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
