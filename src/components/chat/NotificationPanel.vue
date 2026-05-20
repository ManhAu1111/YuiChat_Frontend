<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '../../stores/notificationStore';
import { useFriendshipStore } from '../../stores/friendshipStore';
import { useThemeStore } from '../../stores/themeStore';

const emit = defineEmits(['back']);
const notificationStore = useNotificationStore();
const friendshipStore = useFriendshipStore();
const themeStore = useThemeStore();

onMounted(() => {
  notificationStore.fetchNotifications();
});

onUnmounted(() => {
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
  <div class="flex flex-col h-full transition-colors duration-300"
       :style="themeStore.isDark ? 'background: #000000;' : 'background: #f5f5f7;'">
    <!-- Header -->
    <div class="h-14 flex items-center px-5 flex-shrink-0 justify-between transition-colors duration-300"
         :style="themeStore.isDark ? 'background: #1d1d1f; border-bottom: 1px solid rgba(255,255,255,0.08);' : 'background: #ffffff; border-bottom: 1px solid rgba(0,0,0,0.08);'">
      <div class="flex items-center">
        <button
          class="md:hidden p-1.5 mr-3 rounded-full transition-colors"
          :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.08);' : 'color: rgba(0,0,0,0.48); background: rgba(0,0,0,0.05);'"
          @click="emit('back')"
          aria-label="Quay lại"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 class="font-semibold transition-colors duration-300"
            style="font-size: 17px; letter-spacing: -0.374px;"
            :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
          Thông báo
        </h2>
      </div>
      <button 
        v-if="notificationStore.unreadCount > 0"
        @click="notificationStore.markAllAsRead()"
        class="text-sm transition-colors duration-300"
        :style="themeStore.isDark ? 'color: #2997ff;' : 'color: #0071e3;'"
      >
        Đánh dấu đã đọc
      </button>
    </div>

    <!-- Notifications list -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3 relative">
      <!-- Loading skeleton -->
      <div v-if="notificationStore.isLoading" class="space-y-3 animate-pulse">
        <div v-for="i in 4" :key="i"
             class="flex items-start gap-3 p-4 rounded-[12px] relative"
             :style="themeStore.isDark ? 'background: #272729;' : 'background: #ffffff;'">
          <!-- Avatar skeleton -->
          <div class="w-10 h-10 rounded-full flex-shrink-0"
               :class="themeStore.isDark ? 'bg-white/10' : 'bg-black/10'"></div>
          
          <!-- Text and buttons skeleton -->
          <div class="flex-1 space-y-3">
            <div class="space-y-1.5">
              <div class="h-3 rounded-full"
                   :class="[
                     themeStore.isDark ? 'bg-white/10' : 'bg-black/10',
                     i % 2 === 0 ? 'w-3/4' : 'w-5/6'
                   ]"></div>
              <div class="h-2.5 rounded-full w-1/2"
                   :class="themeStore.isDark ? 'bg-white/5' : 'bg-black/5'"></div>
            </div>
            
            <!-- Friend request action buttons skeleton (simulate on first item) -->
            <div v-if="i === 1" class="flex gap-2">
              <div class="h-8 w-20 rounded-md"
                   :class="themeStore.isDark ? 'bg-white/10' : 'bg-black/10'"></div>
              <div class="h-8 w-20 rounded-md"
                   :class="themeStore.isDark ? 'bg-white/5' : 'bg-black/5'"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="notificationStore.notifications.length === 0" class="flex flex-col items-center justify-center h-full text-center p-4">
        <svg class="w-16 h-16 mb-4 transition-colors duration-300" fill="none" :stroke="themeStore.isDark ? 'rgba(255,255,255,0.2)' : '#c7c7cc'" stroke-width="1.2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p class="text-sm transition-colors duration-300"
           :style="themeStore.isDark ? 'color: rgba(255,255,255,0.48);' : 'color: rgba(0,0,0,0.48);'">
          Bạn chưa có thông báo nào.
        </p>
      </div>
      <div
        v-else
        v-for="noti in notificationStore.notifications"
        :key="noti.id"
        class="flex items-start gap-3 p-4 rounded-[12px] transition-all relative cursor-pointer"
        :style="themeStore.isDark ? 'background: #272729; box-shadow: rgba(0,0,0,0.5) 0 2px 8px 0;' : 'background: #ffffff; box-shadow: rgba(0,0,0,0.06) 0 1px 4px 0;'"
        :class="!noti.read_at ? (themeStore.isDark ? 'ring-1 ring-apple-blue' : 'ring-1 ring-blue-500/20') : ''"
        @click="handleMarkAsRead(noti)"
      >
        <div v-if="!noti.read_at" class="absolute top-4 right-4 w-2 h-2 rounded-full"
             :style="themeStore.isDark ? 'background: #2997ff;' : 'background: #0071e3;'"></div>
        <img
          :src="noti.data?.avatar || 'https://ui-avatars.com/api/?name=' + (noti.data?.sender_name || 'U') + '&background=f0f0f0'"
          alt="avatar"
          class="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div class="flex-1 min-w-0 pr-4">
          <p class="text-sm leading-snug transition-colors duration-300"
             style="letter-spacing: -0.224px;"
             :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
            <span class="font-semibold">{{ noti.data?.sender_name || 'Ai đó' }}</span>
            <span :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'" v-if="noti.type.includes('FriendRequestNoti')">
               đã gửi cho bạn lời mời kết bạn
            </span>
            <span :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'" v-else-if="noti.type.includes('FriendAcceptedNoti')">
               đã chấp nhận lời mời kết bạn
            </span>
            <span :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'" v-else>
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
              :style="themeStore.isDark
                ? 'background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); font-size: 13px; padding: 6px 14px; letter-spacing: -0.224px;'
                : 'background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.6); font-size: 13px; padding: 6px 14px; letter-spacing: -0.224px;'"
              onmouseover="if(this.style.background.includes('255')) this.style.background='rgba(255,255,255,0.14)'; else this.style.background='rgba(0,0,0,0.1)'"
              onmouseout="if(this.style.background.includes('255')) this.style.background='rgba(255,255,255,0.08)'; else this.style.background='rgba(0,0,0,0.06)'"
            >
              Từ chối
            </button>
          </div>
          <div v-else-if="noti.type.includes('FriendRequestNoti')" class="mt-2 text-xs transition-colors duration-300"
               :style="themeStore.isDark ? 'color: rgba(255,255,255,0.4);' : 'color: rgba(0,0,0,0.4);'">
            Đã phản hồi
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
