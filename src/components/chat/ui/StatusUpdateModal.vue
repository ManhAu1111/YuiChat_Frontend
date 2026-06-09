<script setup>
import { ref, onMounted } from 'vue';
import { useStatusStore } from '../../../stores/statusStore';
import { useAuthStore } from '../../../stores/auth';
import { STATUS_ICONS } from '../../../constants/statusIcons';
import { useThemeStore } from '../../../stores/themeStore';
import ThoughtBubble from './ThoughtBubble.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);

const statusStore = useStatusStore();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const statusText = ref('');
const selectedIcon = ref(null);
const isSaving = ref(false);

onMounted(() => {
  // Initialize with current user's status if any
  const currentUserStatus = statusStore.statuses.find(u => u.id === authStore.user?.id)?.status;
  if (currentUserStatus) {
    statusText.value = currentUserStatus.content || '';
    selectedIcon.value = currentUserStatus.icon || null;
  }
});

const handleSave = async () => {
  isSaving.value = true;
  try {
    await statusStore.updateStatus(selectedIcon.value, statusText.value);
    emit('close');
  } catch (error) {
    console.error('Lỗi khi lưu trạng thái:', error);
  } finally {
    isSaving.value = false;
  }
};

const clearStatus = async () => {
  statusText.value = '';
  selectedIcon.value = null;
  await handleSave();
};
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="emit('close')"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-sm mx-4 rounded-2xl shadow-xl overflow-hidden transform transition-all"
           :style="themeStore.isDark ? 'background: #1c1c1e; border: 1px solid rgba(255,255,255,0.1);' : 'background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border: 1px solid rgba(0,0,0,0.1);'">
        
        <!-- Header -->
        <div class="px-5 py-4 flex justify-between items-center border-b"
             :style="themeStore.isDark ? 'border-color: rgba(255,255,255,0.08);' : 'border-color: rgba(0,0,0,0.08);'">
          <h2 class="text-[17px] font-semibold" :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">Cập nhật trạng thái</h2>
          <button @click="emit('close')" class="p-1.5 rounded-full transition-colors"
                  :style="themeStore.isDark ? 'background: rgba(255,255,255,0.08); color: #ffffff;' : 'background: rgba(0,0,0,0.05); color: #1d1d1f;'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-5">
          <!-- Live Preview -->
          <div class="flex flex-col items-center justify-center mb-6 min-h-[50px]">
            <ThoughtBubble 
              v-if="statusText"
              :text="statusText" 
              :isCurrentUser="false" 
              positionClass="relative"
            />
          </div>

          <!-- Text Input -->
          <div class="mb-5">
            <label class="block text-sm font-medium mb-2" :style="themeStore.isDark ? 'color: rgba(255,255,255,0.7);' : 'color: rgba(0,0,0,0.7);'">Suy nghĩ của bạn</label>
            <textarea 
              v-model="statusText" 
              maxlength="250"
              rows="3"
              placeholder="Bạn đang nghĩ gì?"
              class="w-full px-4 py-3 rounded-xl border-none outline-none transition-colors resize-none"
              :style="themeStore.isDark ? 'background: rgba(255,255,255,0.05); color: #ffffff;' : 'background: rgba(0,0,0,0.05); color: #1d1d1f;'"
              @keyup.ctrl.enter="handleSave"
            ></textarea>
          </div>

          <!-- Icon Selector -->
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" :style="themeStore.isDark ? 'color: rgba(255,255,255,0.7);' : 'color: rgba(0,0,0,0.7);'">Cảm xúc (Tùy chọn)</label>
            <div class="grid grid-cols-6 gap-2">
              <button 
                v-for="(path, code) in STATUS_ICONS" 
                :key="code"
                @click="selectedIcon = selectedIcon === code ? null : code"
                class="aspect-square rounded-full flex items-center justify-center border-2 transition-all"
                :style="selectedIcon === code 
                  ? (themeStore.isDark ? 'border-color: #0a84ff; background: rgba(10,132,255,0.2);' : 'border-color: #007aff; background: rgba(0,122,255,0.1);') 
                  : 'border-color: transparent;'"
              >
                <img :src="path" class="w-7 h-7" alt="status icon" />
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 mt-4">
            <button @click="clearStatus" class="flex-1 py-3 rounded-xl font-medium transition-colors"
                    :style="themeStore.isDark ? 'background: rgba(255,255,255,0.05); color: #ff453a;' : 'background: rgba(255,59,48,0.1); color: #ff3b30;'">
              Xóa
            </button>
            <button @click="handleSave" :disabled="isSaving" class="flex-[2] py-3 rounded-xl font-medium text-white transition-opacity flex items-center justify-center gap-2"
                    :style="'background: #007aff;'" :class="{ 'opacity-50 cursor-not-allowed': isSaving }">
              <svg v-if="isSaving" class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isSaving ? 'Đang lưu...' : 'Lưu trạng thái' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
