<script setup>
import { computed } from 'vue';
import { STATUS_ICONS } from '../../../constants/statusIcons';

const props = defineProps({
  iconCode: {
    type: String,
    required: true,
  },
  positionClass: {
    type: String,
    default: '-top-1 -right-1',
  }
});

const statusIconPath = computed(() => {
  return STATUS_ICONS[props.iconCode] || null;
});
</script>

<template>
  <div v-if="statusIconPath" 
       class="absolute flex items-center justify-center z-10 drop-shadow-sm"
       :class="positionClass">
    <img :src="statusIconPath" class="w-5 h-5" alt="status icon" />
  </div>
</template>
