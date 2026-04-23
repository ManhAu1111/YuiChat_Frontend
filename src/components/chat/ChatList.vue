<script setup>
import { onMounted, ref, watch } from 'vue';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/auth';
import { useFriendshipStore } from '../../stores/friendshipStore';
import FriendshipButton from './FriendshipButton.vue';

const emit = defineEmits(['select-chat']);
const chatStore = useChatStore();
const authStore = useAuthStore();
const friendshipStore = useFriendshipStore();
const selectedId = ref(null);
const searchQuery = ref('');

let searchTimeout = null;

onMounted(() => {
  chatStore.fetchConversations();
});

watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (!newVal || newVal.trim() === '') { chatStore.searchResults = []; return; }
  searchTimeout = setTimeout(() => { chatStore.searchUsers(newVal); }, 400);
});

watch(() => chatStore.activeConversationId, (newId) => {
  selectedId.value = newId;
});

const selectChat = (id) => {
  selectedId.value = id;
  emit('select-chat', id);
};

const handleStartConversation = async (userId) => {
  try {
    const conversation = await chatStore.startConversation(userId);
    searchQuery.value = '';
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
  <div class="flex flex-col h-full relative">

    <!-- Search bar -->
    <div class="px-4 py-3 flex-shrink-0" style="border-bottom: 1px solid rgba(255,255,255,0.07);">
      <div class="relative">
        <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none"
              style="color: rgba(255,255,255,0.3);">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          id="chat-search-input"
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm..."
          class="apple-input w-full pl-9 py-2.5 text-sm"
        />
      </div>

      <!-- Search results dropdown -->
      <div v-if="searchQuery && (chatStore.searchResults.length > 0 || chatStore.isSearching)"
           class="absolute left-4 right-4 top-[72px] z-50 rounded-[12px] py-2 overflow-hidden animate-slide-down"
           style="background: #28282a; box-shadow: rgba(0,0,0,0.5) 0 8px 32px 0; border: 1px solid rgba(255,255,255,0.08);">

        <div v-if="chatStore.isSearching" class="px-4 py-3 flex items-center gap-2"
             style="color: rgba(255,255,255,0.4);">
          <svg class="w-3.5 h-3.5 animate-spin-smooth" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span class="text-xs">Đang tìm kiếm...</span>
        </div>

        <div v-else class="max-h-72 overflow-y-auto">
          <div
            v-for="user in chatStore.searchResults"
            :key="user.id"
            class="w-full px-4 py-2.5 flex items-center gap-3 text-left"
          >
            <!-- Avatar — click to open conversation -->
            <button
              class="flex items-center gap-3 flex-1 min-w-0 text-left transition-colors rounded-lg"
              style="border: none; background: transparent; padding: 0;"
              @click="handleStartConversation(user.id)"
              onmouseover="this.style.background='rgba(255,255,255,0.04)'"
              onmouseout="this.style.background='transparent'"
            >
              <img
                :src="user.avatar || 'https://ui-avatars.com/api/?name=' + user.name + '&background=272729&color=fff'"
                class="w-9 h-9 rounded-full object-cover flex-shrink-0"
                :alt="user.name"
              />
              <div class="min-w-0">
                <p class="text-sm font-medium text-white truncate" style="letter-spacing: -0.224px;">{{ user.name }}</p>
                <p class="text-xs truncate" style="color: rgba(255,255,255,0.4);">@{{ user.username }}</p>
              </div>
            </button>

            <!-- Friendship action buttons — inline in the dark sidebar context -->
            <div class="flex-shrink-0">
              <FriendshipButton :targetUserId="user.id" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conversation list -->
    <div class="flex-1 overflow-y-auto">

      <!-- Loading skeleton -->
      <div v-if="chatStore.isLoading && chatStore.conversations.length === 0" class="p-4 space-y-3">
        <div v-for="i in 5" :key="i" class="flex items-center gap-3 px-2 py-2">
          <div class="w-11 h-11 rounded-full flex-shrink-0" style="background: rgba(255,255,255,0.06);"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 rounded-full w-3/5" style="background: rgba(255,255,255,0.06);"></div>
            <div class="h-2.5 rounded-full w-4/5" style="background: rgba(255,255,255,0.04);"></div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="chatStore.conversations.length === 0"
           class="text-center py-16 px-6"
           style="color: rgba(255,255,255,0.3);">
        <svg class="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <p class="text-sm">Chưa có cuộc trò chuyện nào.</p>
        <p class="text-xs mt-1">Tìm kiếm để bắt đầu nhắn tin.</p>
      </div>

      <!-- List items -->
      <div v-else>
        <button
          v-for="chat in chatStore.conversations"
          :key="chat.id"
          @click="selectChat(chat.id)"
          class="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 relative"
          :style="selectedId === chat.id
            ? 'background: rgba(0,113,227,0.15);'
            : 'background: transparent;'"
          onmouseover="if (!this.classList.contains('selected')) this.style.background='rgba(255,255,255,0.04)'"
          onmouseout="if (!this.classList.contains('selected')) this.style.background='transparent'"
        >
          <!-- Active indicator bar — Apple Blue -->
          <div v-if="selectedId === chat.id"
               class="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
               style="background: #0071e3;"></div>

          <!-- Avatar with online dot -->
          <div class="relative flex-shrink-0">
            <img
              :src="getTargetUser(chat)?.avatar || 'https://ui-avatars.com/api/?name=' + (getTargetUser(chat)?.name || 'U') + '&background=272729&color=fff'"
              alt="Avatar"
              class="w-11 h-11 rounded-full object-cover"
              style="background: #272729;"
            />
            <div v-if="getTargetUser(chat)?.is_online"
                 class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                 style="background: #32d74b; border-color: #1d1d1f;"></div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-0.5">
              <h3 class="text-sm font-semibold truncate text-white"
                  style="letter-spacing: -0.224px;">
                {{ getTargetUser(chat)?.name || 'Đang tải...' }}
              </h3>
              <span class="text-[11px] flex-shrink-0 ml-2"
                    style="color: rgba(255,255,255,0.3); letter-spacing: -0.08px;">
                {{ formatTime(chat.last_message?.created_at || chat.updated_at) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-xs truncate" :class="chat.unread > 0 ? 'text-white' : ''"
                 :style="chat.unread > 0 ? 'letter-spacing: -0.224px;' : 'color: rgba(255,255,255,0.4); letter-spacing: -0.224px;'">
                {{ chat.last_message ? chat.last_message.content : 'Hãy bắt đầu cuộc hội thoại...' }}
              </p>
              <!-- Unread badge — Apple Blue -->
              <span v-if="chat.unread > 0"
                    class="flex-shrink-0 ml-2 flex items-center justify-center text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] px-1"
                    style="background: #0071e3;">
                {{ chat.unread > 9 ? '9+' : chat.unread }}
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>