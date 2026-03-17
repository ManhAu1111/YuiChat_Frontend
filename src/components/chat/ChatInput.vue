<script setup>
import { ref } from 'vue';

const messageText = ref('');

const sendMessage = () => {
  if (messageText.value.trim()) {
    console.log("Gửi tin nhắn:", messageText.value);
    // Sau này sẽ gọi API Laravel gửi tin nhắn tại đây
    messageText.value = ''; // Xóa ô nhập sau khi gửi
  }
};
</script>

<template>
  <div class="h-20 border-t border-gray-200 flex items-center px-4 flex-shrink-0 bg-white">
    <div class="flex items-center space-x-1 text-gray-400 mr-3">
        <button class="p-2.5 rounded-full hover:bg-gray-100 hover:text-blue-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
        </button>
        <button class="p-2.5 rounded-full hover:bg-gray-100 hover:text-blue-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </button>
    </div>

    <div class="flex-1 relative">
      <input type="text" 
             v-model="messageText"
             @keyup.enter="sendMessage"
             placeholder="Nhập tin nhắn..." 
             class="w-full pl-5 pr-12 py-3.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-300" />
      
      <button v-if="messageText.trim()" 
              @click="sendMessage"
              class="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 hover:text-blue-700 active:scale-95 transition-all">
        <svg class="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
      </button>
    </div>
  </div>
</template>