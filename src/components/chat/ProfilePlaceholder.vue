<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
const authStore = useAuthStore();
const emit = defineEmits(['back']);

onMounted(async () => {
  // Đồng bộ lại thông tin user từ server để tránh lỗi refresh làm mất state
  if (!authStore.user) {
    await authStore.fetchUser();
  }
});

const handleLogout = async () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
        await authStore.logout();
    }
};
</script>

<template>
  <div class="relative flex-1 flex flex-col items-center justify-center h-full p-6 text-white">
    <button class="md:hidden absolute top-4 left-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors" @click="emit('back')">
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
    </button>
    <div v-if="authStore.user" class="glass-card w-full max-w-sm p-8 rounded-3xl text-center space-y-6">
      <div class="relative inline-block">
        <div class="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-white/20 flex items-center justify-center overflow-hidden mx-auto shadow-xl">
          <img v-if="authStore.user.avatar" :src="authStore.user.avatar" class="w-full h-full object-cover" />
          <svg v-else fill="none" class="w-12 h-12 text-white/40" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <div class="absolute bottom-0 right-1 w-6 h-6 bg-green-500 border-4 border-black/50 rounded-full"></div>
      </div>
      
      <div class="space-y-1">
        <h3 class="text-2xl font-bold tracking-tight">{{ authStore.user.name }}</h3>
        <p class="text-white/40 text-xs">@{{ authStore.user.username }}</p>
        <p class="text-white/50 text-sm italic">{{ authStore.user.email }}</p>
      </div>

      <div class="pt-6 border-t border-white/10 grid grid-cols-1 gap-3">
        <button class="w-full py-3 px-4 rounded-xl glass-input hover:bg-white/10 transition-colors text-sm font-semibold flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            <span>Chỉnh sửa hồ sơ</span>
        </button>
        <button @click="handleLogout" class="w-full py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all text-sm font-semibold flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span>Đăng xuất</span>
        </button>
      </div>
    </div>
    
    <div v-else class="text-center space-y-4">
        <div class="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-white/40 text-sm">Đang tải hồ sơ...</p>
    </div>
  </div>
</template>
