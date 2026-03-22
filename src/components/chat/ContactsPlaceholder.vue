<script setup>
const emit = defineEmits(['back']);
</script>

<template>
  <div class="relative flex-1 flex items-center justify-center h-full text-white/50">
    <button class="md:hidden absolute top-4 left-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors" @click="emit('back')">
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
    </button>
    <div class="text-center">
      <div class="flex justify-center mb-3">
        <svg fill="none" class="w-12 h-12 text-white/20" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
      </div>
      <h3 class="text-lg font-medium text-white">Danh bạ</h3>
      <p class="text-sm mt-1">Tính năng đang phát triển</p>
    </div>
  </div>
</template>
