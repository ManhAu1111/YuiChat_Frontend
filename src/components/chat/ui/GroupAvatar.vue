<script setup>
import { computed } from 'vue';
import { getFileUrl } from '../../../services/api';

const props = defineProps({
  chat: {
    type: Object,
    required: true
  },
  sizeClass: {
    type: String,
    default: 'w-10 h-10'
  }
});

const avatarUrl = computed(() => {
  if (props.chat?.avatar) return getFileUrl(props.chat.avatar);
  // Default to a group initials avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(props.chat?.name || 'Group')}&background=random`;
});
</script>

<template>
  <div class="relative flex-shrink-0">
    <img
      :src="avatarUrl"
      alt="Group Avatar"
      class="rounded-full object-cover transition-colors duration-300"
      :class="sizeClass"
      style="background: var(--hover-bg);"
    />
    <!-- Group icon badge -->
    <div class="absolute bottom-0 right-0 w-4 h-4 bg-[var(--glass-bg)] rounded-full flex items-center justify-center border border-[var(--glass-border)] text-[var(--text-secondary)] shadow-sm">
      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    </div>
  </div>
</template>
