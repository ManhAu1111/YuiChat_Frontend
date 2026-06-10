<script setup>
import { computed } from 'vue';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useThemeStore } from '../../../stores/themeStore';

const props = defineProps({
  tab: { type: Object, required: true },
  isActive: { type: Boolean, required: true }
});

const emit = defineEmits(['click']);

const notificationStore = useNotificationStore();
const themeStore = useThemeStore();

const hasNotification = computed(() => props.tab.id === 'notifications' && notificationStore.unreadCount > 0);
const unreadCountDisplay = computed(() => notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount);
</script>

<template>
  <button
    :id="`nav-tab-${tab.id}`"
    @click="emit('click')"
    class="relative flex items-center transition-all duration-300 outline-none"
    :class="[
      isActive 
        ? 'h-[52px] rounded-[26px] bg-white shadow-sm border border-black/5 dark:border-none dark:bg-white/10 flex-1 pl-1 pr-2 overflow-hidden' 
        : 'w-[52px] h-[52px] rounded-full bg-black/10 dark:bg-white/5 flex-shrink-0 justify-center hover:bg-black/15 dark:hover:bg-white/10'
    ]"
  >
    <!-- ACTIVE STATE -->
    <template v-if="isActive">
      <!-- Colored circle wrapping the icon -->
      <div class="flex-shrink-0 flex items-center justify-center w-[44px] h-[44px] rounded-full bg-[var(--accent-color)] text-white shadow-sm transform transition-transform duration-300">
        <span v-html="tab.icon" class="opacity-90"></span>
      </div>
      <!-- Text Label centered in the remaining space -->
      <div class="flex-1 flex justify-center items-center overflow-hidden">
        <span class="text-[14px] font-semibold text-[var(--text-primary)] whitespace-nowrap px-1">
          {{ tab.name }}
        </span>
      </div>
    </template>

    <!-- INACTIVE STATE -->
    <template v-else>
      <div class="flex items-center justify-center text-[var(--text-secondary)] transform transition-transform duration-300">
        <span v-html="tab.icon" class="opacity-70"></span>
      </div>
    </template>

    <!-- Notification Badge -->
    <span v-if="hasNotification"
          class="absolute rounded-full text-white font-bold flex items-center justify-center"
          style="background: #ff3b30; min-width: 18px; height: 18px; font-size: 10px; line-height: 1; top: -2px; right: -2px; padding: 0 4px; z-index: 10;"
          :style="themeStore.isDark ? 'box-shadow: 0 0 0 2px #1d1d1f;' : 'box-shadow: 0 0 0 2px #ffffff;'">
      {{ unreadCountDisplay }}
    </span>
  </button>
</template>
