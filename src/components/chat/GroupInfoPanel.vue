<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useChatStore } from '../../stores/chatStore';
import { useThemeStore } from '../../stores/themeStore';

const props = defineProps(['conversation']);
const emit = defineEmits(['close']);

const authStore = useAuthStore();
const chatStore = useChatStore();
const themeStore = useThemeStore();

const isRemoving = ref(false);
const isEditing = ref(false);
const editName = ref('');
const avatarFile = ref(null);
const avatarPreview = ref(null);
const fileInput = ref(null);
const isUpdating = ref(false);

const currentUserRole = computed(() => {
  const participant = props.conversation?.participants.find(p => p.user_id === authStore.user?.id);
  return participant?.role || 'member';
});

const isAdmin = computed(() => currentUserRole.value === 'admin');

const getMembers = computed(() => {
  if (!props.conversation) return [];
  // Sort so admin is first, then by name
  return [...props.conversation.participants].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return a.user.name.localeCompare(b.user.name);
  });
});

const handleRemoveMember = async (userId) => {
  if (!confirm('Bạn có chắc chắn muốn xoá thành viên này khỏi nhóm?')) return;
  isRemoving.value = true;
  try {
    await chatStore.removeGroupMember(props.conversation.id, userId);
  } catch (error) {
    alert('Không thể xoá thành viên. Vui lòng thử lại.');
  } finally {
    isRemoving.value = false;
  }
};

const handleLeaveGroup = async () => {
  if (!confirm('Bạn có chắc chắn muốn rời nhóm?')) return;
  try {
    await chatStore.removeGroupMember(props.conversation.id, authStore.user.id);
    emit('close');
    chatStore.activeConversationId = null; // Close chat window
  } catch (error) {
    alert('Không thể rời nhóm.');
  }
};

const startEditing = () => {
  editName.value = props.conversation.name;
  avatarFile.value = null;
  avatarPreview.value = null;
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
};

const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  avatarFile.value = file;
  const reader = new FileReader();
  reader.onload = ev => avatarPreview.value = ev.target.result;
  reader.readAsDataURL(file);
};

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click();
};

const handleUpdateGroup = async () => {
  if (!editName.value.trim() && !avatarFile.value) return;
  isUpdating.value = true;
  try {
    await chatStore.updateGroupInfo(props.conversation.id, editName.value, avatarFile.value);
    isEditing.value = false;
  } catch (error) {
    alert('Không thể cập nhật thông tin nhóm.');
  } finally {
    isUpdating.value = false;
  }
};
</script>

