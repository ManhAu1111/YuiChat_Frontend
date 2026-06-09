<script setup>
import { useThemeStore } from '../../../stores/themeStore';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  text: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);
const themeStore = useThemeStore();
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')"></div>
        
        <!-- Modal Content -->
        <div class="relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 text-center break-words"
             :style="themeStore.isDark ? 'background: rgba(30,30,32,0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1);' : 'background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border: 1px solid rgba(0,0,0,0.1);'">
          
          <!-- Close Button -->
          <button @click="emit('close')" class="absolute top-4 right-4 p-1.5 rounded-full transition-colors"
                  :style="themeStore.isDark ? 'background: rgba(255,255,255,0.1); color: #ffffff;' : 'background: rgba(0,0,0,0.05); color: #1d1d1f;'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <!-- Cloud Icon/Decoration -->
          <div class="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full"
               :style="themeStore.isDark ? 'background: rgba(255,255,255,0.1);' : 'background: rgba(0,0,0,0.05);'">
            <svg class="w-6 h-6" :style="themeStore.isDark ? 'color: rgba(255,255,255,0.8);' : 'color: rgba(0,0,0,0.6);'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          </div>

          <!-- Text Content -->
          <p class="text-[17px] leading-relaxed font-medium"
             :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
            {{ text }}
          </p>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
