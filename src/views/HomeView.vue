<script setup>
import TheWelcome from '../components/TheWelcome.vue'
import AnimatedBackground from '../components/AnimatedBackground.vue';
</script>

<template>
  <div class="bg-black min-h-screen relative overflow-hidden flex items-center justify-center p-6 font-sans">
    <AnimatedBackground />
    <main class="relative z-10 w-full max-w-4xl glass-card rounded-3xl p-8 text-white">
      <TheWelcome />
    </main>
  </div>
</template>
