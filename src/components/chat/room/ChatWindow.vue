<script setup>
import { watch, nextTick, ref, computed } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { useChatStore } from '../../../stores/chatStore';
import { useThemeStore } from '../../../stores/themeStore';
import ChatHeader from './ChatHeader.vue';
import ChatInput from './ChatInput.vue';
import MessageBubble from './MessageBubble.vue';
import TypingIndicator from './TypingIndicator.vue';
import GroupInfoPanel from '../info/GroupInfoPanel.vue';
import ForwardModal from '../modals/ForwardModal.vue';

const props = defineProps(['chatId']);
const emit = defineEmits(['back']);

const chatStore = useChatStore();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const messageContainer = ref(null);
const isGroupInfoOpen = ref(false);

const currentConversation = computed(() =>
  chatStore.conversations.find(c => c.id === props.chatId)
);

const targetUser = computed(() => {
  if (!currentConversation.value || !authStore.user) return null;
  
  if (currentConversation.value.is_group) {
    return {
      id: currentConversation.value.id,
      name: currentConversation.value.name,
      avatar: currentConversation.value.avatar,
      is_group: true,
      is_online: false
    };
  }
  
  const participant = currentConversation.value.participants.find(p => p.user_id !== authStore.user.id);
  return participant ? participant.user : null;
});

const getSender = (senderId) => {
  if (!currentConversation.value) return null;
  const participant = currentConversation.value.participants.find(p => p.user_id === senderId);
  return participant ? participant.user : null;
};

const scrollToBottom = async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

