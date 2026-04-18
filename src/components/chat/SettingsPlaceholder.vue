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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
      <h3 class="font-display font-semibold mb-2"
          style="font-size: 21px; line-height: 1.19; letter-spacing: 0.231px; color: #1d1d1f;">
        Cài đặt
      </h3>
      <p class="text-sm" style="color: rgba(0,0,0,0.4); letter-spacing: -0.224px;">
        Tính năng đang phát triển
      </p>
    </div>
  </div>
</template>
