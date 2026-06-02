<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFriendshipStore } from '../../../stores/friendshipStore';
import { useChatStore } from '../../../stores/chatStore';

const emit = defineEmits(['close', 'created']);
const friendshipStore = useFriendshipStore();
const chatStore = useChatStore();

const groupName = ref('');
const selectedUserIds = ref([]);
const isLoading = ref(false);

onMounted(() => {
  friendshipStore.fetchFriends();
});

const isFormValid = computed(() => {
  return selectedUserIds.value.length > 0;
});

const toggleUser = (userId) => {
  const index = selectedUserIds.value.indexOf(userId);
  if (index === -1) {
    selectedUserIds.value.push(userId);
  } else {
    selectedUserIds.value.splice(index, 1);
  }
};

const handleCreateGroup = async () => {
  if (!isFormValid.value || isLoading.value) return;
  
  isLoading.value = true;
  try {
    const conversation = await chatStore.createGroupConversation(groupName.value, selectedUserIds.value);
    emit('created', conversation.id);
    emit('close');
  } catch (error) {
    console.error('Lỗi khi tạo nhóm:', error);
    alert('Không thể tạo nhóm. Vui lòng thử lại.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300" @click.self="emit('close')">
      <div 
        class="w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden flex flex-col mx-4"
        style="background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);"
      >
        <!-- Header -->
        <div class="px-5 py-4 border-b flex justify-between items-center" style="border-color: var(--border-color);">
          <h2 class="text-[17px] font-semibold" style="letter-spacing: -0.4px;">Tạo nhóm mới</h2>
          <button @click="emit('close')" class="p-1.5 rounded-full transition-colors" style="background: var(--hover-bg); color: var(--text-primary);">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="p-5 flex-1 overflow-y-auto max-h-[60vh]">
          <!-- Group Name -->
          <div class="mb-5">
            <label class="block text-[14px] font-medium mb-1.5" style="color: var(--text-secondary);">Tên nhóm (Tuỳ chọn)</label>
            <input 
              v-model="groupName" 
              type="text" 
              placeholder="Ví dụ: Gia đình, Nhóm học tập..." 
              class="w-full px-4 py-2.5 rounded-xl border outline-none transition-all duration-300 focus:ring-1"
              style="background: var(--bg-secondary); border-color: var(--border-color); color: var(--text-primary);"
              onfocus="this.style.borderColor='var(--accent-color)'; this.style.boxShadow='0 0 0 1px var(--accent-color)';"
              onblur="this.style.borderColor='var(--border-color)'; this.style.boxShadow='none';"
            />
          </div>
          
          <!-- Friends List -->
          <div>
            <label class="block text-[14px] font-medium mb-2" style="color: var(--text-secondary);">
              Chọn thành viên ({{ selectedUserIds.length }})
            </label>
            
            <div v-if="friendshipStore.isLoadingFriends" class="space-y-1 mt-2 animate-pulse">
              <div v-for="i in 4" :key="i"
                   class="flex items-center p-2 rounded-xl">
                <!-- Checkbox skeleton -->
                <div class="w-5 h-5 rounded-full border-2 mr-3"
                     style="border-color: var(--border-color); background: var(--hover-bg);"></div>
                
                <!-- Avatar skeleton -->
                <div class="w-10 h-10 rounded-full mr-3"
                     style="background: var(--hover-bg);"></div>
                
                <!-- Info skeleton -->
                <div class="flex-1 space-y-2">
                  <div class="h-3 rounded-full" style="background: var(--hover-bg);" :class="i % 2 === 0 ? 'w-2/5' : 'w-1/3'"></div>
                  <div class="h-2 rounded-full w-1/4" style="background: var(--glass-border);"></div>
                </div>
              </div>
            </div>
            
            <div v-else-if="friendshipStore.friends.length === 0" class="text-center py-4 text-[14px]" style="color: var(--text-secondary);">
              Bạn chưa có bạn bè nào.
            </div>
            
            <div v-else class="space-y-1 mt-2">
              <div 
                v-for="friend in friendshipStore.friends" 
                :key="friend.id"
                @click="toggleUser(friend.id)"
                class="flex items-center p-2 rounded-xl cursor-pointer transition-colors"
                onmouseover="this.style.background='var(--hover-bg)'"
                onmouseout="this.style.background='transparent'"
              >
                <!-- Checkbox -->
                <div 
                  class="w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center mr-3 transition-colors"
                  :style="selectedUserIds.includes(friend.id) ? 'background: var(--accent-color); border-color: var(--accent-color);' : 'border-color: var(--text-tertiary);'"
                >
                  <svg v-if="selectedUserIds.includes(friend.id)" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                
                <!-- Avatar -->
                <img 
                  :src="friend.avatar || `https://ui-avatars.com/api/?name=${friend.name}&background=random`" 
                  class="w-10 h-10 rounded-full object-cover mr-3"
                />
                
                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-[15px] font-medium truncate" style="letter-spacing: -0.2px;">{{ friend.name }}</p>
                  <p class="text-[13px] truncate" style="color: var(--text-secondary);">@{{ friend.username }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="px-5 py-4 flex justify-end gap-3" style="background: var(--bg-secondary); border-top: 1px solid var(--border-color);">
          <button 
            @click="emit('close')"
            class="px-5 py-2.5 rounded-xl text-[15px] font-medium transition-colors"
            style="background: var(--hover-bg); color: var(--text-primary);"
          >
            Huỷ
          </button>
          <button 
            @click="handleCreateGroup"
            :disabled="!isFormValid || isLoading"
            class="px-5 py-2.5 rounded-xl text-[15px] font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style="background: var(--accent-color);"
          >
            <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            Tạo nhóm
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
