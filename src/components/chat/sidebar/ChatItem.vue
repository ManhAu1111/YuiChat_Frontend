<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { useChatStore } from '../../../stores/chatStore';
import { getFileUrl } from '../../../services/api';
import UserAvatar from '../ui/UserAvatar.vue';
import GroupAvatar from '../ui/GroupAvatar.vue';

const props = defineProps({
  chat: { type: Object, required: true },
  selected: { type: Boolean, default: false }
});

const emit = defineEmits(['select']);

const authStore = useAuthStore();
const chatStore = useChatStore();

const targetUser = computed(() => {
  if (!props.chat?.participants) return null;
  if (props.chat.is_group) return { name: props.chat.name, avatar: props.chat.avatar, is_online: false };
  if (!authStore.user?.id) return null;
  const participant = props.chat.participants.find(p => p.user_id !== authStore.user.id);
  return participant ? participant.user : null;
});

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}p`;
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const lastMessageText = computed(() => {
  const msg = props.chat.last_message;
  if (!msg) return 'Hãy bắt đầu cuộc hội thoại...';

  const isMine = msg.sender_id === authStore.user?.id;
  let senderName = '';

  if (isMine) {
    senderName = 'Bạn';
  } else {
    if (msg.sender?.name) {
      senderName = msg.sender.name;
    } else {
      const p = props.chat.participants?.find(p => p.user_id === msg.sender_id);
      senderName = p?.user?.name || 'Người dùng';
    }
    // Lấy tên cuối cùng (tên chính) cho ngắn gọn nếu tên quá dài
    const nameParts = senderName.split(' ');
    senderName = nameParts[nameParts.length - 1];
  }

  // Handle attachments
  const hasAttachments = msg.attachments && msg.attachments.length > 0;
  const isImage = msg.type === 'image' || (hasAttachments && msg.attachments[0].file_type?.startsWith('image/'));
  const isFile = msg.type === 'file' || (hasAttachments && !msg.attachments[0].file_type?.startsWith('image/'));

  if (isImage || isFile) {
    let count = 1;
    if (msg.metadata?.file_count) {
      count = msg.metadata.file_count;
    } else if (msg.attachments?.length) {
      count = msg.attachments.length;
    }
    
    const countText = count;
    const typeText = isImage ? 'ảnh' : 'tệp';
    
    return `${senderName} đã gửi ${countText} ${typeText}`;
  }

  // Text messages
  const content = msg.content || '';
  if (isMine) {
    return `Bạn: ${content}`;
  } else {
    if (props.chat.is_group) {
      return `${senderName}: ${content}`;
    } else {
      return content; // 1-on-1 other person
    }
  }
});

const typingUsers = computed(() => {
  return chatStore.typingUsers[props.chat.id] || [];
});

const isSomeoneTyping = computed(() => {
  return typingUsers.value.length > 0;
});

const typingStatusText = computed(() => {
  if (typingUsers.value.length === 1) {
    const nameParts = typingUsers.value[0].name.split(' ');
    return `${nameParts[nameParts.length - 1]} đang soạn tin...`;
  } else if (typingUsers.value.length > 1) {
    return `${typingUsers.value.length} người đang soạn tin...`;
  }
  return '';
});
</script>

<template>
  <button
    @click="emit('select', chat.id)"
    class="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 relative rounded-2xl"
    :class="{ 'selected': selected }"
    :data-selected="selected"
    :style="selected ? 'background: var(--accent-light);' : 'background: transparent;'"
    onmouseover="if(this.getAttribute('data-selected') !== 'true') this.style.background='var(--hover-bg)';"
    onmouseout="if(this.getAttribute('data-selected') !== 'true') this.style.background='transparent';"
  >
    <!-- Avatar with online dot -->
    <GroupAvatar v-if="chat.is_group" :chat="chat" sizeClass="w-12 h-12" />
    <UserAvatar v-else :user="targetUser" sizeClass="w-12 h-12" onlineDotClass="w-3 h-3 border-2" />

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between mb-0.5">
        <h3 class="text-[15px] font-semibold truncate transition-colors duration-300"
            style="letter-spacing: -0.3px; color: var(--text-primary);">
          {{ targetUser?.name || 'Đang tải...' }}
        </h3>
        <span class="text-[11px] flex-shrink-0 ml-2 transition-colors duration-300"
              style="letter-spacing: -0.1px;"
              :style="selected ? 'color: var(--accent-color);' : 'color: var(--text-secondary);'">
          {{ formatTime(chat.last_message?.created_at || chat.updated_at) }}
        </span>
      </div>
      <div class="flex items-center justify-between">
        <p v-if="isSomeoneTyping" 
           class="text-[13px] truncate font-medium text-green-500 dark:text-green-400"
           style="letter-spacing: -0.2px;">
          {{ typingStatusText }}
        </p>
        <p v-else
           class="text-[13px] truncate transition-colors duration-300"
           style="letter-spacing: -0.2px;"
           :style="chat.unread > 0
             ? 'color: var(--text-primary); font-weight: 500;'
             : 'color: var(--text-secondary);'">
          {{ lastMessageText }}
        </p>
        <!-- Unread badge -->
        <span v-if="chat.unread > 0"
              class="flex-shrink-0 ml-2 flex items-center justify-center text-white text-[11px] font-semibold rounded-full min-w-[20px] h-[20px] px-1.5"
              style="background: var(--accent-color);">
          {{ chat.unread > 9 ? '9+' : chat.unread }}
        </span>
      </div>
    </div>
  </button>
</template>
