<template>
  <div class="flex items-end gap-2 relative group justify-start mb-2">
    <!-- Avatar -->
    <div class="w-8 flex-shrink-0 flex justify-center mb-0.5">
      <img v-if="user.avatar" :src="getFileUrl(user.avatar)" class="w-8 h-8 rounded-full object-cover shadow-sm" :alt="user.name" />
      <div v-else class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style="background: var(--accent-color);">
        {{ getInitials(user.name) }}
      </div>
    </div>

    <!-- Bubble -->
    <div class="flex flex-col gap-1 items-start">
      <div class="text-[12px] ml-1 mb-0.5" style="color: var(--text-secondary);">{{ user.name }} đang soạn tin...</div>
      <div class="px-3 py-2.5 rounded-[18px] rounded-bl-[4px]" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
        <div class="flex items-center gap-1.5 h-4">
          <div class="w-1.5 h-1.5 rounded-full typing-dot" style="background: var(--text-secondary); animation-delay: 0s;"></div>
          <div class="w-1.5 h-1.5 rounded-full typing-dot" style="background: var(--text-secondary); animation-delay: 0.2s;"></div>
          <div class="w-1.5 h-1.5 rounded-full typing-dot" style="background: var(--text-secondary); animation-delay: 0.4s;"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getFileUrl } from '../../../services/api';

defineProps({
  user: {
    type: Object,
    required: true
  }
});

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};
</script>

<style scoped>
.typing-dot {
  animation: typingBounce 1.4s infinite ease-in-out both;
  opacity: 0.7;
}

@keyframes typingBounce {
  0%, 80%, 100% { 
    transform: translateY(0);
    opacity: 0.5;
  } 
  40% { 
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>
