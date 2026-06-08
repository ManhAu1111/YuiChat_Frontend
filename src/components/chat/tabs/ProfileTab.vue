<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { useThemeStore } from '../../../stores/themeStore';
import api, { getFileUrl } from '../../../services/api';
import { STATUS_ICONS } from '../../../constants/statusIcons';
import { useStatusStore } from '../../../stores/statusStore';
import { useProfileStore } from '../../../stores/profileStore';
import FriendshipButton from '../ui/FriendshipButton.vue';
import StatusIconBadge from '../sidebar/StatusIconBadge.vue';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const statusStore = useStatusStore();
const profileStore = useProfileStore();
const emit = defineEmits(['back']);

const displayUser = computed(() => {
  return profileStore.viewingUserId && profileStore.viewedUser 
    ? profileStore.viewedUser 
    : authStore.user;
});

const isCurrentUserProfile = computed(() => {
  if (!authStore.user || !displayUser.value) return false;
  return authStore.user.id === displayUser.value.id;
});

const isEditing = ref(false);
const isSaving = ref(false);
const isUploading = ref(false);
const editForm = ref({
  name: '',
  username: '',
  avatar: ''
});

const defaultAvatars = [
  "/avatars/croodles-1780835956940.svg",
  "/avatars/croodles-1780835971172.svg",
  "/avatars/croodles-1780835976811.svg",
  "/avatars/croodles-1780835986513.svg",
  "/avatars/croodles-1780835992493.svg",
  "/avatars/croodles-1780835997773.svg",
  "/avatars/croodles-1780836003613.svg",
  "/avatars/croodles-1780836008918.svg",
  "/avatars/croodles-1780836013653.svg",
  "/avatars/croodles-1780836018838.svg",
  "/avatars/croodles-1780836025133.svg",
  "/avatars/croodles-1780836030014.svg",
  "/avatars/croodles-1780836034958.svg",
  "/avatars/croodles-1780836040590.svg",
  "/avatars/croodles-1780836045758.svg",
  "/avatars/croodles-1780836051190.svg",
  "/avatars/croodles-1780836055725.svg",
  "/avatars/croodles-1780836059702.svg",
  "/avatars/croodles-1780836064486.svg",
  "/avatars/croodles-1780836070233.svg",
  "/avatars/croodles-1780836083335.svg",
  "/avatars/croodles-1780836089374.svg",
  "/avatars/croodles-1780836094493.svg",
  "/avatars/croodles-1780836099754.svg",
  "/avatars/croodles-1780836104327.svg",
  "/avatars/croodles-1780836108559.svg",
  "/avatars/croodles-1780836112559.svg",
  "/avatars/croodles-1780836118480.svg",
  "/avatars/croodles-1780836123176.svg",
  "/avatars/croodles-1780836127552.svg",
  "/avatars/croodles-1780836135256.svg",
  "/avatars/croodles-1780836143544.svg",
  "/avatars/croodles-1780836147941.svg",
  "/avatars/croodles-1780836154504.svg",
  "/avatars/croodles-1780836158657.svg",
  "/avatars/croodles-1780836165585.svg",
  "/avatars/croodles-1780836173994.svg",
  "/avatars/croodles-1780836181106.svg",
  "/avatars/croodles-1780836189196.svg",
  "/avatars/croodles-1780836194369.svg",
  "/avatars/croodles-1780836199489.svg",
  "/avatars/croodles-1780836217963.svg"
];

const isAvatarModalOpen = ref(false);

const selectDefaultAvatar = (avatarUrl) => {
  editForm.value.avatar = avatarUrl;
  isAvatarModalOpen.value = false;
};

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser();
  resetForm();
});

const resetForm = () => {
  if (authStore.user) {
    editForm.value = {
      name: authStore.user.name || '',
      username: authStore.user.username || '',
      avatar: authStore.user.avatar || ''
    };
  }
};

const handleLogout = async () => {
  if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
    await authStore.logout();
  }
};

const toggleEdit = () => {
  if (isEditing.value) {
    resetForm();
  }
  isEditing.value = !isEditing.value;
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isUploading.value = true;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('context', 'image');

  try {
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    editForm.value.avatar = response.data.url;
  } catch (error) {
    console.error("Lỗi upload avatar:", error);
    alert('Không thể tải ảnh lên. Vui lòng thử lại.');
  } finally {
    isUploading.value = false;
  }
};

