<script setup>
import ChatList from '../components/chat/ChatList.vue';
import ChatWindow from '../components/chat/ChatWindow.vue';
import BottomNav from '../components/chat/BottomNav.vue';
import ContactsPlaceholder from '../components/chat/ContactsPlaceholder.vue';
import ProfilePlaceholder from '../components/chat/ProfilePlaceholder.vue';
import SettingsPlaceholder from '../components/chat/SettingsPlaceholder.vue';
import NotificationPanel from '../components/chat/NotificationPanel.vue';

import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useChatStore } from '../stores/chatStore';
import { useThemeStore } from '../stores/themeStore';

const selectedChatId = ref(null);
const currentTab = ref('messages');

const authStore = useAuthStore();
const chatStore = useChatStore();
const themeStore = useThemeStore();

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
  <!-- Apple Design: Hỗ trợ chuyển đổi Sáng/Tối mượt mà -->
  <div class="flex h-screen overflow-hidden font-sans transition-colors duration-300"
       :style="themeStore.isDark ? 'background: #000000;' : 'background: #ffffff;'">

    <!-- ── Sidebar ── -->
    <aside
      class="flex flex-col h-full flex-shrink-0 transition-all duration-300"
      :class="[
        'w-full md:w-[320px]',
        (!selectedChatId && currentTab === 'messages') ? 'flex' : 'hidden md:flex',
        themeStore.isDark ? 'dark-surface' : ''
      ]"
      :style="themeStore.isDark
        ? 'background: #1d1d1f; border-right: 1px solid rgba(255,255,255,0.08);'
        : 'background: #f5f5f7; border-right: 1px solid rgba(0,0,0,0.08);'"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center px-5 h-14 flex-shrink-0 border-b transition-colors duration-300"
           :style="themeStore.isDark
             ? 'background: rgba(0,0,0,0.82); border-color: rgba(255,255,255,0.07); backdrop-filter: saturate(180%) blur(20px);'
             : 'background: rgba(245,245,247,0.82); border-color: rgba(0,0,0,0.08); backdrop-filter: saturate(180%) blur(20px);'">
        <h1 class="font-display font-semibold transition-colors duration-300"
            style="font-size: 21px; letter-spacing: 0.231px; line-height: 1.19;"
            :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
          YuiChat
        </h1>
      </div>

      <!-- Chat List fills remaining space -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <ChatList @select-chat="handleSelectChat" />
      </div>

      <!-- Bottom Navigation floats in sidebar -->
      <BottomNav :currentTab="currentTab" @change-tab="handleTabChange" />
    </aside>

    <!-- ── Main Area ── -->
    <main
      class="flex-1 flex flex-col overflow-hidden transition-colors duration-300"
      :class="(selectedChatId || currentTab !== 'messages') ? 'flex' : 'hidden md:flex'"
      :style="themeStore.isDark ? 'background: #000000;' : 'background: #f5f5f7;'"
    >
      <!-- Chat window -->
      <ChatWindow
        v-if="currentTab === 'messages' && selectedChatId"
        :chatId="selectedChatId"
        @back="handleBackToList"
      />

      <!-- Other tabs -->
      <ContactsPlaceholder    v-else-if="currentTab === 'contacts'"      @back="handleBackToList" />
      <NotificationPanel      v-else-if="currentTab === 'notifications'" @back="handleBackToList" />
      <ProfilePlaceholder     v-else-if="currentTab === 'profile'"       @back="handleBackToList" />
      <SettingsPlaceholder    v-else-if="currentTab === 'settings'"      @back="handleBackToList" />

      <!-- Empty state — Apple style: centered, monochrome -->
      <div v-else
           class="hidden md:flex flex-col flex-1 items-center justify-center text-center p-12 transition-colors duration-300"
           :style="themeStore.isDark ? 'background: #000000;' : 'background: #f5f5f7;'">
        <div class="mb-8">
          <svg class="w-20 h-20 mx-auto transition-colors duration-300" fill="none" :stroke="themeStore.isDark ? 'rgba(255,255,255,0.2)' : '#c7c7cc'" stroke-width="1.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 class="font-display font-semibold mb-3 transition-colors duration-300"
            style="font-size: 28px; line-height: 1.14; letter-spacing: 0.196px;"
            :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
          Chào mừng đến YuiChat
        </h2>
        <p class="max-w-xs transition-colors duration-300"
           style="font-size: 17px; line-height: 1.47; letter-spacing: -0.374px;"
           :style="themeStore.isDark ? 'color: rgba(255,255,255,0.48);' : 'color: rgba(0,0,0,0.48);'">
          Chọn một cuộc trò chuyện ở bên trái để bắt đầu nhắn tin.
        </p>
      </div>
    </main>

  </div>
</template>