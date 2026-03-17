<script setup>
import { ref } from 'vue';
import ChatHeader from './ChatHeader.vue';
import ChatInput from './ChatInput.vue';

// Nhận props là ID cuộc hội thoại
const props = defineProps(['chatId']);
const emit = defineEmits(['backToChatList']);

// DỮ LIỆU MẪU (Mock Data) cho tin nhắn
const messages = ref([
  { id: 1, sender: 'other', text: 'Chào Mạnh, đồ án YuiChat tới đâu rồi?', time: '10:30' },
  { id: 2, sender: 'me', text: 'Chào bạn, mình vừa ghép xong giao diện kính mờ Stitch AI cho trang Login á, đẹp lắm!', time: '10:31' },
  { id: 3, sender: 'other', text: 'Oa xịn vậy! Thế đã kết nối được Laravel chưa?', time: '10:31' },
  { id: 4, sender: 'me', text: 'Rồi luôn, đăng nhập Google chạy vèo vèo. Giờ đang làm cái khung chat 2 cột giống Zalo nè.', time: '10:32' },
  { id: 5, sender: 'other', text: 'Tuyệt vời! Cố lên nhé 🔥', time: '10:33' },
]);
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <ChatHeader :chatId="chatId" @back-to-chat-list="emit('backToChatList')"/>

    <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-[#e5ecef]">
      <div v-for="msg in messages" :key="msg.id" 
           class="flex"
           :class="msg.sender === 'me' ? 'justify-end' : 'justify-start'">
        
        <div class="max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm relative text-sm"
             :class="msg.sender === 'me' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'">
          <p>{{ msg.text }}</p>
          <span class="text-[10px] absolute bottom-1 right-2 opacity-60">{{ msg.time }}</span>
          <div class="w-8 h-2"></div> 
        </div>

      </div>
    </div>

    <ChatInput />
  </div>
</template>

