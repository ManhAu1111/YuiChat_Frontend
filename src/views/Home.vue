<script setup>
import ChatList from '../components/chat/ChatList.vue';
import ChatWindow from '../components/chat/ChatWindow.vue';
import { ref } from 'vue';

const selectedChatId = ref(null);

const handleSelectChat = (chatId) => {
  selectedChatId.value = chatId;
};

// Hàm xử lý khi bấm nút Quay lại trên mobile
const handleBackToList = () => {
  selectedChatId.value = null;
};
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden font-sans">
    
    <aside 
      class="w-full md:w-[350px] bg-white border-r border-gray-200 flex-col"
      :class="selectedChatId ? 'hidden md:flex' : 'flex'"
    >
      <ChatList @select-chat="handleSelectChat" />
    </aside>

    <main 
      class="flex-1 flex-col bg-[#e5ecef]"
      :class="selectedChatId ? 'flex' : 'hidden md:flex'"
    >
      <ChatWindow v-if="selectedChatId" :chatId="selectedChatId" @back="handleBackToList" />
      
      <div v-else class="h-full hidden md:flex flex-col items-center justify-center text-gray-500 bg-white">
        <div class="text-center">
            <svg class="w-24 h-24 text-gray-200 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <h2 class="text-3xl font-bold text-gray-800 tracking-tight">Chào mừng đến với YuiChat</h2>
            <p class="text-gray-500 mt-3 max-w-sm">Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân, bạn bè.</p>
        </div>
      </div>
    </main>

  </div>
</template>