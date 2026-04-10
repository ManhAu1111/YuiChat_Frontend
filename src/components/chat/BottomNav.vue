<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  currentTab: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['change-tab']);

// 1. Trạng thái đóng mở
const isExpanded = ref(true);
let collapseTimer = null;

const tabs = [
  { id: 'messages', name: 'Tin nhắn', icon: '<svg fill="none" class="w-6 h-6" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>' },
  { id: 'contacts', name: 'Danh bạ', icon: '<svg fill="none" class="w-6 h-6" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>' },
  { id: 'notifications', name: 'Thông báo', icon: '<svg fill="none" class="w-6 h-6" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>' },
  { id: 'profile', name: 'Tôi', icon: '<svg fill="none" class="w-6 h-6" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>' },
  { id: 'settings', name: 'Cài đặt', icon: '<svg fill="none" class="w-6 h-6" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>' },
];

const startInactivityTimer = () => {
  clearTimeout(collapseTimer);
  if (isExpanded.value) {
    collapseTimer = setTimeout(() => {
      isExpanded.value = false;
    }, 3000);
  }
};

const changeTab = (tabId) => {
  emit('change-tab', tabId);
  startInactivityTimer();
};

const expandNav = () => {
  isExpanded.value = true;
  startInactivityTimer();
};

onMounted(() => {
  startInactivityTimer();
});

onUnmounted(() => {
  clearTimeout(collapseTimer);
});
</script>

<template>
  <div class="fixed bottom-0 right-[24px] mb-[24px] z-50 flex justify-end transition-all duration-500 ease-in-out"
       :class="isExpanded ? 'w-[calc(100%-48px)] max-w-md' : 'w-[60px]'">
    
    <div v-if="isExpanded" 
         class="w-full h-[68px] p-1.5 flex items-center justify-between bg-white/70 backdrop-blur-2xl border border-white/40 shadow-xl rounded-full overflow-hidden animate-in fade-in zoom-in duration-300">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="flex flex-col items-center justify-center flex-1 h-full rounded-full transition-all duration-300 space-y-0.5"
        :class="currentTab === tab.id ? 'text-blue-500 bg-black/5' : 'text-gray-400 hover:text-gray-600'"
        @click="changeTab(tab.id)"
      >
        <div class="relative mt-0.5">
          <span v-html="tab.icon" class="flex items-center justify-center transition-transform duration-300" :class="currentTab === tab.id ? 'scale-110' : ''"></span>
          <div v-if="tab.id === 'notifications'" class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></div>
        </div>
        <span class="text-[10px] font-medium" :class="currentTab === tab.id ? 'font-semibold' : ''">{{ tab.name }}</span>
      </button>
    </div>

    <button v-else 
            @click="expandNav"
            class="w-[60px] h-[60px] flex items-center justify-center bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-full text-gray-600 hover:text-blue-500 transition-all duration-300 hover:scale-110 active:scale-95 animate-in fade-in zoom-in duration-300">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: forwards;
}

@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.zoom-in {
  animation: zoom-in 0.3s ease-out;
}
</style>