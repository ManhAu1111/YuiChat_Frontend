<script setup>
import { onMounted, watch, nextTick, ref, computed } from 'vue';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/auth';
import ChatHeader from './ChatHeader.vue';
import ChatInput from './ChatInput.vue';

const props = defineProps(['chatId']);
const emit = defineEmits(['back']);

const chatStore = useChatStore();
const authStore = useAuthStore();
const messageContainer = ref(null);

const currentConversation = computed(() => 
  chatStore.conversations.find(c => c.id === props.chatId)
);

const targetUser = computed(() => {
  if (!currentConversation.value || !authStore.user) return null;
  // Tìm người tham gia khác với ID của mình
  const participant = currentConversation.value.participants.find(p => p.user_id !== authStore.user.id);
  return participant ? participant.user : null;
});

// Hàm cuộn xuống cuối danh sách tin nhắn
const scrollToBottom = async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// Gọi lấy tin nhắn mỗi khi đổi chatId
watch(() => props.chatId, (newId) => {
  if (newId) {
    chatStore.fetchMessages(newId).then(scrollToBottom);
  }
}, { immediate: true });

// Cuộn xuống khi có tin nhắn mới
watch(() => chatStore.currentMessages.length, scrollToBottom);

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <ChatHeader :chatId="chatId" :user="targetUser" @back="emit('back')"/>

    <div ref="messageContainer" class="flex-1 overflow-y-auto p-6 space-y-4 bg-[#e5ecef] scroll-smooth">
      <div v-for="msg in chatStore.currentMessages" :key="msg.id" 
           class="flex animate-fade-in"
           :class="msg.sender_id === authStore.user?.id ? 'justify-end' : 'justify-start'">
        
        <div class="max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm relative text-sm min-w-[60px]"
             :class="msg.sender_id === authStore.user?.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'">
          <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
          <div class="flex justify-end mt-1">
            <span class="text-[9px] opacity-60">{{ formatTime(msg.created_at) }}</span>
          </div>
        </div>

      </div>
    </div>

    <ChatInput :conversationId="chatId" />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
