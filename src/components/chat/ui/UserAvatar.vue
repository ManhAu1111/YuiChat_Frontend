<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { getFileUrl } from '../../../services/api';
import { useProfileStore } from '../../../stores/profileStore';
import { useAuthStore } from '../../../stores/auth';
import OnlineDot from './OnlineDot.vue';

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  sizeClass: {
    type: String,
    default: 'w-10 h-10'
  },
  showOnline: {
    type: Boolean,
    default: true
  },
  onlineDotClass: {
    type: String,
    default: 'w-2.5 h-2.5 border-[1.5px]'
  },
  ringClass: {
    type: String,
    default: ''
  },
  disableClick: {
    type: Boolean,
    default: false
  }
});

const avatarUrl = computed(() => {
  if (props.user?.avatar) return getFileUrl(props.user.avatar);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(props.user?.name || 'U')}&background=random`;
});

const router = useRouter();
const profileStore = useProfileStore();
const authStore = useAuthStore();

const handleAvatarClick = async () => {
  if (!props.user) return;
  if (props.user.id === authStore.user?.id) {
    profileStore.clearProfile();
    router.push({ hash: '#profile' });
  } else {
    await profileStore.viewProfile(props.user.id);
    router.push({ hash: '#profile' });
  }
};
</script>

<template>
  <div class="relative flex-shrink-0" 
       :class="{ 'cursor-pointer transition-transform duration-200 hover:scale-105': !disableClick }" 
       @click.stop="!disableClick && handleAvatarClick()">
    <!-- Optional Ring Wrapper -->
    <div :class="ringClass ? `p-0.5 rounded-full ${ringClass}` : ''">
      <!-- Main Avatar Image -->
      <img
        :src="avatarUrl"
        alt="Avatar"
        class="rounded-full object-cover transition-colors duration-300"
        :class="[sizeClass, { 'border-2 border-[var(--glass-bg)]': !!ringClass }]"
        style="background: var(--hover-bg);"
      />
    </div>
    
    <!-- Online Indicator -->
    <OnlineDot v-if="showOnline && user?.id !== authStore.user?.id" :is-online="user?.is_online" :dot-class="onlineDotClass" />
    
    <!-- Slots for extra badges (e.g. Status Icon) -->
    <slot name="badge"></slot>
  </div>
</template>
