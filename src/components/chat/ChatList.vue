<script setup>
import { onMounted, computed, ref, watch } from 'vue';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/auth';

const emit = defineEmits(['select-chat']);
const chatStore = useChatStore();
const authStore = useAuthStore();
const selectedId = ref(null);
const searchQuery = ref('');

let searchTimeout = null;

onMounted(() => {
  chatStore.fetchConversations();
});

// Watch để tìm kiếm người dùng (Debounced)
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

// Đồng bộ hóa selectedId khi activeConversationId thay đổi (Ví dụ: khi khởi tạo hội thoại mới)
watch(() => chatStore.activeConversationId, (newId) => {
  selectedId.value = newId;
});

const selectChat = (id) => {
  selectedId.value = id;
  emit('select-chat', id);
};

const handleStartConversation = async (userId) => {
  try {
    const conversation = await chatStore.startConversation(userId);
    searchQuery.value = ''; // Xóa thanh tìm kiếm
    selectChat(conversation.id); // Tự động chọn phòng chat vừa mở
  } catch (error) {
    alert("Không thể bắt đầu trò chuyện!");
  }
};

// Hàm lấy thông tin "người kia" từ danh sách participants (dành cho chat 1-1)
const getTargetUser = (conversation) => {
  if (!conversation || !conversation.participants) return null;
  if (conversation.is_group) return { name: conversation.name, avatar: conversation.avatar, is_online: false };

  // Rất quan trọng: Phải kiểm tra authStore.user đã có dữ liệu chưa
  if (!authStore.user || !authStore.user.id) return null;
  
  // Tìm người có user_id KHÁC với id của mình
  const participant = conversation.participants.find(p => p.user_id !== authStore.user.id);
  return participant ? participant.user : null;
};

// Hàm fortmat thời gian thân thiện (Chỉ làm đơn giản, sau này có thể dùng day.js)
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <div class="flex flex-col h-full relative">
    <div class="h-16 border-b border-gray-200 flex items-center px-4 space-x-2 relative z-50">
      <div class="relative flex-1">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </span>
        <input v-model="searchQuery" type="text" placeholder="Tìm kiếm người dùng..."
          class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all" />
      </div>

      <!-- Dropdown Kết quả tìm kiếm -->
      <div v-if="searchQuery && (chatStore.searchResults.length > 0 || chatStore.isSearching)"
        class="absolute top-14 left-4 right-4 bg-white shadow-2xl rounded-2xl border border-gray-100 py-3 overflow-hidden animate-slide-down">
        <div v-if="chatStore.isSearching" class="px-5 py-3 text-xs text-gray-400 flex items-center space-x-2">
          <div class="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span>Đang tìm kiếm...</span>
        </div>

        <div v-else class="max-h-64 overflow-y-auto">
          <div v-for="user in chatStore.searchResults" :key="user.id" @click="handleStartConversation(user.id)"
            class="px-5 py-3 flex items-center hover:bg-blue-50 cursor-pointer transition-colors group">
            <img :src="user.avatar || 'https://ui-avatars.com/api/?name=' + user.name"
              class="w-10 h-10 rounded-full bg-gray-100 object-cover" />
            <div class="ml-3">
              <p class="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{{ user.name }}
              </p>
              <p class="text-[10px] text-gray-400">@{{ user.username }}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        class="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-blue-600 flex-shrink-0 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="chatStore.isLoading && chatStore.conversations.length === 0" class="flex justify-center p-10">
        <div class="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <div v-else-if="chatStore.conversations.length === 0" class="text-center p-10 text-gray-400 text-sm italic">
        Chưa có cuộc trò chuyện nào.
      </div>

      <div v-for="chat in chatStore.conversations" :key="chat.id" @click="selectChat(chat.id)"
        class="flex items-center px-4 py-3 cursor-pointer border-l-4 transition-all"
        :class="selectedId === chat.id ? 'bg-blue-50/50 border-blue-600' : 'border-transparent hover:bg-gray-50'">

        <div class="relative flex-shrink-0">
          <img :src="getTargetUser(chat)?.avatar || 'https://ui-avatars.com/api/?name=' + (getTargetUser(chat)?.name || 'U')"
            alt="Avatar" class="w-12 h-12 rounded-full object-cover bg-gray-200">
          <div v-if="getTargetUser(chat)?.is_online"
            class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        <div class="ml-3 flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-800 truncate">{{ getTargetUser(chat)?.name || 'Đang tải...' }}</h3>
            <span class="text-[10px] text-gray-400 flex-shrink-0 ml-2">{{ formatTime(chat.last_message?.created_at ||
              chat.updated_at) }}</span>
          </div>
          <div class="flex items-center justify-between mt-0.5">
            <p class="text-xs text-gray-500 truncate" :class="{ 'font-medium text-gray-900': chat.unread > 0 }">
              {{ chat.last_message ? chat.last_message.content : 'Hãy bắt đầu cuộc hội thoại...' }}
            </p>
            <span v-if="chat.unread > 0"
              class="flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 ml-2 flex-shrink-0">
              {{ chat.unread > 9 ? '9+' : chat.unread }}
            </span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-down {
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>