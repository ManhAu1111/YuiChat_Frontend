<script setup>
defineProps({
  isOnline: {
    type: Boolean,
    default: false
  },
  dotClass: {
    type: String,
    default: 'w-2.5 h-2.5 border-[1.5px]'
  }
});
</script>

<template>
  <div v-if="isOnline"
       class="absolute rounded-full transition-colors duration-300 z-10 bg-[#32d74b]"
       :class="dotClass"
       style="border-color: var(--bg-secondary); bottom: 2px; right: 2px;">
  </div>
</template>
