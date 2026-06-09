<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import StatusIconBadge from './StatusIconBadge.vue';
import UserAvatar from '../ui/UserAvatar.vue';
import StatusUpdateModal from '../ui/StatusUpdateModal.vue';
import ThoughtBubble from '../ui/ThoughtBubble.vue';
import { useProfileStore } from '../../../stores/profileStore';
import { ref } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  isCurrentUser: {
    type: Boolean,
    default: false,
  }
});

// Extract first name for display
const firstName = computed(() => {
  const parts = props.user.name.split(' ');
  return parts[parts.length - 1];
});

const statusText = computed(() => {
  if (!props.user.status || !props.user.status.content) return null;
  return props.user.status.content;
});

const statusIconCode = computed(() => {
  return props.user.status?.icon || null;
});

// For styling the icon position
const iconPositionClass = computed(() => {
  if (statusText.value && statusIconCode.value) {
    // 3 o'clock position (right side)
    return 'top-1/2 -translate-y-1/2 -right-2';
  }
  // 1:30 position (top right corner)
  return '-top-1 -right-1';
});

const showPlusBubble = computed(() => {
  return props.isCurrentUser && !statusText.value;
});

const router = useRouter();
const profileStore = useProfileStore();

const isStatusModalOpen = ref(false);

const handleBubbleClick = (e) => {
  if (props.isCurrentUser) {
    e.stopPropagation();
    isStatusModalOpen.value = true;
  }
};

const handleClick = async () => {
  if (props.isCurrentUser) {
    // If it's current user, just open their own profile
    profileStore.clearProfile();
    router.push({ hash: '#profile' });
  } else {
    // If it's another user, view their profile
    await profileStore.viewProfile(props.user.id);
    router.push({ hash: '#profile' });
  }
};
</script>

<template>
  <div @click="handleClick" class="relative flex flex-col items-center flex-shrink-0 cursor-pointer group px-2 min-w-[72px]">
    
    <ThoughtBubble 
      :text="statusText" 
      :isCurrentUser="isCurrentUser" 
      positionClass="absolute top-1 -translate-y-1/2 left-1/2 -translate-x-1/2"
      @click="handleBubbleClick"
    />

    <!-- Avatar Container -->
    <div class="relative mt-5 mb-1 transition-transform duration-300 group-hover:scale-105">
      <UserAvatar
        :user="user"
        sizeClass="w-14 h-14"
        onlineDotClass="w-3.5 h-3.5 border-2"
        :ringClass="user.status ? 'bg-gradient-to-tr from-[var(--primary)] to-purple-500' : 'bg-transparent'"
      >
        <template #badge>
          <!-- Status Icon SVG (1:30 or 3:00) -->
          <StatusIconBadge 
            v-if="statusIconCode"
            :iconCode="statusIconCode"
            :positionClass="iconPositionClass"
          />

          <!-- Plus Button for Current User (Alternative to bubble +) -->
          <div v-if="showPlusBubble" 
               @click="handleBubbleClick"
               class="absolute bottom-0 right-0 w-5 h-5 bg-[var(--glass-panel)] rounded-full border border-[var(--glass-border)] flex items-center justify-center z-10 text-[var(--text-secondary)] shadow-sm cursor-pointer hover:scale-110 transition-transform">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
          </div>
        </template>
      </UserAvatar>
    </div>

    <!-- Name -->
    <span class="text-[12px] font-medium text-[var(--text-secondary)] text-center max-w-full truncate px-1">
      {{ isCurrentUser ? 'Bạn' : firstName }}
    </span>

    <StatusUpdateModal :isOpen="isStatusModalOpen" @close="isStatusModalOpen = false" />
  </div>
</template>