// Handle status selection
const isUpdatingStatus = ref(false);
const handleSelectStatus = async (iconCode) => {
  isUpdatingStatus.value = true;
  try {
    // If the user clicks the same icon again, we can treat it as a clear action, or just update it.
    // Let's allow clearing if it's the currently active one? The user didn't mention it, let's just update.
    await statusStore.updateStatus(iconCode, null);
    alert('Đã cập nhật trạng thái cảm xúc!');
  } catch (err) {
    alert('Có lỗi xảy ra khi cập nhật trạng thái.');
  } finally {
    isUpdatingStatus.value = false;
  }
};

const triggerFileInput = () => {
  document.getElementById('avatar-upload').click();
};


const handleSave = async () => {
  isSaving.value = true;
  try {
    await authStore.updateProfile(editForm.value);
    isEditing.value = false;
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ:", error);
    alert('Không thể cập nhật hồ sơ. Vui lòng thử lại (Username có thể đã tồn tại).');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <!-- Apple Profile: Hỗ trợ chuyển đổi nền sáng tối mượt mà -->
  <div class="relative flex flex-col h-full overflow-y-auto transition-colors duration-300"
       :style="themeStore.isDark ? 'background: #000000;' : 'background: #f5f5f7;'">

    <!-- Back (mobile) -->
    <button
      class="md:hidden absolute top-4 left-4 p-2 rounded-full transition-colors z-10"
      :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.08);' : 'color: rgba(0,0,0,0.48); background: rgba(0,0,0,0.05);'"
      @click="emit('back')"
      aria-label="Quay lại"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>

    <!-- Loading -->
    <div v-if="(!authStore.user && !profileStore.viewedUser) || profileStore.isLoading" class="flex flex-col items-center justify-center flex-1 h-full">
      <svg class="w-8 h-8 animate-spin-smooth transition-colors duration-300" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-20" cx="12" cy="12" r="10" :stroke="themeStore.isDark ? '#ffffff' : '#1d1d1f'" stroke-width="3"/>
        <path class="opacity-60" :fill="themeStore.isDark ? '#ffffff' : '#1d1d1f'" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <p class="mt-3 text-sm transition-colors duration-300"
         style="letter-spacing: -0.224px;"
         :style="themeStore.isDark ? 'color: rgba(255,255,255,0.4);' : 'color: rgba(0,0,0,0.4);'">
        Đang tải hồ sơ...
      </p>
    </div>

    <!-- Profile card -->
    <div v-else-if="displayUser" class="flex flex-col items-center px-6 pt-16 pb-10 max-w-sm mx-auto w-full">

      <!-- Header with Cancel/Save when editing -->
      <div v-if="isEditing" class="w-full flex justify-between items-center mb-6 px-2">
        <button @click="toggleEdit" class="text-[15px] font-medium" :style="themeStore.isDark ? 'color: #0a84ff;' : 'color: #007aff;'">
          Hủy
        </button>
        <button @click="handleSave" :disabled="isSaving" class="text-[15px] font-semibold disabled:opacity-50" :style="themeStore.isDark ? 'color: #0a84ff;' : 'color: #007aff;'">
          {{ isSaving ? 'Đang lưu...' : 'Xong' }}
        </button>
      </div>

      <!-- Avatar -->
      <div class="relative mb-6">
        <div class="w-24 h-24 rounded-full overflow-hidden transition-colors duration-300 relative group"
             :style="themeStore.isDark ? 'background: #272729; border: 1px solid rgba(255,255,255,0.08);' : 'background: #e9e9eb; border: 1px solid rgba(0,0,0,0.06);'">
          <img
            v-if="isEditing ? editForm.avatar : displayUser.avatar"
            :src="getFileUrl(isEditing ? editForm.avatar : displayUser.avatar)"
            class="w-full h-full object-cover transition-opacity"
            :class="{ 'opacity-50': isUploading }"
            alt="Avatar"
          />
          <div v-else class="w-full h-full flex items-center justify-center transition-opacity" :class="{ 'opacity-50': isUploading }">
            <svg class="w-10 h-10 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 :style="themeStore.isDark ? 'color: rgba(255,255,255,0.2);' : 'color: rgba(0,0,0,0.2);'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          
          <!-- Upload overlay (only in edit mode) -->
          <div v-if="isEditing" @click="isAvatarModalOpen = true" class="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          
          <input type="file" id="avatar-upload" class="hidden" accept="image/*" @change="handleAvatarUpload">
        </div>
        
        <!-- Status Icon Badge (if available) -->
        <StatusIconBadge 
          v-if="!isEditing && displayUser.status?.icon"
          :iconCode="displayUser.status.icon"
          positionClass="-top-1 -right-1"
        />

        <!-- Online dot (only in view mode) -->
        <div v-if="!isEditing && displayUser.is_online" class="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full border-2 transition-colors duration-300"
             :style="themeStore.isDark ? 'background: #32d74b; border-color: #000000;' : 'background: #32d74b; border-color: #ffffff;'"></div>
      </div>

      <!-- View Mode Details -->
      <template v-if="!isEditing">
        <h2 class="font-display font-semibold mb-1 transition-colors duration-300 text-center"
            style="font-size: 28px; line-height: 1.14; letter-spacing: 0.196px;"
            :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
          {{ displayUser.name }}
        </h2>
        <p class="text-sm mb-1 transition-colors duration-300 text-center"
           style="letter-spacing: -0.224px;"
           :style="themeStore.isDark ? 'color: rgba(255,255,255,0.48);' : 'color: rgba(0,0,0,0.48);'">
          @{{ displayUser.username }}
        </p>
        <p class="text-sm mb-10 transition-colors duration-300 text-center"
           style="letter-spacing: -0.224px;"
           :style="themeStore.isDark ? 'color: rgba(255,255,255,0.3);' : 'color: rgba(0,0,0,0.3);'">
          {{ displayUser.email }}
        </p>

        <!-- Actions -->
        <div v-if="isCurrentUserProfile" class="w-full space-y-3">
          <!-- Edit profile -->
          <button
            @click="toggleEdit"
            class="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-[10px] transition-all hover:opacity-80 active:scale-[0.98]"
            style="font-size: 15px; letter-spacing: -0.224px;"
            :style="themeStore.isDark ? 'background: #272729; color: #ffffff; border: 1px solid rgba(255,255,255,0.08);' : 'background: #1d1d1f; color: #ffffff;'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <span class="font-medium">Chỉnh sửa hồ sơ</span>
          </button>

          <!-- Logout -->
          <button
            @click="handleLogout"
            class="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-[10px] transition-colors"
            style="
              background: rgba(255,59,48,0.06);
              border: 1px solid rgba(255,59,48,0.18);
              color: #ff3b30;
              font-size: 15px;
              letter-spacing: -0.224px;
            "
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span class="font-medium">Đăng xuất</span>
          </button>
        </div>

        <!-- Friendship Actions for Other Users -->
        <div v-if="!isCurrentUserProfile" class="w-full flex justify-center mb-6">
          <FriendshipButton :targetUserId="displayUser.id" />
        </div>

        <!-- Emotion Status Selection Section -->
        <div v-if="isCurrentUserProfile" class="w-full mt-8 pt-6 border-t" :style="themeStore.isDark ? 'border-color: rgba(255,255,255,0.08);' : 'border-color: rgba(0,0,0,0.06);'">
          <h3 class="font-medium text-sm mb-4 transition-colors duration-300"
              :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'">
            Trạng thái cảm xúc (24h)
          </h3>
          
          <div class="grid grid-cols-4 gap-4">
            <button 
              v-for="(path, code) in STATUS_ICONS" 
              :key="code"
              @click="handleSelectStatus(code)"
              :disabled="isUpdatingStatus"
              class="relative w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
              :style="themeStore.isDark ? 'background: #272729; border: 1px solid rgba(255,255,255,0.08);' : 'background: #e9e9eb; border: 1px solid rgba(0,0,0,0.06);'"
            >
              <img :src="path" class="w-8 h-8 drop-shadow-md" alt="status icon" />
            </button>
          </div>
        </div>
      </template>

      <!-- Edit Mode Details -->
      <template v-else>
        <div class="w-full space-y-4">
          <div class="flex flex-col">
            <label class="text-xs font-medium mb-1.5 px-1" :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'">Tên hiển thị</label>
            <input 
              v-model="editForm.name" 
              type="text" 
              class="w-full px-4 py-3 rounded-[10px] outline-none transition-colors duration-300"
              :style="themeStore.isDark ? 'background: #272729; color: #ffffff; border: 1px solid rgba(255,255,255,0.08);' : 'background: #ffffff; color: #1d1d1f; border: 1px solid rgba(0,0,0,0.06);'"
              placeholder="Nhập tên của bạn"
            />
          </div>
          
          <div class="flex flex-col">
            <label class="text-xs font-medium mb-1.5 px-1" :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'">Tên người dùng (@username)</label>
            <input 
              v-model="editForm.username" 
              type="text" 
              class="w-full px-4 py-3 rounded-[10px] outline-none transition-colors duration-300"
              :style="themeStore.isDark ? 'background: #272729; color: #ffffff; border: 1px solid rgba(255,255,255,0.08);' : 'background: #ffffff; color: #1d1d1f; border: 1px solid rgba(0,0,0,0.06);'"
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div class="flex flex-col">
            <label class="text-xs font-medium mb-1.5 px-1" :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'">Email (Không thể thay đổi)</label>
            <input 
              :value="authStore.user.email" 
              disabled
              type="email" 
              class="w-full px-4 py-3 rounded-[10px] outline-none transition-colors duration-300 opacity-60 cursor-not-allowed"
              :style="themeStore.isDark ? 'background: #1c1c1e; color: #ffffff; border: 1px solid rgba(255,255,255,0.04);' : 'background: #f0f0f2; color: #1d1d1f; border: 1px solid rgba(0,0,0,0.03);'"
            />
          </div>
        </div>
      </template>

    </div>
  </div>

  <!-- Avatar Selection Modal -->
  <Teleport to="body">
    <div v-if="isAvatarModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300" @click.self="isAvatarModalOpen = false">
      <div class="w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden flex flex-col mx-4 max-h-[80vh]"
           :style="themeStore.isDark ? 'background: #1c1c1e; border: 1px solid rgba(255,255,255,0.08);' : 'background: #ffffff; border: 1px solid rgba(0,0,0,0.08);'">
        
        <!-- Header -->
        <div class="px-5 py-4 flex justify-between items-center border-b"
             :style="themeStore.isDark ? 'border-color: rgba(255,255,255,0.08);' : 'border-color: rgba(0,0,0,0.08);'">
          <h2 class="text-[17px] font-semibold" :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">Chọn Ảnh Đại Diện</h2>
          <button @click="isAvatarModalOpen = false" class="p-1.5 rounded-full transition-colors"
                  :style="themeStore.isDark ? 'background: rgba(255,255,255,0.08); color: #ffffff;' : 'background: rgba(0,0,0,0.05); color: #1d1d1f;'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 overflow-y-auto flex-1">
          <button @click="triggerFileInput(); isAvatarModalOpen = false" class="w-full py-3 mb-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  :style="themeStore.isDark ? 'background: #2c2c2e; color: #ffffff;' : 'background: #f5f5f7; color: #1d1d1f;'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Tải ảnh từ thiết bị
          </button>

          <h3 class="text-[15px] font-semibold mb-3" :style="themeStore.isDark ? 'color: rgba(255,255,255,0.8);' : 'color: rgba(0,0,0,0.8);'">Hoặc chọn từ thư viện:</h3>
          
          <div class="grid grid-cols-4 gap-3">
            <button v-for="avatar in defaultAvatars" :key="avatar" @click="selectDefaultAvatar(avatar)"
                    class="aspect-square rounded-full overflow-hidden border-2 transition-transform hover:scale-105"
                    :style="editForm.avatar === avatar ? (themeStore.isDark ? 'border-color: #0a84ff;' : 'border-color: #007aff;') : 'border-color: transparent;'">
              <img :src="avatar" class="w-full h-full object-cover" :style="themeStore.isDark ? 'background: #272729;' : 'background: #f5f5f7;'" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
