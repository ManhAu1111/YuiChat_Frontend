<script setup>
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
const isIOS = ref(false)
const deferredPrompt = ref(null)

onMounted(() => {
  // Check if already running in standalone mode (installed)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
    || window.navigator.standalone 
    || document.referrer.includes('android-app://')

  if (isStandalone) {
    return
  }

  // Check if user previously dismissed the prompt
  const isDismissed = localStorage.getItem('pwa-prompt-dismissed')
  if (isDismissed === 'true') {
    return
  }

  // Detect iOS
  const userAgent = window.navigator.userAgent.toLowerCase()
  isIOS.value = /iphone|ipad|ipod/.test(userAgent)

  if (isIOS.value) {
    // iOS doesn't support beforeinstallprompt, so we show a custom guide banner
    showPrompt.value = true
  } else {
    // Listen for the native beforeinstallprompt event on Android/Chrome/Edge
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later.
      deferredPrompt.value = e
      // Update UI to show the install button
      showPrompt.value = true
    })
  }
})

const installPWA = async () => {
  if (!deferredPrompt.value) return
  
  // Show the native install prompt
  deferredPrompt.value.prompt()
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.value.userChoice
  console.log(`User response to the install prompt: ${outcome}`)
  
  // We've used the prompt, and can't use it again, discard it
  deferredPrompt.value = null
  showPrompt.value = false
}

const dismissPrompt = () => {
  showPrompt.value = false
  // Save dismissed status to localStorage for 7 days
  localStorage.setItem('pwa-prompt-dismissed', 'true')
}
</script>

<template>
  <transition name="slide-up">
    <div 
      v-if="showPrompt" 
      class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white dark:bg-apple-s3 text-apple-text-dark dark:text-white p-4 rounded-apple-card shadow-apple-card border border-gray-100 dark:border-apple-s1 z-50 flex items-center justify-between gap-4"
    >
      <!-- App Icon & Info -->
      <div class="flex items-center gap-3">
        <img 
          src="/pwa-192x192.png" 
          alt="YuiChat Logo" 
          class="w-12 h-12 rounded-apple-card object-cover shadow-apple-sm flex-shrink-0"
        />
        <div class="flex flex-col">
          <span class="font-semibold text-[15px] leading-tight">YuiChat</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-tight">
            {{ isIOS ? 'Thêm YuiChat vào màn hình chính' : 'Tải ứng dụng để nhắn tin nhanh hơn' }}
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <!-- Install Button for Android/Desktop -->
        <button 
          v-if="!isIOS"
          @click="installPWA" 
          class="bg-apple-blue hover:bg-apple-blue-link text-white text-[13px] font-medium px-4 py-2 rounded-apple-btn transition-colors shadow-apple-sm"
        >
          Cài đặt
        </button>

        <!-- Instructions Tooltip for iOS -->
        <div v-else class="group relative">
          <button 
            class="bg-apple-blue text-white text-[13px] font-medium px-4 py-2 rounded-apple-btn"
          >
            Tải về
          </button>
          <!-- Tooltip guide -->
          <div class="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 leading-relaxed">
            <div class="font-semibold mb-1">Cài đặt trên iPhone/iPad:</div>
            Nhấp vào biểu tượng <span class="font-bold">Chia sẻ</span> (Share <svg class="inline-block w-4 h-4 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>) ở Safari, sau đó chọn <span class="font-bold">"Thêm vào MH chính"</span> (Add to Home Screen).
            <div class="absolute top-full right-6 w-3 h-3 bg-gray-900 transform rotate-45 -mt-1.5"></div>
          </div>
        </div>

        <!-- Dismiss Button -->
        <button 
          @click="dismissPrompt" 
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 transition-colors"
          aria-label="Đóng"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
