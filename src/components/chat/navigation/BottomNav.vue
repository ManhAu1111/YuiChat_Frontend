<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useThemeStore } from '../../../stores/themeStore';

const props = defineProps({
  currentTab: { type: String, required: true }
});

const emit = defineEmits(['change-tab']);
const notificationStore = useNotificationStore();
const themeStore = useThemeStore();

const tabs = [
  {
    id: 'messages',
    name: 'Tin nhắn',
    icon: `<svg fill="none" class="w-5 h-5" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>`,
  },
  {
    id: 'contacts',
    name: 'Danh bạ',
    icon: `<svg fill="none" class="w-5 h-5" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
  },
  {
    id: 'notifications',
    name: 'Thông báo',
    icon: `<svg fill="none" class="w-5 h-5" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>`,
  },
  {
    id: 'profile',
    name: 'Tôi',
    icon: `<svg fill="none" class="w-5 h-5" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`,
  },
  {
    id: 'settings',
    name: 'Cài đặt',
    icon: `<svg fill="none" class="w-5 h-5" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
  },
];

const changeTab = (tabId) => {
  emit('change-tab', tabId);
};
</script>

<template>
  <!--
    Apple Design Navigation hỗ trợ chuyển đổi Sáng/Tối
  -->
  <nav class="flex-shrink-0 px-3 py-3 transition-colors duration-300"
       :style="themeStore.isDark ? 'border-top: 1px solid rgba(255,255,255,0.07);' : 'border-top: 1px solid rgba(0,0,0,0.08);'">
    <div class="flex items-center justify-between">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :id="`nav-tab-${tab.id}`"
        @click="changeTab(tab.id)"
        class="flex flex-col items-center justify-center flex-1 gap-1 py-2 px-1 rounded-[10px] transition-all duration-200 relative"
        :style="currentTab === tab.id
          ? 'background: rgba(0,113,227,0.15);'
          : 'background: transparent;'"
      >
        <!-- Icon -->
        <span
          v-html="tab.icon"
          class="transition-colors duration-200"
          :style="currentTab === tab.id
            ? 'color: #0071e3;'
            : (themeStore.isDark ? 'color: rgba(255,255,255,0.35);' : 'color: rgba(0,0,0,0.48);')"
        ></span>

        <!-- Label -->
        <span
          class="text-[9px] font-medium transition-colors duration-200 leading-none"
          :style="currentTab === tab.id
            ? 'color: #0071e3;'
            : (themeStore.isDark ? 'color: rgba(255,255,255,0.35);' : 'color: rgba(0,0,0,0.48);')"
        >
          {{ tab.name }}
        </span>

        <!-- Notification badge on Notifications tab -->
        <span v-if="tab.id === 'notifications' && notificationStore.unreadCount > 0"
              class="absolute rounded-full text-white font-bold flex items-center justify-center transition-shadow duration-300"
              style="background: #ff3b30; min-width: 16px; height: 16px; font-size: 9px; line-height: 1; top: 2px; right: 6px; padding: 0 4px; z-index: 10;"
              :style="themeStore.isDark ? 'box-shadow: 0 0 0 2px #1d1d1f;' : 'box-shadow: 0 0 0 2px #ffffff;'">
          {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
        </span>
      </button>
    </div>
  </nav>
</template>