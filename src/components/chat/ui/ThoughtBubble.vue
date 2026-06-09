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
       class="z-10 flex items-center justify-center shadow-sm border border-white/10 backdrop-blur-md transition-all duration-300 group-hover:-translate-y-1 cursor-pointer w-max"
       :class="[
          positionClass,
          showPlusBubble ? 'px-2 py-1.5 rounded-2xl bg-[var(--glass-panel)] text-[8px] text-[var(--text-secondary)] whitespace-nowrap' : 'px-1.5 py-1 rounded-xl bg-[var(--glass-panel)] text-[8px] text-[var(--text-primary)]',
          isCurrentUser ? 'hover:bg-[var(--hover-bg)]' : ''
       ]"
       style="max-width: 85px;"
  >
    <div v-if="text" class="line-clamp-3 break-words text-center leading-[1.3]" style="display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; text-wrap: balance;">
      {{ text }}
    </div>
    <template v-else-if="showPlusBubble">
      Chia sẻ suy nghĩ
    </template>
  </div>

  <ThoughtDetailModal :isOpen="isDetailModalOpen" :text="text" @close="isDetailModalOpen = false" />
</template>
