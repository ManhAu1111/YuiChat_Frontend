<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import StatusIconBadge from './StatusIconBadge.vue';
import UserAvatar from '../ui/UserAvatar.vue';
import { useProfileStore } from '../../../stores/profileStore';

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
  const text = props.user.status.content;
  return text.length > 25 ? text.substring(0, 25) + '...' : text;
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
  return props.isCurrentUser && !statusText.value && !statusIconCode.value;
});

const router = useRouter();
const profileStore = useProfileStore();

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
    
    <!-- Status Bubble -->
    <div v-if="statusText || showPlusBubble" 
         class="absolute -top-3 left-1/2 -translate-x-1/2 z-10 
                flex items-center justify-center 
                shadow-sm border border-white/10 backdrop-blur-md
                transition-all duration-300 group-hover:-translate-y-1"
         :class="[
            showPlusBubble ? 'w-6 h-6 rounded-full bg-[var(--glass-bg)] text-[var(--text-secondary)]' : 'px-3 py-1.5 rounded-2xl bg-[var(--glass-panel)] text-[13px] text-[var(--text-primary)] whitespace-nowrap'
         ]"
         style="max-width: 120px; overflow: hidden; text-overflow: ellipsis;"
    >
      <template v-if="statusText">
        {{ statusText }}
      </template>
      <template v-else-if="showPlusBubble">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      </template>
      
      <!-- Tail indicator for bubble -->
      <div v-if="statusText || showPlusBubble"
           class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 
                  bg-[var(--glass-panel)] border-b border-r border-white/10
                  transform rotate-45"></div>
      <!-- Second smaller bubble for the tail effect -->
      <div v-if="statusText || showPlusBubble"
           class="absolute -bottom-3 left-[40%] w-1.5 h-1.5 rounded-full bg-[var(--glass-panel)] opacity-80 border border-white/10"></div>
    </div>

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
               class="absolute bottom-0 right-0 w-5 h-5 bg-[var(--glass-panel)] rounded-full border border-[var(--glass-border)] flex items-center justify-center z-10 text-[var(--text-secondary)] shadow-sm">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
          </div>
        </template>
      </UserAvatar>
    </div>

    <!-- Name -->
    <span class="text-xs font-medium text-[var(--text-secondary)] truncate w-full text-center group-hover:text-[var(--text-primary)] transition-colors">
      {{ isCurrentUser ? 'Tạo tin' : firstName }}
    </span>
    
  </div>
</template>
