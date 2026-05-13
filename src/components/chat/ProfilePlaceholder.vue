<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useThemeStore } from '../../stores/themeStore';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const emit = defineEmits(['back']);

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser();
});

const handleLogout = async () => {
  if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
    await authStore.logout();
  }
};
</script>

<template>
  <!--
    Apple Profile: Hỗ trợ chuyển đổi nền sáng tối mượt mà
  -->
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
    <div v-if="!authStore.user" class="flex flex-col items-center justify-center flex-1 h-full">
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
    <div v-else class="flex flex-col items-center px-6 pt-16 pb-10 max-w-sm mx-auto w-full">

      <!-- Avatar -->
      <div class="relative mb-6">
        <div class="w-24 h-24 rounded-full overflow-hidden transition-colors duration-300"
             :style="themeStore.isDark ? 'background: #272729; border: 1px solid rgba(255,255,255,0.08);' : 'background: #e9e9eb; border: 1px solid rgba(0,0,0,0.06);'">
          <img
            v-if="authStore.user.avatar"
            :src="authStore.user.avatar"
            class="w-full h-full object-cover"
            alt="Avatar"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="w-10 h-10 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 :style="themeStore.isDark ? 'color: rgba(255,255,255,0.2);' : 'color: rgba(0,0,0,0.2);'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
        </div>
        <!-- Online dot -->
        <div class="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full border-2 transition-colors duration-300"
             :style="themeStore.isDark ? 'background: #32d74b; border-color: #000000;' : 'background: #32d74b; border-color: #ffffff;'"></div>
      </div>

      <!-- Name -->
      <h2 class="font-display font-semibold mb-1 transition-colors duration-300"
          style="font-size: 28px; line-height: 1.14; letter-spacing: 0.196px;"
          :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
        {{ authStore.user.name }}
      </h2>
      <p class="text-sm mb-1 transition-colors duration-300"
         style="letter-spacing: -0.224px;"
         :style="themeStore.isDark ? 'color: rgba(255,255,255,0.48);' : 'color: rgba(0,0,0,0.48);'">
        @{{ authStore.user.username }}
      </p>
      <p class="text-sm mb-10 transition-colors duration-300"
         style="letter-spacing: -0.224px;"
         :style="themeStore.isDark ? 'color: rgba(255,255,255,0.3);' : 'color: rgba(0,0,0,0.3);'">
        {{ authStore.user.email }}
      </p>

      <!-- Actions -->
      <div class="w-full space-y-3">
        <!-- Edit profile — Đổi màu theo nền -->
        <button
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

        <!-- Logout — subtle destructive -->
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
    </div>
  </div>
</template>
