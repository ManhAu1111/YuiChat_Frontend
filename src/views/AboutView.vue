<script setup>
import AnimatedBackground from '../components/AnimatedBackground.vue';
</script>

<template>
  <div class="bg-black min-h-screen relative overflow-hidden flex items-center justify-center p-6 font-sans">
    <AnimatedBackground />
    <div class="relative z-10 w-full max-w-4xl glass-card rounded-3xl p-8 text-center text-white">
      <h1 class="text-3xl font-bold mb-4">This is an about page</h1>
    </div>
  </div>
</template>
