<script setup>
const emit = defineEmits(['back']);
</script>

<template>
  <div class="relative flex flex-col h-full" style="background: #f5f5f7;">
    <button
      class="md:hidden absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 transition-colors"
      style="color: rgba(0,0,0,0.48);"
      @click="emit('back')"
      aria-label="Quay lại"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>

    <div class="flex flex-col items-center justify-center flex-1 text-center px-8">
      <div class="w-16 h-16 rounded-full flex items-center justify-center mb-6"
           style="background: rgba(0,0,0,0.06);">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"
             style="color: rgba(0,0,0,0.24);">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
      <h3 class="font-display font-semibold mb-2"
          style="font-size: 21px; line-height: 1.19; letter-spacing: 0.231px; color: #1d1d1f;">
        Danh bạ
      </h3>
      <p class="text-sm" style="color: rgba(0,0,0,0.4); letter-spacing: -0.224px;">
        Tính năng đang phát triển
      </p>
    </div>
  </div>
</template>
