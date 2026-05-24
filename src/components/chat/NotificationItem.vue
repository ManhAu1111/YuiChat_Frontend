<script setup>
import { useFriendshipStore } from '../../stores/friendshipStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useThemeStore } from '../../stores/themeStore';

const props = defineProps({
  noti: { type: Object, required: true },
  /** Compact mode hides the unread dot and tweaks padding for toast usage */
  compact: { type: Boolean, default: false },
});

const emit = defineEmits(['accept', 'decline', 'mark-read']);

const friendshipStore = useFriendshipStore();
const notificationStore = useNotificationStore();
const themeStore = useThemeStore();

const getAvatar = (noti) => {
  if (noti.type?.includes('GroupAddedNoti')) {
    return noti.data?.adder_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(noti.data?.adder_name || 'U') + '&background=f0f0f0';
  }
  return noti.data?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(noti.data?.sender_name || 'U') + '&background=f0f0f0';
};

const handleAccept = async () => {
  const senderId = props.noti.data?.sender_id;
  if (!senderId) return;
  try {
    await friendshipStore.acceptRequest(senderId);
    notificationStore.removeNotification(props.noti.id);
    emit('accept', props.noti);
  } catch (error) {
    console.error('Accept error:', error);
  }
};

const handleDecline = async () => {
  const senderId = props.noti.data?.sender_id;
  if (!senderId) return;
  try {
    await friendshipStore.declineRequest(senderId);
    notificationStore.removeNotification(props.noti.id);
    emit('decline', props.noti);
  } catch (error) {
    console.error('Decline error:', error);
  }
};

const handleClick = () => {
  if (!props.noti.read_at) {
    emit('mark-read', props.noti);
  }
};
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-[12px] transition-all relative cursor-pointer"
    :class="[
      compact ? 'p-3' : 'p-4',
      !noti.read_at && !compact ? (themeStore.isDark ? 'ring-1 ring-apple-blue' : 'ring-1 ring-blue-500/20') : ''
    ]"
    :style="themeStore.isDark ? 'background: #272729; box-shadow: rgba(0,0,0,0.5) 0 2px 8px 0;' : 'background: #ffffff; box-shadow: rgba(0,0,0,0.06) 0 1px 4px 0;'"
    @click="handleClick"
  >
    <!-- Unread dot -->
    <div v-if="!noti.read_at && !compact" class="absolute top-4 right-4 w-2 h-2 rounded-full"
         :style="themeStore.isDark ? 'background: #2997ff;' : 'background: #0071e3;'"></div>

    <!-- Avatar -->
    <img
      :src="getAvatar(noti)"
      alt="avatar"
      class="rounded-full object-cover flex-shrink-0"
      :class="compact ? 'w-9 h-9' : 'w-10 h-10'"
    />

    <!-- Content -->
    <div class="flex-1 min-w-0" :class="compact ? '' : 'pr-4'">
      <p class="text-sm leading-snug transition-colors duration-300"
         style="letter-spacing: -0.224px;"
         :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
        <!-- GroupAddedNoti -->
        <template v-if="noti.type?.includes('GroupAddedNoti')">
          <span class="font-semibold">{{ noti.data?.adder_name || 'Ai đó' }}</span>
          <span :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'">
             đã thêm bạn vào nhóm <strong>{{ noti.data?.conversation_name }}</strong>
          </span>
        </template>
        <!-- FriendRequestNoti / FriendAcceptedNoti / FriendDeclinedNoti -->
        <template v-else>
          <span class="font-semibold">{{ noti.data?.sender_name || 'Ai đó' }}</span>
          <span :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'" v-if="noti.type?.includes('FriendRequestNoti')">
             đã gửi cho bạn lời mời kết bạn
          </span>
          <span :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'" v-else-if="noti.type?.includes('FriendAcceptedNoti')">
             đã chấp nhận lời mời kết bạn
          </span>
          <span :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'" v-else-if="noti.type?.includes('FriendDeclinedNoti')">
             đã từ chối lời mời kết bạn
          </span>
          <span :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'" v-else>
             đã gửi một thông báo
          </span>
        </template>
      </p>

      <!-- Friend request action buttons -->
      <div class="flex gap-2 mt-3" v-if="noti.type?.includes('FriendRequestNoti') && friendshipStore.getStatus(noti.data?.sender_id) === 'pending_received'">
        <button
          @click.stop="handleAccept"
          class="apple-btn text-sm px-4 py-1.5"
          style="font-size: 13px; padding: 6px 14px; border-radius: 6px;"
        >
          Đồng ý
        </button>
        <button
          @click.stop="handleDecline"
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
      <div v-else-if="noti.type?.includes('FriendRequestNoti')" class="mt-2 text-xs transition-colors duration-300"
           :style="themeStore.isDark ? 'color: rgba(255,255,255,0.4);' : 'color: rgba(0,0,0,0.4);'">
        Đã phản hồi
      </div>
    </div>
  </div>
</template>
