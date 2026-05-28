<script setup>
import { computed } from 'vue';
import { useThemeStore } from '../../../stores/themeStore';

const props = defineProps({
  file: { type: Object, required: true },
  // { previewUrl, name, size, type, isUploading, progress }
});
const emit = defineEmits(['remove']);

const themeStore = useThemeStore();
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
    class="flex items-center gap-2 px-3 py-2 mx-4 mb-2 rounded-xl border transition-colors"
    :style="themeStore.isDark
      ? 'background:#2a2a2d; border-color:rgba(255,255,255,0.1);'
      : 'background:#f0f0f2; border-color:rgba(0,0,0,0.1);'"
  >
    <!-- Preview ảnh -->
    <img v-if="isImage && file.previewUrl"
      :src="file.previewUrl"
      class="w-10 h-10 rounded-lg object-cover flex-shrink-0"
      alt="preview"
    />

    <!-- Icon file -->
    <div v-else
      class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
      :style="themeStore.isDark ? 'background:rgba(255,255,255,0.08);' : 'background:rgba(0,0,0,0.06);'"
    >
      📄
    </div>

    <!-- Tên + dung lượng -->
    <div class="flex-1 min-w-0">
      <p class="text-xs font-medium truncate"
        :style="themeStore.isDark ? 'color:#fff;' : 'color:#1d1d1f;'"
      >{{ file.name }}</p>
      <p class="text-[10px] opacity-50"
        :style="themeStore.isDark ? 'color:#fff;' : 'color:#1d1d1f;'"
      >{{ formattedSize }}</p>

      <!-- Progress bar khi đang upload -->
      <div v-if="file.isUploading" class="mt-1 h-1 rounded-full overflow-hidden"
        :style="themeStore.isDark ? 'background:rgba(255,255,255,0.1);' : 'background:rgba(0,0,0,0.1);'"
      >
        <div class="h-full rounded-full transition-all duration-300" style="background:#0071e3;"
          :style="{ width: (file.progress || 0) + '%' }"
        />
      </div>
    </div>

    <!-- Nút xóa -->
    <button
      v-if="!file.isUploading"
      @click="emit('remove')"
      class="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
      :style="themeStore.isDark
        ? 'color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.08);'
        : 'color:rgba(0,0,0,0.4); background:rgba(0,0,0,0.06);'"
      aria-label="Xóa file"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>
</template>
