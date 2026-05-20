<script setup>
import { onMounted, ref, watch } from 'vue';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/auth';
import { useThemeStore } from '../../stores/themeStore';
import FriendshipButton from './FriendshipButton.vue';
import CreateGroupModal from './CreateGroupModal.vue';

const emit = defineEmits(['select-chat']);
const chatStore = useChatStore();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const selectedId = ref(null);
const searchQuery = ref('');
const isCreateGroupModalOpen = ref(false);

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

const handleGroupCreated = (id) => {
  selectChat(id);
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

const handleMouseOver = (event, isSelected) => {
  if (!isSelected) {
    event.currentTarget.style.background = themeStore.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  }
};

const handleMouseOut = (event, isSelected) => {
  if (!isSelected) {
    event.currentTarget.style.background = 'transparent';
  }
};

const handleSearchMouseOver = (event) => {
  event.currentTarget.style.background = themeStore.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
};

const handleSearchMouseOut = (event) => {
  event.currentTarget.style.background = 'transparent';
};
</script>

<template>
  <div class="flex flex-col h-full relative transition-colors duration-300">

    <!-- Search bar -->
    <div class="px-4 py-3 flex-shrink-0 transition-colors duration-300 flex items-center gap-2"
         :style="themeStore.isDark ? 'border-bottom: 1px solid rgba(255,255,255,0.07);' : 'border-bottom: 1px solid rgba(0,0,0,0.08);'">
      <div class="relative flex-1">
        <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors duration-300"
              :style="themeStore.isDark ? 'color: rgba(255,255,255,0.3);' : 'color: rgba(0,0,0,0.4);'">
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
          class="w-full pl-9 py-2.5 text-sm transition-all duration-300"
          :class="themeStore.isDark ? 'apple-input' : 'apple-input-light'"
        />
      </div>

      <!-- Create Group Button -->
      <button 
        @click="isCreateGroupModalOpen = true"
        class="p-2 rounded-full transition-colors flex-shrink-0 hover:bg-gray-500/20"
        :style="themeStore.isDark ? 'color: #fff;' : 'color: #1d1d1f;'"
        title="Tạo nhóm chat"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      </button>

      <!-- Search results dropdown -->
      <div v-if="searchQuery && (chatStore.searchResults.length > 0 || chatStore.isSearching)"
           class="absolute left-4 right-4 top-[72px] z-50 rounded-[12px] py-2 overflow-hidden animate-slide-down transition-all duration-300"
           :style="themeStore.isDark
             ? 'background: #28282a; box-shadow: rgba(0,0,0,0.5) 0 8px 32px 0; border: 1px solid rgba(255,255,255,0.08);'
             : 'background: #ffffff; box-shadow: rgba(0,0,0,0.12) 0 8px 32px 0; border: 1px solid rgba(0,0,0,0.08);'">

        <div v-if="chatStore.isSearching" class="px-4 py-3 flex items-center gap-2 transition-colors duration-300"
             :style="themeStore.isDark ? 'color: rgba(255,255,255,0.4);' : 'color: rgba(0,0,0,0.4);'">
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
              @mouseover="handleSearchMouseOver"
              @mouseout="handleSearchMouseOut"
            >
              <img
                :src="user.avatar || 'https://ui-avatars.com/api/?name=' + user.name + '&background=' + (themeStore.isDark ? '272729' : 'e9e9eb') + '&color=' + (themeStore.isDark ? 'fff' : '1d1d1f')"
                class="w-9 h-9 rounded-full object-cover flex-shrink-0"
                :alt="user.name"
              />
              <div class="min-w-0">
                <p class="text-sm font-medium truncate transition-colors duration-300"
                   style="letter-spacing: -0.224px;"
                   :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
                  {{ user.name }}
                </p>
                <p class="text-xs truncate transition-colors duration-300"
                   :style="themeStore.isDark ? 'color: rgba(255,255,255,0.4);' : 'color: rgba(0,0,0,0.4);'">
                  @{{ user.username }}
                </p>
              </div>
            </button>

            <!-- Friendship action buttons -->
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
      <div v-if="chatStore.isLoading && chatStore.conversations.length === 0" class="p-4 space-y-3 animate-pulse">
        <div v-for="i in 6" :key="i" class="flex items-center gap-3 px-2 py-2">
          <div class="w-11 h-11 rounded-full flex-shrink-0"
               :class="themeStore.isDark ? 'bg-white/10' : 'bg-black/10'"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 rounded-full"
                 :class="[
                   themeStore.isDark ? 'bg-white/10' : 'bg-black/10',
                   i % 3 === 0 ? 'w-2/5' : (i % 3 === 1 ? 'w-3/5' : 'w-1/2')
                 ]"></div>
            <div class="h-2.5 rounded-full w-4/5"
                 :class="themeStore.isDark ? 'bg-white/5' : 'bg-black/5'"></div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="chatStore.conversations.length === 0"
           class="text-center py-16 px-6 transition-colors duration-300"
           :style="themeStore.isDark ? 'color: rgba(255,255,255,0.3);' : 'color: rgba(0,0,0,0.4);'">
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
          :class="{ 'selected': selectedId === chat.id }"
          :style="selectedId === chat.id
            ? 'background: rgba(0,113,227,0.15);'
            : 'background: transparent;'"
          @mouseover="handleMouseOver($event, selectedId === chat.id)"
          @mouseout="handleMouseOut($event, selectedId === chat.id)"
        >
          <!-- Active indicator bar — Apple Blue -->
          <div v-if="selectedId === chat.id"
               class="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
               style="background: #0071e3;"></div>

          <!-- Avatar with online dot -->
          <div class="relative flex-shrink-0">
            <img
              :src="getTargetUser(chat)?.avatar || 'https://ui-avatars.com/api/?name=' + (getTargetUser(chat)?.name || 'U') + '&background=' + (themeStore.isDark ? '272729' : 'e9e9eb') + '&color=' + (themeStore.isDark ? 'fff' : '1d1d1f')"
              alt="Avatar"
              class="w-11 h-11 rounded-full object-cover transition-colors duration-300"
              :style="themeStore.isDark ? 'background: #272729;' : 'background: #e9e9eb;'"
            />
            <div v-if="getTargetUser(chat)?.is_online"
                 class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 transition-colors duration-300"
                 style="background: #32d74b;"
                 :style="themeStore.isDark ? 'border-color: #1d1d1f;' : 'border-color: #ffffff;'"></div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-0.5">
              <h3 class="text-sm font-semibold truncate transition-colors duration-300"
                  style="letter-spacing: -0.224px;"
                  :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
                {{ getTargetUser(chat)?.name || 'Đang tải...' }}
              </h3>
              <span class="text-[11px] flex-shrink-0 ml-2 transition-colors duration-300"
                    style="letter-spacing: -0.08px;"
                    :style="themeStore.isDark ? 'color: rgba(255,255,255,0.3);' : 'color: rgba(0,0,0,0.4);'">
                {{ formatTime(chat.last_message?.created_at || chat.updated_at) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-xs truncate transition-colors duration-300"
                 style="letter-spacing: -0.224px;"
                 :style="chat.unread > 0
                   ? (themeStore.isDark ? 'color: #ffffff; font-weight: 600;' : 'color: #1d1d1f; font-weight: 600;')
                   : (themeStore.isDark ? 'color: rgba(255,255,255,0.4);' : 'color: rgba(0,0,0,0.5);')">
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
    
    <!-- Create Group Modal -->
    <CreateGroupModal 
      v-if="isCreateGroupModalOpen" 
      @close="isCreateGroupModalOpen = false"
      @created="handleGroupCreated"
    />
  </div>
</template>