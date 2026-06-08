<script setup>
import { onMounted, ref, watch } from 'vue';
import { useChatStore } from '../../../stores/chatStore';
import { useAuthStore } from '../../../stores/auth';
import { getFileUrl } from '../../../services/api';
import FriendshipButton from '../ui/FriendshipButton.vue';
import CreateGroupModal from '../modals/CreateGroupModal.vue';
import SearchBar from './SearchBar.vue';
import ChatItem from './ChatItem.vue';
import ActiveStatusList from './ActiveStatusList.vue';

const emit = defineEmits(['select-chat']);
const chatStore = useChatStore();
const authStore = useAuthStore();
const selectedId = ref(null);
const isCreateGroupModalOpen = ref(false);

onMounted(() => {
  chatStore.fetchConversations();
});

watch(() => chatStore.activeConversationId, (newId) => {
  selectedId.value = newId;
});

const selectChat = (id) => {
  selectedId.value = id;
  emit('select-chat', id);
};

const handleGroupCreated = (id) => {
  selectChat(id);
};

const handleStartConversation = async (userId) => {
  try {
    const conversation = await chatStore.startConversation(userId);
    selectChat(conversation.id);
  } catch {
    alert('Không thể bắt đầu trò chuyện!');
  }
};

</script>

<template>
  <div class="flex flex-col h-full relative transition-colors duration-300">

    <!-- Search bar -->
    <SearchBar
      @open-create-group="isCreateGroupModalOpen = true"
      @start-conversation="handleStartConversation"
    />

    <!-- Active Statuses / Notes -->
    <ActiveStatusList />

    <!-- Conversation list -->
    <div class="flex-1 overflow-y-auto px-2 py-2">

      <!-- Loading skeleton -->
      <div v-if="chatStore.isLoading && chatStore.conversations.length === 0" class="space-y-1 animate-pulse">
        <div v-for="i in 6" :key="i" class="flex items-center gap-3 px-3 py-2">
          <div class="w-12 h-12 rounded-full flex-shrink-0"
               style="background: var(--hover-bg);"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 rounded-full"
                 style="background: var(--hover-bg);"
                 :class="i % 3 === 0 ? 'w-2/5' : (i % 3 === 1 ? 'w-3/5' : 'w-1/2')"></div>
            <div class="h-2.5 rounded-full w-4/5"
                 style="background: var(--glass-border);"></div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="chatStore.conversations.length === 0"
           class="text-center py-16 px-6 transition-colors duration-300"
           style="color: var(--text-tertiary);">
        <svg class="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <p class="text-[13px] font-medium">Chưa có cuộc trò chuyện nào.</p>
        <p class="text-xs mt-1 opacity-70">Tìm kiếm để bắt đầu nhắn tin.</p>
      </div>

      <!-- List items -->
      <div v-else class="space-y-1">
        <ChatItem
          v-for="chat in chatStore.conversations"
          :key="chat.id"
          :chat="chat"
          :selected="selectedId === chat.id"
          @select="selectChat"
        />
      </div>
    </div>
    
    <!-- Create Group Modal -->
    <CreateGroupModal 
      v-if="isCreateGroupModalOpen" 
      @close="isCreateGroupModalOpen = false"
      @created="handleGroupCreated"
    />
  </div>
</template>