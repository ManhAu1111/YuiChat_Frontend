<script setup>
import ChatList from '../components/chat/ChatList.vue';
import ChatWindow from '../components/chat/ChatWindow.vue';
import BottomNav from '../components/chat/BottomNav.vue';
import ContactsPlaceholder from '../components/chat/ContactsPlaceholder.vue';
import ProfilePlaceholder from '../components/chat/ProfilePlaceholder.vue';
import SettingsPlaceholder from '../components/chat/SettingsPlaceholder.vue';
import AnimatedBackground from '../components/AnimatedBackground.vue';
import { ref } from 'vue';

const selectedChatId = ref(null);
const currentTab = ref('messages');

const handleSelectChat = (chatId) => {
  selectedChatId.value = chatId;
};

// Hàm xử lý khi bấm nút Quay lại trên mobile
const handleBackToList = () => {
  selectedChatId.value = null;
};

const handleTabChange = (tabId) => {
  currentTab.value = tabId;
};
</script>

<template>
  <div class="flex h-screen bg-black overflow-hidden font-sans relative">
    <AnimatedBackground />
    
    <aside 
      class="w-full md:w-[350px] glass-card border-r border-white/20 flex flex-col h-full relative z-10"
      :class="selectedChatId ? 'hidden md:flex' : 'flex'"
    >
      <div class="flex-1 overflow-hidden flex flex-col text-white">
        <ChatList v-if="currentTab === 'messages'" @select-chat="handleSelectChat" />
        <ContactsPlaceholder v-else-if="currentTab === 'contacts'" />
        <ProfilePlaceholder v-else-if="currentTab === 'profile'" />
        <SettingsPlaceholder v-else-if="currentTab === 'settings'" />
      </div>

      <BottomNav :currentTab="currentTab" @change-tab="handleTabChange" />
    </aside>

    <main 
      class="flex-1 flex-col glass-card relative z-10"
      :class="selectedChatId ? 'flex' : 'hidden md:flex'"
    >
      <ChatWindow v-if="selectedChatId" :chatId="selectedChatId" @back="handleBackToList" />
      
      <div v-else class="h-full hidden md:flex flex-col items-center justify-center text-white/50 bg-black/20">
        <div class="text-center">
            <svg class="w-24 h-24 text-white/20 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <h2 class="text-3xl font-bold text-white tracking-tight">Chào mừng đến với YuiChat</h2>
            <p class="text-white/60 mt-3 max-w-sm">Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân, bạn bè.</p>
        </div>
      </div>
    </main>

  </div>
</template>