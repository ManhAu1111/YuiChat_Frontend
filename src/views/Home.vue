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
  <!-- Apple Design: #000 base, sidebar #1d1d1f, main bg solid white/light -->
  <div class="flex h-screen bg-apple-black overflow-hidden font-sans">

    <!-- ── Sidebar ── -->
    <aside
      class="apple-sidebar flex flex-col h-full flex-shrink-0 transition-all duration-300"
      :class="[
        'w-full md:w-[320px]',
        (!selectedChatId && currentTab === 'messages') ? 'flex' : 'hidden md:flex'
      ]"
    >
      <!-- Sidebar Header — Apple nav glass style -->
      <div class="apple-nav flex items-center px-5 h-14 flex-shrink-0 border-b"
           style="border-color: rgba(255,255,255,0.07);">
        <h1 class="font-display font-semibold text-white"
            style="font-size: 21px; letter-spacing: 0.231px; line-height: 1.19;">
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
      class="flex-1 flex flex-col overflow-hidden"
      :class="(selectedChatId || currentTab !== 'messages') ? 'flex' : 'hidden md:flex'"
      style="background: #f5f5f7;"
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
           class="hidden md:flex flex-col flex-1 items-center justify-center text-center p-12"
           style="background: #f5f5f7;">
        <div class="mb-8">
          <svg class="w-20 h-20 mx-auto" fill="none" stroke="#c7c7cc" stroke-width="1.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 class="font-display font-semibold mb-3"
            style="font-size: 28px; line-height: 1.14; letter-spacing: 0.196px; color: #1d1d1f;">
          Chào mừng đến YuiChat
        </h2>
        <p class="max-w-xs"
           style="font-size: 17px; line-height: 1.47; letter-spacing: -0.374px; color: rgba(0,0,0,0.48);">
          Chọn một cuộc trò chuyện ở bên trái để bắt đầu nhắn tin.
        </p>
      </div>
    </main>

  </div>
</template>