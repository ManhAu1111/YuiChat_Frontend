<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: 'Ảnh' },
});
const emit = defineEmits(['close']);

// Đóng khi nhấn Escape
const handleKey = (e) => { if (e.key === 'Escape') emit('close'); };
onMounted(() => document.addEventListener('keydown', handleKey));
onBeforeUnmount(() => document.removeEventListener('keydown', handleKey));
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <!-- Nút đóng -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        style="background:rgba(255,255,255,0.15); color:#fff;"
        aria-label="Đóng"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Nút download -->
      <a
        :href="src"
        target="_blank"
        download
        class="absolute top-4 right-16 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        style="background:rgba(255,255,255,0.15); color:#fff;"
        aria-label="Tải xuống"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
      </a>

      <!-- Ảnh -->
      <img
        :src="src"
        :alt="alt"
        class="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl select-none"
        draggable="false"
      />
    </div>
  </Teleport>
</template>
