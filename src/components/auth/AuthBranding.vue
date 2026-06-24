<template>
  <div class="hidden md:flex md:w-[45%] lg:w-[50%] relative bg-gradient-to-br from-[#1d1d1f] to-black flex-col justify-between p-12 border-r border-white/10">
    <!-- Background subtle pattern -->
    <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(white 1px, transparent 1px); background-size: 24px 24px;"></div>
    
    <div class="relative z-10">
      <!-- Logo -->
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h1 class="text-5xl lg:text-6xl font-display font-semibold text-white mb-6 leading-[1.1] tracking-tight">
        Kết nối<br/>theo cách của bạn.
      </h1>
      <p class="text-lg text-white/50 max-w-md font-light leading-relaxed">
        Trải nghiệm nhắn tin mượt mà, nhanh chóng và bảo mật với YuiChat. Nền tảng được thiết kế với sự tinh tế và tối giản.
      </p>
    </div>

    <!-- Decorative bottom elements -->
    <div class="relative z-10">
      <div class="flex -space-x-3 items-center">
        <div class="w-10 h-10 rounded-full border-2 border-[#151516] bg-indigo-500 shadow-lg"></div>
        <div class="w-10 h-10 rounded-full border-2 border-[#151516] bg-purple-500 shadow-lg"></div>
        <div class="w-10 h-10 rounded-full border-2 border-[#151516] bg-pink-500 shadow-lg"></div>
        <div class="w-10 h-10 rounded-full border-2 border-[#151516] bg-white/10 backdrop-blur-md flex items-center justify-center text-[10px] font-medium text-white shadow-lg">+2k</div>
        <span class="ml-5 text-sm text-white/40 font-medium">Người dùng trực tuyến</span>
      </div>
    </div>
  </div>
</template>
