<script setup>
import { ref, watch } from 'vue';
import { useChatStore } from '../../../stores/chatStore';
import { useAuthStore } from '../../../stores/auth';
import { useThemeStore } from '../../../stores/themeStore';
import FriendshipButton from '../ui/FriendshipButton.vue';

const emit = defineEmits(['open-create-group', 'start-conversation']);

const chatStore = useChatStore();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const searchQuery = ref('');
let searchTimeout = null;

watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (!newVal || newVal.trim() === '') {
    chatStore.searchResults = [];
    return;
  }
  searchTimeout = setTimeout(() => {
    chatStore.searchUsers(newVal);
  }, 400);
});

const handleSearchMouseOver = (event) => {
  event.currentTarget.style.background = themeStore.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
};

const handleSearchMouseOut = (event) => {
  event.currentTarget.style.background = 'transparent';
};

const handleStartConversation = (userId) => {
  emit('start-conversation', userId);
  searchQuery.value = ''; // clear search after start
};

// Expose clear function if needed, though resetting value inside works
</script>

<template>
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
      @click="$emit('open-create-group')"
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
</template>
