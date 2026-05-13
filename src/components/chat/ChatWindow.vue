<script setup>
import { onMounted, watch, nextTick, ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useChatStore } from '../../stores/chatStore';
import { useThemeStore } from '../../stores/themeStore';
import ChatHeader from './ChatHeader.vue';
import ChatInput from './ChatInput.vue';

const props = defineProps(['chatId']);
const emit = defineEmits(['back']);

const chatStore = useChatStore();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const messageContainer = ref(null);

const currentConversation = computed(() =>
  chatStore.conversations.find(c => c.id === props.chatId)
);

const targetUser = computed(() => {
  if (!currentConversation.value || !authStore.user) return null;
  const participant = currentConversation.value.participants.find(p => p.user_id !== authStore.user.id);
  return participant ? participant.user : null;
});

const scrollToBottom = async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

watch(() => props.chatId, (newId, oldId) => {
  if (oldId) chatStore.leaveChannel(oldId);
  if (newId) {
    chatStore.fetchMessages(newId).then(() => {
      scrollToBottom();
      chatStore.listenForMessages(newId);
    });
  }
}, { immediate: true });

watch(() => chatStore.currentMessages.length, scrollToBottom);

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Group messages: show avatar only for first in consecutive run from same sender
const shouldShowAvatar = (idx) => {
  const msgs = chatStore.currentMessages;
  if (idx === 0) return true;
  return msgs[idx].sender_id !== msgs[idx - 1].sender_id;
};
</script>

<template>
  <!--
    Apple ChatWindow: white background, #f5f5f7 message area
    Sent bubbles: Apple Blue #0071e3
    Received: #e9e9eb (light gray, no shadow)
  -->
  <div class="flex flex-col h-full transition-colors duration-300"
       :style="themeStore.isDark ? 'background: #000000;' : 'background: #ffffff;'">
    <ChatHeader :chatId="chatId" :user="targetUser" @back="emit('back')" />

    <!-- Messages area -->
    <div
      ref="messageContainer"
      class="flex-1 overflow-y-auto px-5 py-6 space-y-1 transition-colors duration-300"
      :style="themeStore.isDark ? 'background: #000000;' : 'background: #f5f5f7;'"
    >
      <!-- Empty state -->
      <div v-if="chatStore.currentMessages.length === 0"
           class="flex flex-col items-center justify-center h-full text-center py-12">
        <div class="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors duration-300"
             :style="themeStore.isDark ? 'background: rgba(255,255,255,0.08);' : 'background: rgba(0,0,0,0.06);'">
          <svg class="w-7 h-7 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"
               :style="themeStore.isDark ? 'color: rgba(255,255,255,0.4);' : 'color: rgba(0,0,0,0.24);'">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <p class="text-sm font-medium transition-colors duration-300"
           style="letter-spacing: -0.224px;"
           :style="themeStore.isDark ? 'color: rgba(255,255,255,0.48);' : 'color: rgba(0,0,0,0.48);'">
          Hãy bắt đầu cuộc trò chuyện!
        </p>
      </div>

      <!-- Message bubbles -->
      <TransitionGroup name="bubble" tag="div" class="space-y-1">
        <div
          v-for="(msg, idx) in chatStore.currentMessages"
          :key="msg.id"
          class="flex items-end gap-2"
          :class="msg.sender_id === authStore.user?.id ? 'justify-end' : 'justify-start'"
        >
          <!-- Received: avatar placeholder for alignment -->
          <div v-if="msg.sender_id !== authStore.user?.id" class="w-7 flex-shrink-0">
            <img
              v-if="shouldShowAvatar(idx)"
              :src="targetUser?.avatar || 'https://ui-avatars.com/api/?name=' + (targetUser?.name || 'U') + '&background=e9e9eb&color=1d1d1f&size=56'"
              class="w-7 h-7 rounded-full object-cover"
            />
          </div>

          <!-- Bubble -->
          <div
            class="max-w-[65%] px-4 py-2.5 text-sm"
            :class="msg.sender_id === authStore.user?.id ? 'bubble-sent' : 'bubble-received'"
            style="letter-spacing: -0.224px; line-height: 1.47;"
          >
            <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
            <div class="flex justify-end mt-0.5">
              <span class="text-[9px] opacity-50" style="letter-spacing: 0;">
                {{ formatTime(msg.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <ChatInput :conversationId="chatId" />
  </div>
</template>

<style scoped>
.bubble-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.bubble-enter-from {
  opacity: 0;
  transform: translateY(6px) scale(0.96);
}
</style>
