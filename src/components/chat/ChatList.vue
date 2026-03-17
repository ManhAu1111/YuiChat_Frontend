<script setup>
import { ref } from 'vue';

// Định nghĩa sự kiện sẽ bắn ra ngoài parent (Home.vue)
const emit = defineEmits(['select-chat']);

// DỮ LIỆU MẪU (Mock Data) cho danh sách chat
const conversations = ref([
  { id: 1, name: 'Âu Mạnh', avatar: 'https://i.pravatar.cc/150?u=manh', lastMessage: 'Hôm nay làm đồ án thế nào rồi?', time: '10:35', unread: 2 },
  { id: 2, name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=vana', lastMessage: 'Gửi mình cái file API với', time: '9:15', unread: 0 },
  { id: 3, name: 'Nhóm Lập Trình Vue', avatar: 'https://i.pravatar.cc/150?u=vuegroup', lastMessage: 'Admin: Mọi người nhớ check task nhé', time: 'Hôm qua', unread: 5 },
  { id: 4, name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=thib', lastMessage: 'ok b', time: 'Hôm qua', unread: 0 },
]);

const selectedId = ref(null);

const selectChat = (id) => {
  selectedId.value = id;
  emit('select-chat', id); // Bắn sự kiện lên Home.vue
};
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="h-16 border-b border-gray-200 flex items-center px-4 space-x-2">
      <div class="relative flex-1">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </span>
        <input type="text" placeholder="Tìm kiếm bạn bè..." class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-300" />
      </div>
      <button class="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-for="chat in conversations" :key="chat.id" 
           @click="selectChat(chat.id)"
           class="flex items-center px-4 py-3 cursor-pointer border-l-4"
           :class="selectedId === chat.id ? 'bg-blue-50 border-blue-600' : 'border-transparent hover:bg-gray-50'">
        
        <div class="relative flex-shrink-0">
          <img :src="chat.avatar" alt="Avatar" class="w-12 h-12 rounded-full object-cover">
          <div v-if="chat.id === 1" class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        <div class="ml-3 flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-800 truncate">{{ chat.name }}</h3>
            <span class="text-xs text-gray-400 flex-shrink-0 ml-2">{{ chat.time }}</span>
          </div>
          <div class="flex items-center justify-between mt-0.5">
            <p class="text-sm text-gray-500 truncate">{{ chat.lastMessage }}</p>
            <span v-if="chat.unread > 0" class="flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 ml-2 flex-shrink-0">
              {{ chat.unread > 9 ? '9+' : chat.unread }}
            </span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>