<template>
  <div class="w-80 border-l flex flex-col h-full overflow-hidden transition-colors duration-300 flex-shrink-0"
       :style="themeStore.isDark ? 'background: #1c1c1e; border-color: rgba(255,255,255,0.08);' : 'background: #ffffff; border-color: rgba(0,0,0,0.08);'">
    
    <!-- Header -->
    <div class="h-16 flex items-center justify-between px-5 border-b flex-shrink-0 transition-colors duration-300"
         :style="themeStore.isDark ? 'border-color: rgba(255,255,255,0.08);' : 'border-color: rgba(0,0,0,0.08);'">
      <h3 class="font-semibold" :style="themeStore.isDark ? 'color: #fff;' : 'color: #1d1d1f;'">Thông tin nhóm</h3>
      <button @click="emit('close')" class="p-1.5 rounded-full hover:bg-gray-500/20 transition-colors" :style="themeStore.isDark ? 'color: #fff;' : 'color: #1d1d1f;'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto">
      
      <!-- Group Basic Info -->
      <div class="flex flex-col items-center py-6 px-4 border-b" :style="themeStore.isDark ? 'border-color: rgba(255,255,255,0.08);' : 'border-color: rgba(0,0,0,0.08);'">
        <div v-if="!isEditing" class="flex flex-col items-center w-full">
          <div class="relative mb-3">
            <img 
              :src="conversation.avatar || `https://ui-avatars.com/api/?name=${conversation.name}&background=random`" 
              class="w-20 h-20 rounded-full object-cover shadow-sm"
            />
          </div>
          <h2 class="text-lg font-bold text-center leading-tight mb-1" :style="themeStore.isDark ? 'color: #fff;' : 'color: #1d1d1f;'">
            {{ conversation.name }}
          </h2>
          <p class="text-sm opacity-60 mb-3" :style="themeStore.isDark ? 'color: #a1a1aa;' : 'color: #52525b;'">
            {{ getMembers.length }} thành viên
          </p>
          <button v-if="isAdmin" @click="startEditing" class="px-4 py-1.5 rounded-full text-xs font-medium transition-colors" :style="themeStore.isDark ? 'background: rgba(255,255,255,0.1); color: #fff;' : 'background: rgba(0,0,0,0.05); color: #1d1d1f;'">
            Chỉnh sửa nhóm
          </button>
        </div>

        <div v-else class="flex flex-col items-center w-full">
          <div class="relative mb-4 cursor-pointer group" @click="triggerFileInput">
            <img 
              :src="avatarPreview || conversation.avatar || `https://ui-avatars.com/api/?name=${conversation.name}&background=random`" 
              class="w-20 h-20 rounded-full object-cover shadow-sm transition-opacity group-hover:opacity-70"
            />
            <div class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <input type="file" ref="fileInput" @change="handleAvatarChange" accept="image/*" class="hidden" />
          </div>
          
          <input 
            v-model="editName" 
            type="text" 
            class="w-full text-center px-3 py-2 rounded-lg border outline-none text-sm mb-3 transition-colors"
            :style="themeStore.isDark ? 'background: #2c2c2e; border-color: #3f3f46; color: #fff;' : 'background: #f4f4f5; border-color: #e4e4e7; color: #1d1d1f;'"
            placeholder="Tên nhóm"
          />
          
          <div class="flex gap-2 w-full justify-center">
            <button @click="cancelEditing" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" :style="themeStore.isDark ? 'background: #3f3f46; color: #fff;' : 'background: #e4e4e7; color: #1d1d1f;'">
              Huỷ
            </button>
            <button @click="handleUpdateGroup" :disabled="isUpdating" class="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors bg-blue-500 disabled:opacity-50">
              {{ isUpdating ? 'Đang lưu...' : 'Lưu' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Members List -->
      <div class="py-4">
        <h4 class="px-5 text-xs font-semibold uppercase tracking-wider mb-3 opacity-50" :style="themeStore.isDark ? 'color: #a1a1aa;' : 'color: #52525b;'">Thành viên</h4>
        
        <div class="space-y-1 px-3">
          <div 
            v-for="participant in getMembers" 
            :key="participant.id"
            class="flex items-center justify-between p-2 rounded-xl transition-colors"
            :class="themeStore.isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'"
          >
            <div class="flex items-center gap-3 min-w-0">
              <img 
                :src="participant.user.avatar || `https://ui-avatars.com/api/?name=${participant.user.name}&background=random`" 
                class="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
              <div class="min-w-0">
                <p class="text-sm font-medium truncate flex items-center gap-2" :style="themeStore.isDark ? 'color: #fff;' : 'color: #1d1d1f;'">
                  {{ participant.user.id === authStore.user?.id ? 'Bạn' : participant.user.name }}
                  <span v-if="participant.role === 'admin'" class="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Admin</span>
                </p>
                <p class="text-[11px] truncate opacity-60" :style="themeStore.isDark ? 'color: #a1a1aa;' : 'color: #52525b;'">@{{ participant.user.username }}</p>
              </div>
            </div>
            
            <button 
              v-if="isAdmin && participant.user.id !== authStore.user?.id" 
              @click="handleRemoveMember(participant.user.id)"
              class="p-1.5 text-red-500 rounded-md hover:bg-red-500/10 transition-colors flex-shrink-0 ml-2"
              title="Xoá thành viên"
              :disabled="isRemoving"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Footer Actions -->
    <div class="p-4 border-t" :style="themeStore.isDark ? 'border-color: rgba(255,255,255,0.08);' : 'border-color: rgba(0,0,0,0.08);'">
      <button 
        @click="handleLeaveGroup"
        class="w-full py-2.5 rounded-xl text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        Rời khỏi nhóm
      </button>
    </div>

  </div>
</template>
