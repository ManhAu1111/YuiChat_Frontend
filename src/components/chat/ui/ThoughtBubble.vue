<script setup>
import { computed, ref } from 'vue';
import ThoughtDetailModal from './ThoughtDetailModal.vue';

const props = defineProps({
  text: {
    type: String,
    default: null
  },
  isCurrentUser: {
    type: Boolean,
    default: false
  },
  positionClass: {
    type: String,
    default: 'absolute -top-3 left-1/2 -translate-x-1/2'
  }
});

const emit = defineEmits(['click']);

const isDetailModalOpen = ref(false);

const showPlusBubble = computed(() => {
  return props.isCurrentUser && !props.text;
});


const handleClick = (e) => {
  e.stopPropagation();
  if (props.isCurrentUser) {
    emit('click', e);
  } else if (props.text) {
    isDetailModalOpen.value = true;
  }
};
</script>

<template>
  <div v-if="text || showPlusBubble" 
       @click="handleClick"
       class="z-10 flex items-center justify-center shadow-sm backdrop-blur-md transition-all duration-300 group-hover:-translate-y-1 cursor-pointer w-max"
       :class="[
          positionClass,
          showPlusBubble 
            ? 'px-1.5 py-0.5 rounded-xl bg-[var(--accent-light)] text-[7px] text-[var(--accent-color)] font-medium whitespace-nowrap' 
            : 'px-1.5 py-[2px] rounded-[10px] bg-[var(--accent-color)] text-[7.5px] text-white',
          isCurrentUser ? 'hover:scale-105' : ''
       ]"
       style="max-width: 68px;"
  >
    <div v-if="text" class="line-clamp-3 break-words text-center leading-[1.1]" style="display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; text-wrap: balance; letter-spacing: -0.2px;">
      {{ text }}
    </div>
    <template v-else-if="showPlusBubble">
      Chia sẻ suy nghĩ
    </template>
  </div>

  <ThoughtDetailModal :isOpen="isDetailModalOpen" :text="text" @close="isDetailModalOpen = false" />
</template>
