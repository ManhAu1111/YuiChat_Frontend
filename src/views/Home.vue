<script setup>
import ChatList from '../components/chat/sidebar/ChatList.vue';
import ChatWindow from '../components/chat/room/ChatWindow.vue';
import BottomNav from '../components/chat/navigation/BottomNav.vue';
import ContactsPlaceholder from '../components/chat/tabs/ContactsPlaceholder.vue';
import ProfilePlaceholder from '../components/chat/tabs/ProfilePlaceholder.vue';
import SettingsPlaceholder from '../components/chat/tabs/SettingsPlaceholder.vue';
import NotificationPanel from '../components/chat/notifications/NotificationPanel.vue';

import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useChatStore } from '../stores/chatStore';

const selectedChatId = ref(null);
const currentTab = ref('messages');

const authStore = useAuthStore();
const chatStore = useChatStore();

const handleSelectChat = (chatId) => {
  selectedChatId.value = chatId;
  currentTab.value = 'messages';
};

const handleBackToList = () => {
  selectedChatId.value = null;
  currentTab.value = 'messages';
};

const handleTabChange = (tabId) => {
  currentTab.value = tabId;
};

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchUser();
  }
  chatStore.fetchConversations();
});
</script>

<template>
  <div class="flex h-screen overflow-hidden font-sans transition-colors duration-300"
       style="background: var(--bg-primary); color: var(--text-primary);">

    <!-- ── Sidebar ── -->
    <aside
      class="flex flex-col h-full flex-shrink-0 transition-all duration-300"
      :class="[
        'w-full md:w-[320px]',
        (!selectedChatId && currentTab === 'messages') ? 'flex' : 'hidden md:flex'
      ]"
      style="background: var(--bg-secondary); border-right: 1px solid var(--border-color);"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center px-5 h-[68px] flex-shrink-0 transition-colors duration-300 relative z-10"
           style="background: var(--glass-bg); border-bottom: 1px solid var(--glass-border); backdrop-filter: saturate(180%) blur(20px);">
        <h1 class="font-display font-semibold transition-colors duration-300"
            style="font-size: 21px; letter-spacing: -0.4px; color: var(--text-primary);">
          YuiChat
        </h1>
      </div>

      <!-- Chat List fills remaining space -->
      <div class="flex-1 overflow-hidden flex flex-col relative z-0">
        <!-- Pass tab id to ChatList if needed, else it manages its own state -->
        <ChatList @select-chat="handleSelectChat" />
      </div>

      <!-- Bottom Navigation floats in sidebar -->
      <BottomNav :currentTab="currentTab" @change-tab="handleTabChange" />
    </aside>

    <!-- ── Main Area ── -->
    <main
      class="flex-1 flex flex-col overflow-hidden transition-colors duration-300 relative"
      :class="(selectedChatId || currentTab !== 'messages') ? 'flex' : 'hidden md:flex'"
      style="background: var(--bg-primary);"
    >
      <!-- Chat window -->
      <ChatWindow
        v-if="currentTab === 'messages' && selectedChatId"
        :key="selectedChatId"
        :chatId="selectedChatId"
        @back="handleBackToList"
      />

      <!-- Other tabs -->
      <ContactsPlaceholder    v-else-if="currentTab === 'contacts'"      @back="handleBackToList" />
      <NotificationPanel      v-else-if="currentTab === 'notifications'" @back="handleBackToList" />
      <ProfilePlaceholder     v-else-if="currentTab === 'profile'"       @back="handleBackToList" />
      <SettingsPlaceholder    v-else-if="currentTab === 'settings'"      @back="handleBackToList" />

      <!-- Empty state -->
      <div v-else class="hidden md:flex flex-col flex-1 items-center justify-center text-center p-12 transition-colors duration-300">
        <div class="mb-6 rounded-full flex items-center justify-center w-16 h-16"
             style="background: var(--hover-bg);">
          <svg class="w-8 h-8 transition-colors duration-300" fill="none" stroke="var(--text-secondary)" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 class="font-display font-medium mb-2 transition-colors duration-300"
            style="font-size: 22px; letter-spacing: -0.4px; color: var(--text-primary);">
          YuiChat
        </h2>
        <p class="max-w-[240px] transition-colors duration-300"
           style="font-size: 15px; line-height: 1.5; letter-spacing: -0.2px; color: var(--text-secondary);">
          Chọn một cuộc trò chuyện ở bên trái để bắt đầu nhắn tin.
        </p>
      </div>
    </main>

  </div>
</template>