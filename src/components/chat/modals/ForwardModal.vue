<script setup>
import { ref, computed, onMounted } from 'vue';
import { useChatStore } from '../../../stores/chatStore';
import { useThemeStore } from '../../../stores/themeStore';
import { useAuthStore } from '../../../stores/auth';
import { getFileUrl } from '../../../services/api';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  messageIds: { type: Array, default: () => [] },
  attachments: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'forwarded']);

const chatStore = useChatStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const selectedConversationIds = ref([]);
const additionalText = ref('');
const isSubmitting = ref(false);

const getConversationName = (conv) => {
  if (conv.is_group) return conv.name || 'Nhóm';
  const otherParticipant = conv.participants?.find(p => p.user_id !== authStore.user?.id);
  return otherParticipant?.user?.name || 'Người dùng';
};

const getConversationAvatarUrl = (conv) => {
  if (conv.is_group) {
    if (conv.avatar) return getFileUrl(conv.avatar);
    const name = conv.name || 'Nhóm';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  }
  const otherParticipant = conv.participants?.find(p => p.user_id !== authStore.user?.id);
  if (otherParticipant?.user?.avatar) return getFileUrl(otherParticipant.user.avatar);
  const name = otherParticipant?.user?.name || 'U';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};

const filteredConversations = computed(() => {
  if (!searchQuery.value) return chatStore.conversations;
  const lowerQuery = searchQuery.value.toLowerCase();
  return chatStore.conversations.filter(c => {
    const name = getConversationName(c);
    return name.toLowerCase().includes(lowerQuery);
  });
});

const toggleSelection = (id) => {
  const index = selectedConversationIds.value.indexOf(id);
  if (index === -1) {
    selectedConversationIds.value.push(id);
  } else {
    selectedConversationIds.value.splice(index, 1);
  }
};

const handleForward = async () => {
  if (selectedConversationIds.value.length === 0) return;
  
  isSubmitting.value = true;
  try {
    const payload = {
      target_conversation_ids: selectedConversationIds.value,
      additional_text: additionalText.value || null
    };
    
    if (props.messageIds && props.messageIds.length > 0) {
      payload.message_ids = props.messageIds;
    } else if (props.attachments && props.attachments.length > 0) {
      payload.attachments = props.attachments;
    }

    await chatStore.forwardMessages(payload);
    emit('forwarded');
    closeModal();
  } catch (error) {
    console.error('Forward error:', error);
    alert('Có lỗi xảy ra khi chuyển tiếp tin nhắn.');
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  selectedConversationIds.value = [];
  additionalText.value = '';
  searchQuery.value = '';
  emit('close');
};

</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300" @click.self="closeModal">
      <div class="w-full max-w-md rounded-[24px] shadow-2xl flex flex-col mx-4 max-h-[85vh] overflow-hidden"
           :style="themeStore.isDark ? 'background: #1c1c1e; border: 1px solid rgba(255,255,255,0.08);' : 'background: #ffffff; border: 1px solid rgba(0,0,0,0.08);'">
        
        <!-- Header -->
        <div class="px-5 py-4 flex justify-between items-center border-b"
             :style="themeStore.isDark ? 'border-color: rgba(255,255,255,0.08);' : 'border-color: rgba(0,0,0,0.08);'">
          <h2 class="text-[17px] font-semibold" :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">Chuyển tiếp tin nhắn</h2>
          <button @click="closeModal" class="p-1.5 rounded-full transition-colors"
                  :style="themeStore.isDark ? 'background: rgba(255,255,255,0.08); color: #ffffff;' : 'background: rgba(0,0,0,0.05); color: #1d1d1f;'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-4 flex flex-col overflow-hidden h-full">
          <!-- Search -->
          <div class="mb-4">
            <div class="relative">
              <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input v-model="searchQuery" type="text" placeholder="Tìm kiếm người nhận..." class="w-full pl-10 pr-4 py-2.5 rounded-[10px] text-[15px] outline-none transition-colors"
                     :style="themeStore.isDark ? 'background: rgba(255,255,255,0.08); color: #ffffff;' : 'background: rgba(0,0,0,0.05); color: #1d1d1f;'">
            </div>
          </div>

          <!-- List -->
          <div class="flex-1 overflow-y-auto min-h-[200px] mb-4 pr-1">
            <div v-for="conv in filteredConversations" :key="conv.id" 
                 class="flex items-center justify-between p-2 rounded-[12px] cursor-pointer mb-1 transition-colors"
                 :style="themeStore.isDark ? 'hover:background: rgba(255,255,255,0.05);' : 'hover:background: rgba(0,0,0,0.02);'"
                 @click="toggleSelection(conv.id)">
              <div class="flex items-center gap-3">
                <img :src="getConversationAvatarUrl(conv)" class="w-10 h-10 rounded-full object-cover">
                <span class="text-[15px] font-medium" :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">{{ getConversationName(conv) }}</span>
              </div>
              <div class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
                   :class="selectedConversationIds.includes(conv.id) ? 'bg-blue-500 border-blue-500' : (themeStore.isDark ? 'border-gray-600' : 'border-gray-300')">
                <svg v-if="selectedConversationIds.includes(conv.id)" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
            </div>
          </div>

          <!-- Message Note -->
          <div class="mb-4">
             <input v-model="additionalText" type="text" placeholder="Thêm tin nhắn (tuỳ chọn)..." class="w-full px-4 py-3 rounded-[12px] text-[15px] outline-none transition-colors border"
                    :style="themeStore.isDark ? 'background: #2c2c2e; color: #ffffff; border-color: transparent;' : 'background: #f5f5f7; color: #1d1d1f; border-color: rgba(0,0,0,0.05);'">
          </div>

          <!-- Footer button -->
          <button @click="handleForward" :disabled="selectedConversationIds.length === 0 || isSubmitting"
                  class="w-full py-3 rounded-[12px] font-semibold text-[15px] transition-all flex items-center justify-center gap-2"
                  :class="selectedConversationIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'"
                  style="background: #007aff; color: white;">
            <svg v-if="isSubmitting" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span v-else>Gửi đi ({{ selectedConversationIds.length }})</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
