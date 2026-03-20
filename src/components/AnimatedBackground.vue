<template>
  <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none" data-purpose="animated-background">
      <div class="absolute top-[10%] left-[15%] w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-float"></div>
      <div class="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-float-delayed"></div>
      <div class="absolute top-[40%] right-[25%] w-64 h-64 bg-pink-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-float-slow"></div>
      <div class="absolute bottom-[10%] left-[30%] w-80 h-80 bg-cyan-400 rounded-full mix-blend-screen filter blur-[90px] opacity-30 animate-float"></div>
  </div>
</template>
