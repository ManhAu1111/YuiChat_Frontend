<script setup>
import { ref, watch } from 'vue';
import { useChatStore } from '../../../stores/chatStore';
import FriendshipButton from '../ui/FriendshipButton.vue';

const emit = defineEmits(['open-create-group', 'start-conversation']);

const chatStore = useChatStore();

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

const handleStartConversation = (userId) => {
  emit('start-conversation', userId);
  searchQuery.value = ''; // clear search after start
};
</script>

<template>
  <!-- Search container without hard bottom border, just padding to blend with list -->
  <div class="px-4 py-3 flex-shrink-0 transition-colors duration-300 flex items-center gap-2">
    <div class="relative flex-1">
      <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors duration-300"
            style="color: var(--text-tertiary);">
        <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        id="chat-search-input"
        v-model="searchQuery"
        type="text"
        placeholder="Tìm kiếm"
        class="w-full pl-[38px] py-[9px] text-[15px] transition-all duration-300 rounded-full outline-none border border-transparent"
        style="background: var(--hover-bg); color: var(--text-primary);"
        onfocus="this.style.borderColor='var(--accent-color)';"
        onblur="this.style.borderColor='transparent';"
      />
    </div>

    <!-- Create Group Button -->
    <button 
      @click="$emit('open-create-group')"
      class="p-2 rounded-full transition-colors flex-shrink-0"
      style="color: var(--text-secondary);"
      onmouseover="this.style.background='var(--hover-bg)'"
      onmouseout="this.style.background='transparent'"
      title="Tạo nhóm chat"
    >
      <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4v16m8-8H4"></path>
      </svg>
    </button>

    <!-- Search results dropdown -->
    <div v-if="searchQuery && (chatStore.searchResults.length > 0 || chatStore.isSearching)"
         class="absolute left-4 right-4 top-[64px] z-50 rounded-[16px] py-2 overflow-hidden animate-slide-down transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.15)]"
         style="background: var(--glass-bg); backdrop-filter: saturate(180%) blur(20px); border: 1px solid var(--glass-border);">

      <div v-if="chatStore.isSearching" class="px-4 py-4 flex justify-center items-center gap-2 transition-colors duration-300"
           style="color: var(--text-tertiary);">
        <svg class="w-4 h-4 animate-spin-smooth" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>

      <div v-else class="max-h-72 overflow-y-auto px-1">
        <div
          v-for="user in chatStore.searchResults"
          :key="user.id"
          class="w-full px-2 py-1 flex items-center gap-3 text-left"
        >
          <!-- Avatar — click to open conversation -->
          <button
            class="flex items-center gap-3 flex-1 min-w-0 text-left transition-colors rounded-[12px] px-2 py-2"
            style="border: none; background: transparent;"
            @click="handleStartConversation(user.id)"
            onmouseover="this.style.background='var(--hover-bg)'"
            onmouseout="this.style.background='transparent'"
          >
            <img
              :src="user.avatar || 'https://ui-avatars.com/api/?name=' + user.name + '&background=random'"
              class="w-10 h-10 rounded-full object-cover flex-shrink-0"
              style="background: var(--hover-bg);"
              :alt="user.name"
            />
            <div class="min-w-0">
              <p class="text-[14px] font-medium truncate transition-colors duration-300"
                 style="letter-spacing: -0.2px; color: var(--text-primary);">
                {{ user.name }}
              </p>
              <p class="text-[12px] truncate transition-colors duration-300"
                 style="color: var(--text-secondary);">
                @{{ user.username }}
              </p>
            </div>
          </button>

          <!-- Friendship action buttons -->
          <div class="flex-shrink-0 pr-2">
            <FriendshipButton :targetUserId="user.id" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
