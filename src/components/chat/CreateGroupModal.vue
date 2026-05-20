<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFriendshipStore } from '../../stores/friendshipStore';
import { useChatStore } from '../../stores/chatStore';
import { useThemeStore } from '../../stores/themeStore';

const emit = defineEmits(['close', 'created']);
const friendshipStore = useFriendshipStore();
const chatStore = useChatStore();
const themeStore = useThemeStore();

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
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300" @click.self="emit('close')">
    <div 
      class="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      :style="themeStore.isDark ? 'background: #1c1c1e; border: 1px solid rgba(255,255,255,0.1);' : 'background: #ffffff; border: 1px solid rgba(0,0,0,0.1);'"
    >
      <!-- Header -->
      <div class="px-5 py-4 border-b flex justify-between items-center" :style="themeStore.isDark ? 'border-color: rgba(255,255,255,0.1);' : 'border-color: rgba(0,0,0,0.1);'">
        <h2 class="text-lg font-semibold" :style="themeStore.isDark ? 'color: #fff;' : 'color: #1d1d1f;'">Tạo nhóm mới</h2>
        <button @click="emit('close')" class="p-1.5 rounded-full hover:bg-gray-500/20 transition-colors" :style="themeStore.isDark ? 'color: #fff;' : 'color: #1d1d1f;'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <!-- Body -->
      <div class="p-5 flex-1 overflow-y-auto max-h-[60vh]">
        <!-- Group Name -->
        <div class="mb-5">
          <label class="block text-sm font-medium mb-1.5" :style="themeStore.isDark ? 'color: #a1a1aa;' : 'color: #52525b;'">Tên nhóm (Tuỳ chọn)</label>
          <input 
            v-model="groupName" 
            type="text" 
            placeholder="Ví dụ: Gia đình, Nhóm học tập..." 
            class="w-full px-4 py-2.5 rounded-xl border outline-none transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            :style="themeStore.isDark ? 'background: #2c2c2e; border-color: #3f3f46; color: #fff;' : 'background: #f4f4f5; border-color: #e4e4e7; color: #1d1d1f;'"
          />
        </div>
        
        <!-- Friends List -->
        <div>
          <label class="block text-sm font-medium mb-2" :style="themeStore.isDark ? 'color: #a1a1aa;' : 'color: #52525b;'">
            Chọn thành viên ({{ selectedUserIds.length }})
          </label>
          
          <div v-if="friendshipStore.isLoadingFriends" class="space-y-1 mt-2 animate-pulse">
            <div v-for="i in 4" :key="i"
                 class="flex items-center p-2 rounded-xl">
              <!-- Checkbox skeleton -->
              <div class="w-5 h-5 rounded-full border-2 mr-3"
                   :class="themeStore.isDark ? 'border-zinc-800 bg-white/5' : 'border-gray-200 bg-black/5'"></div>
              
              <!-- Avatar skeleton -->
              <div class="w-10 h-10 rounded-full mr-3"
                   :class="themeStore.isDark ? 'bg-white/10' : 'bg-black/10'"></div>
              
              <!-- Info skeleton -->
              <div class="flex-1 space-y-2">
                <div class="h-3 rounded-full"
                     :class="[
                       themeStore.isDark ? 'bg-white/10' : 'bg-black/10',
                       i % 2 === 0 ? 'w-2/5' : 'w-1/3'
                     ]"></div>
                <div class="h-2 rounded-full w-1/4"
                     :class="themeStore.isDark ? 'bg-white/5' : 'bg-black/5'"></div>
              </div>
            </div>
          </div>
          
          <div v-else-if="friendshipStore.friends.length === 0" class="text-center py-4 text-sm" :style="themeStore.isDark ? 'color: #a1a1aa;' : 'color: #52525b;'">
            Bạn chưa có bạn bè nào.
          </div>
          
          <div v-else class="space-y-1 mt-2">
            <div 
              v-for="friend in friendshipStore.friends" 
              :key="friend.id"
              @click="toggleUser(friend.id)"
              class="flex items-center p-2 rounded-xl cursor-pointer transition-colors"
              :class="themeStore.isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'"
            >
              <!-- Checkbox -->
              <div 
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors"
                :class="selectedUserIds.includes(friend.id) ? 'bg-blue-500 border-blue-500' : (themeStore.isDark ? 'border-gray-600' : 'border-gray-300')"
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
                <p class="text-sm font-medium truncate" :style="themeStore.isDark ? 'color: #fff;' : 'color: #1d1d1f;'">{{ friend.name }}</p>
                <p class="text-xs truncate opacity-60" :style="themeStore.isDark ? 'color: #a1a1aa;' : 'color: #52525b;'">@{{ friend.username }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="px-5 py-4 border-t flex justify-end gap-3" :style="themeStore.isDark ? 'border-color: rgba(255,255,255,0.1);' : 'border-color: rgba(0,0,0,0.1);'">
        <button 
          @click="emit('close')"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          :style="themeStore.isDark ? 'background: #3f3f46; color: #fff;' : 'background: #e4e4e7; color: #1d1d1f;'"
        >
          Huỷ
        </button>
        <button 
          @click="handleCreateGroup"
          :disabled="!isFormValid || isLoading"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style="background: #0071e3;"
        >
          <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          Tạo nhóm
        </button>
      </div>
    </div>
  </div>
</template>