watch(() => props.chatId, (newId, oldId) => {
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

const isLastInSequence = (idx) => {
  const msgs = chatStore.currentMessages;
  if (idx === msgs.length - 1) return true;
  
  const currentMsg = msgs[idx];
  const nextMsg = msgs[idx + 1];
  
  if (currentMsg.sender_id !== nextMsg.sender_id) return true;
  
  const currentTime = new Date(currentMsg.created_at).getTime();
  const nextTime = new Date(nextMsg.created_at).getTime();
  
  if (nextTime - currentTime > 300000) return true; // > 5 minutes
  
  return false;
};

// Selection Mode Logic
const isForwardModalOpen = ref(false);

const handleCancelSelection = () => {
  chatStore.toggleSelectionMode(false);
};

const handleForwardSelected = () => {
  if (chatStore.selectedMessageIds.length === 0) return;
  selectedAttachments.value = []; // clear attachments
  isForwardModalOpen.value = true;
};

const selectedAttachments = ref([]);
const handleForwardAttachment = (attachment) => {
  chatStore.toggleSelectionMode(false); // clear message selection
  selectedAttachments.value = [attachment];
  isForwardModalOpen.value = true;
};

const handleForwardSuccess = () => {
  // Option: show a toast or alert
};
</script>

<template>
  <!--
    Apple ChatWindow: white background, #f5f5f7 message area
    Sent bubbles: Apple Blue #0071e3
    Received: #e9e9eb (light gray, no shadow)
  -->
  <div class="flex flex-col h-full transition-colors duration-300 relative"
       :style="themeStore.isDark ? 'background: #000000;' : 'background: #ffffff;'">
    
    <!-- Selection Mode Toolbar (Replaces header visually when active) -->
    <div v-if="chatStore.isSelectionMode" class="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 shadow-sm transition-colors duration-300 backdrop-blur-md"
         :style="themeStore.isDark ? 'background: rgba(28,28,30,0.8); border-bottom: 1px solid rgba(255,255,255,0.08);' : 'background: rgba(255,255,255,0.8); border-bottom: 1px solid rgba(0,0,0,0.05);'">
      <div class="flex items-center gap-4">
        <button @click="handleCancelSelection" class="text-sm font-medium" :style="themeStore.isDark ? 'color: #0a84ff;' : 'color: #007aff;'">Hủy</button>
        <span class="font-semibold text-[17px]" :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">Đã chọn {{ chatStore.selectedMessageIds.length }}</span>
      </div>
      <div class="flex items-center gap-3">
        <button @click="handleForwardSelected" :disabled="chatStore.selectedMessageIds.length === 0" 
                class="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                :style="themeStore.isDark ? 'background: rgba(255,255,255,0.1); color: #ffffff;' : 'background: rgba(0,0,0,0.05); color: #1d1d1f;'">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>
    </div>

    <ChatHeader 
      v-else
      :chatId="chatId" 
      :user="targetUser" 
      @back="emit('back')" 
      @open-info="isGroupInfoOpen = true" 
    />

    <!-- Main Content Area (Chat + Sidebar) -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Chat Area -->
      <div class="flex flex-col flex-1 min-w-0">
        <!-- Messages area -->
        <div
          ref="messageContainer"
          class="flex-1 overflow-y-auto px-5 py-6 space-y-1 transition-colors duration-300"
          :style="themeStore.isDark ? 'background: #000000;' : 'background: #f5f5f7;'"
        >
          <!-- Skeleton loader for messages -->
          <div v-if="chatStore.isLoadingMessages" class="space-y-4 animate-pulse">
            <div v-for="i in 5" :key="i" class="flex items-end gap-2"
                 :class="i % 2 === 0 ? 'justify-end' : 'justify-start'">
              <!-- Received message avatar skeleton -->
              <div v-if="i % 2 !== 0" class="w-7 h-7 rounded-full flex-shrink-0"
                   :class="themeStore.isDark ? 'bg-white/10' : 'bg-black/10'"></div>
              
              <!-- Bubble skeleton -->
              <div class="px-4 py-3 rounded-2xl max-w-[65%]"
                   :class="[
                     i % 2 === 0 
                       ? (themeStore.isDark ? 'bg-white/10 rounded-br-sm' : 'bg-black/10 rounded-br-sm') 
                       : (themeStore.isDark ? 'bg-white/5 rounded-bl-sm' : 'bg-black/5 rounded-bl-sm'),
                     i === 1 ? 'w-[45%]' : i === 2 ? 'w-[30%]' : i === 3 ? 'w-[55%]' : i === 4 ? 'w-[40%]' : 'w-[50%]'
                   ]">
                <div class="h-3 rounded-full mb-2"
                     :class="themeStore.isDark ? 'bg-white/10' : 'bg-black/10'"></div>
                <div class="h-2 rounded-full w-2/3"
                     :class="themeStore.isDark ? 'bg-white/5' : 'bg-black/5'"></div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="chatStore.currentMessages.length === 0"
               class="flex flex-col items-center justify-center h-full text-center py-12">
            <div class="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors duration-300"
                 :style="themeStore.isDark ? 'background: rgba(255,255,255,0.08);' : 'background: rgba(0,0,0,0.06);'">
              <svg class="w-7 h-7 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   :style="themeStore.isDark ? 'color: rgba(255,255,255,0.4);' : 'color: rgba(0,0,0,0.24);'">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <p class="text-sm font-msdegghseegweklj., aesjgglawse klkjhedium transition-colors duration-300"
               style="letter-spacing: -0.224px;"
               :style="themeStore.isDark ? 'color: rgba(255,255,255,0.48);' : 'color: rgba(0,0,0,0.48);'">
              Hãy bắt đầu cuộc trò chuyện!
            </p>
          </div>

      <!-- Message bubbles -->
      <TransitionGroup name="bubble" tag="div" class="space-y-1">
        <MessageBubble
          v-for="(msg, idx) in chatStore.currentMessages"
          :key="msg._id || msg.id"
          :msg="msg"
          :isMine="msg.sender_id === authStore.user?.id"
          :sender="getSender(msg.sender_id)"
          :showAvatar="shouldShowAvatar(idx)"
          :participants="currentConversation?.participants || []"
          :isGroup="currentConversation?.is_group || false"
          :showTimeAndStatus="isLastInSequence(idx)"
          @forward-attachment="handleForwardAttachment"
        />
      </TransitionGroup>

        <!-- Typing Indicators -->
        <TransitionGroup name="fade" tag="div">
          <div v-if="chatStore.typingUsers[chatId]?.length > 0" class="mt-2 pl-2">
            <TypingIndicator 
              v-for="user in chatStore.typingUsers[chatId]" 
              :key="user.id" 
              :user="user" 
            />
          </div>
        </TransitionGroup>
        </div>

        <ChatInput :conversationId="chatId" />
      </div>
      
      <GroupInfoPanel 
        v-if="isGroupInfoOpen && currentConversation?.is_group"
        :conversation="currentConversation"
        @close="isGroupInfoOpen = false"
      />
    </div>

    <!-- Forward Modal -->
    <ForwardModal 
      :isOpen="isForwardModalOpen"
      :messageIds="chatStore.selectedMessageIds"
      :attachments="selectedAttachments"
      @close="isForwardModalOpen = false"
      @forwarded="handleForwardSuccess"
    />
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
