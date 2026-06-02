<script setup>
import { computed } from 'vue';

const props = defineProps({
  file: { type: Object, required: true },
  // { previewUrl, name, size, type, isUploading, progress }
});
const emit = defineEmits(['remove']);

const isImage = computed(() => props.file.type?.startsWith('image/'));
const formattedSize = computed(() => {
  const s = props.file.size || 0;
  if (s < 1024) return `${s} B`;
  if (s < 1024 * 1024) return `${(s / 1024).toFixed(1)} KB`;
  return `${(s / (1024 * 1024)).toFixed(1)} MB`;
});
</script>

<template>
  <div
    class="flex items-center gap-3 px-3 py-2 rounded-2xl border transition-colors duration-300 relative overflow-hidden flex-shrink-0 w-[240px]"
    style="background: var(--hover-bg); border-color: var(--glass-border);"
  >
    <!-- Preview ảnh -->
    <img v-if="isImage && file.previewUrl"
      :src="file.previewUrl"
      class="w-12 h-12 rounded-xl object-cover flex-shrink-0"
      alt="preview"
    />

    <!-- Icon file -->
    <div v-else
      class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
      style="background: var(--bg-secondary);"
    >
      📄
    </div>

    <!-- Tên + dung lượng -->
    <div class="flex-1 min-w-0 pr-8">
      <p class="text-[14px] font-medium truncate transition-colors duration-300"
         style="letter-spacing: -0.2px; color: var(--text-primary);"
      >{{ file.name }}</p>
      <p class="text-[12px] opacity-60 transition-colors duration-300"
        style="color: var(--text-secondary);"
      >{{ formattedSize }}</p>

      <!-- Progress bar khi đang upload -->
      <div v-if="file.isUploading" class="mt-1.5 h-1.5 rounded-full overflow-hidden"
        style="background: var(--border-color);"
      >
        <div class="h-full rounded-full transition-all duration-300" style="background: var(--accent-color);"
          :style="{ width: (file.progress || 0) + '%' }"
        />
      </div>
    </div>

    <!-- Nút xóa -->
    <button
      v-if="!file.isUploading"
      @click="emit('remove')"
      class="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
      style="color: var(--text-secondary); background: var(--bg-secondary);"
      onmouseover="this.style.background='var(--hover-bg)'"
      onmouseout="this.style.background='var(--bg-secondary)'"
      aria-label="Xóa file"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>
</template>
