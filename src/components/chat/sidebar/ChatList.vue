<script setup>
import { onMounted, ref, watch } from 'vue';
import { useChatStore } from '../../../stores/chatStore';
import { useAuthStore } from '../../../stores/auth';
import FriendshipButton from '../ui/FriendshipButton.vue';
import CreateGroupModal from '../modals/CreateGroupModal.vue';
import SearchBar from './SearchBar.vue';

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

const getTargetUser = (conversation) => {
  if (!conversation?.participants) return null;
  if (conversation.is_group) return { name: conversation.name, avatar: conversation.avatar, is_online: false };
  if (!authStore.user?.id) return null;
  const participant = conversation.participants.find(p => p.user_id !== authStore.user.id);
  return participant ? participant.user : null;
};

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
</script>

<template>
  <div class="flex flex-col h-full relative transition-colors duration-300">

    <!-- Search bar -->
    <SearchBar
      @open-create-group="isCreateGroupModalOpen = true"
      @start-conversation="handleStartConversation"
    />

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
        <button
          v-for="chat in chatStore.conversations"
          :key="chat.id"
          @click="selectChat(chat.id)"
          class="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 relative rounded-2xl"
          :class="{ 'selected': selectedId === chat.id }"
          :data-selected="selectedId === chat.id"
          :style="selectedId === chat.id ? 'background: var(--accent-light);' : 'background: transparent;'"
          onmouseover="if(this.getAttribute('data-selected') !== 'true') this.style.background='var(--hover-bg)';"
          onmouseout="if(this.getAttribute('data-selected') !== 'true') this.style.background='transparent';"
        >
          <!-- Avatar with online dot -->
          <div class="relative flex-shrink-0">
            <img
              :src="getTargetUser(chat)?.avatar || 'https://ui-avatars.com/api/?name=' + (getTargetUser(chat)?.name || 'U') + '&background=random'"
              alt="Avatar"
              class="w-12 h-12 rounded-full object-cover transition-colors duration-300"
              style="background: var(--hover-bg);"
            />
            <div v-if="getTargetUser(chat)?.is_online"
                 class="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 transition-colors duration-300"
                 style="background: #32d74b; border-color: var(--bg-secondary);"></div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-0.5">
              <h3 class="text-[15px] font-semibold truncate transition-colors duration-300"
                  style="letter-spacing: -0.3px; color: var(--text-primary);">
                {{ getTargetUser(chat)?.name || 'Đang tải...' }}
              </h3>
              <span class="text-[11px] flex-shrink-0 ml-2 transition-colors duration-300"
                    style="letter-spacing: -0.1px;"
                    :style="selectedId === chat.id ? 'color: var(--accent-color);' : 'color: var(--text-secondary);'">
                {{ formatTime(chat.last_message?.created_at || chat.updated_at) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-[13px] truncate transition-colors duration-300"
                 style="letter-spacing: -0.2px;"
                 :style="chat.unread > 0
                   ? 'color: var(--text-primary); font-weight: 500;'
                   : 'color: var(--text-secondary);'">
                {{ chat.last_message ? chat.last_message.content : 'Hãy bắt đầu cuộc hội thoại...' }}
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