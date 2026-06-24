<script setup>
import { computed } from 'vue';

const props = defineProps({
  attachment: { type: Object, required: true },
  // { file_url, file_name, file_type, file_size }
});
const emit = defineEmits(['download', 'forward']);

const handleForward = () => {
  emit('forward', props.attachment);
};

const handleDownload = () => {
  if (fileUrl.value && fileUrl.value !== '#') {
    const link = document.createElement('a');
    link.href = fileUrl.value;
    link.download = props.attachment.file_name || 'download';
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const formattedSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileExtension = (name) => name?.split('.').pop()?.toUpperCase() || 'FILE';

const fileUrl = computed(() => {
  const url = props.attachment?.file_url;
  if (!url) return '#';
  if (url.includes('/storage/')) {
    const path = url.substring(url.indexOf('/storage/'));
    let apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (apiUrl && apiUrl.includes('localhost')) {
      apiUrl = apiUrl.replace('localhost', window.location.hostname);
    }
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}${path}`;
  }
  return url;
});
</script>

<template>
  <div
    class="flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-colors group relative cursor-pointer"
    style="background: var(--hover-bg); border: 1px solid var(--glass-border);"
    onmouseover="this.style.background='var(--glass-bg)'"
    onmouseout="this.style.background='var(--hover-bg)'"
    @click="handleDownload"
  >
    <!-- File type badge -->
    <div class="w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
      style="background: var(--accent-color);"
    >
      <span class="text-white text-[9px] font-bold leading-tight">
        {{ fileExtension(attachment.file_name) }}
      </span>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <p class="text-[13px] font-medium break-all leading-tight mb-0.5"
        style="color: var(--text-primary);"
      >{{ attachment.file_name || 'Tệp đính kèm' }}</p>
      <p class="text-[10px]"
        style="color: var(--text-secondary);"
      >{{ formattedSize(attachment.file_size) }}</p>
    </div>

    <div class="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style="color: var(--text-primary);">
      <!-- Forward icon -->
      <button @click.stop="handleForward" class="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded" title="Chuyển tiếp">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
        </svg>
      </button>
      
      <!-- Download icon -->
      <div class="p-1" title="Tải xuống">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
      </div>
    </div>
  </div>
</template>
