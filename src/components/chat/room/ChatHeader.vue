<script setup>
import { useThemeStore } from '../../../stores/themeStore';

const props = defineProps(['chatId', 'user']);
const emit = defineEmits(['back', 'open-info']);
const themeStore = useThemeStore();

const formatOfflineTime = (dateStr) => {
  if (!dateStr) return 'Ngoại tuyến';
  const lastActive = new Date(dateStr);
  const now = new Date();
  const diffMs = now - lastActive;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Vừa truy cập';
  if (diffMins < 60) return `Hoạt động ${diffMins} phút trước`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hoạt động ${diffHours} giờ trước`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hoạt động ${diffDays} ngày trước`;
  
  return `Hoạt động từ ${lastActive.toLocaleDateString()}`;
};
</script>

<template>
  <div class="h-[68px] flex items-center justify-between px-5 flex-shrink-0 transition-colors duration-300 relative z-10"
       style="background: var(--glass-bg); border-bottom: 1px solid var(--glass-border); backdrop-filter: saturate(180%) blur(20px);">

    <!-- Left: back + user info -->
    <div class="flex items-center gap-3">
      <!-- Back (mobile only) -->
      <button
        @click="emit('back')"
        class="md:hidden -ml-1 p-1.5 rounded-full transition-colors"
        style="color: var(--text-primary);"
        aria-label="Quay lại"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <!-- Avatar -->
      <div class="relative flex-shrink-0">
        <img
          :src="user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') + '&background=random'"
          alt="Avatar"
          class="w-10 h-10 rounded-full object-cover transition-colors duration-300"
          style="background: var(--hover-bg);"
        />
        <div v-if="user?.is_online"
             class="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] transition-colors duration-300"
             style="background: #32d74b; border-color: var(--glass-bg);"></div>
      </div>

      <!-- Name + status -->
      <div class="flex flex-col justify-center">
        <h2 class="font-semibold leading-tight transition-colors duration-300"
            style="font-size: 16px; letter-spacing: -0.3px; color: var(--text-primary);">
          {{ user?.name || 'Đang tải...' }}
        </h2>
        <p v-if="!user?.is_group" class="text-[12px] mt-0.5 transition-colors duration-300" style="letter-spacing: -0.1px;"
           :style="user?.is_online ? 'color: #32d74b;' : 'color: var(--text-secondary);'">
          {{ user?.is_online ? 'Đang hoạt động' : formatOfflineTime(user?.last_active_at) }}
        </p>
      </div>
    </div>

    <!-- Right: action icons -->
    <div class="flex items-center gap-1">
      <button
        class="p-2 rounded-full transition-colors"
        style="color: var(--text-secondary);"
        onmouseover="this.style.background='var(--hover-bg)'"
        onmouseout="this.style.background='transparent'"
        aria-label="Tìm kiếm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </button>

      <button
        class="p-2 rounded-full transition-colors"
        style="color: var(--text-secondary);"
        onmouseover="this.style.background='var(--hover-bg)'"
        onmouseout="this.style.background='transparent'"
        aria-label="Gọi điện"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
      </button>

      <button
        class="p-2 rounded-full transition-colors"
        style="color: var(--text-secondary);"
        onmouseover="this.style.background='var(--hover-bg)'"
        onmouseout="this.style.background='transparent'"
        aria-label="Video call"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                d="M15 10l4.553 2.276A1 1 0 0120 13.118v3.764a1 1 0 01-.447.894L15 20M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
      </button>

      <!-- Group Info Button -->
      <button
        v-if="user?.is_group"
        @click="emit('open-info')"
        class="p-2 rounded-full transition-colors"
        style="color: var(--text-secondary);"
        onmouseover="this.style.background='var(--hover-bg)'"
        onmouseout="this.style.background='transparent'"
        aria-label="Thông tin nhóm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </button>
    </div>
  </div>
</template>