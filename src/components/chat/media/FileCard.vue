<script setup>
import { useThemeStore } from '../../../stores/themeStore';

const props = defineProps({
  attachment: { type: Object, required: true },
  // { file_url, file_name, file_type, file_size }
});
const emit = defineEmits(['download']);
const themeStore = useThemeStore();

const formattedSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileExtension = (name) => name?.split('.').pop()?.toUpperCase() || 'FILE';
</script>

<template>
  <a
    :href="attachment.file_url"
    target="_blank"
    rel="noopener"
    download
    class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors no-underline group"
    :style="themeStore.isDark
      ? 'background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08);'
      : 'background:rgba(0,0,0,0.04); border:1px solid rgba(0,0,0,0.08);'"
  >
    <!-- File type badge -->
    <div class="w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
      style="background:#0071e3;"
    >
      <span class="text-white text-[9px] font-bold leading-tight">
        {{ fileExtension(attachment.file_name) }}
      </span>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <p class="text-xs font-medium truncate"
        :style="themeStore.isDark ? 'color:#fff;' : 'color:#1d1d1f;'"
      >{{ attachment.file_name || 'Tệp đính kèm' }}</p>
      <p class="text-[10px] opacity-50"
        :style="themeStore.isDark ? 'color:#fff;' : 'color:#1d1d1f;'"
      >{{ formattedSize(attachment.file_size) }}</p>
    </div>

    <!-- Download icon -->
    <svg class="w-4 h-4 flex-shrink-0 opacity-40 group-hover:opacity-70 transition-opacity"
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
      :style="themeStore.isDark ? 'color:#fff;' : 'color:#1d1d1f;'"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
    </svg>
  </a>
</template>
