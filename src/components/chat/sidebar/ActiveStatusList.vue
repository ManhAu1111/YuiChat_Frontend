<script setup>
import { onMounted, computed } from 'vue';
import { useStatusStore } from '../../../stores/statusStore';
import { useAuthStore } from '../../../stores/auth';
import ActiveStatusItem from './ActiveStatusItem.vue';

const statusStore = useStatusStore();
const authStore = useAuthStore();

onMounted(() => {
  statusStore.fetchStatuses();
});

const currentUser = computed(() => {
  if (!authStore.user) return null;
  // Try to find the current user's status in the list, otherwise just return the user object
  const found = statusStore.statuses.find(u => u.id === authStore.user.id);
  return found || { ...authStore.user, status: null };
});

const friends = computed(() => {
  if (!authStore.user) return [];
  // Exclude current user from the friends list
  return statusStore.statuses.filter(u => u.id !== authStore.user.id);
});
</script>

<template>
  <div class="w-full py-3 px-1 border-b border-[var(--glass-border)]">
    <!-- Horizontal scroll container -->
    <div class="flex items-end overflow-x-auto overflow-y-hidden scrollbar-hide snap-x"
         style="scrollbar-width: none; -ms-overflow-style: none;">
      
      <!-- Current User / Add Note -->
      <ActiveStatusItem 
        v-if="currentUser"
        :user="currentUser" 
        :isCurrentUser="true"
        class="snap-start"
      />
      
      <!-- Friends -->
      <ActiveStatusItem 
        v-for="friend in friends" 
        :key="friend.id" 
        :user="friend"
        class="snap-start"
      />

      <!-- Loading state placeholder -->
      <div v-if="statusStore.isLoading && friends.length === 0" class="flex">
        <div v-for="i in 4" :key="i" class="flex flex-col items-center px-2 min-w-[72px] animate-pulse mt-5">
          <div class="w-14 h-14 rounded-full bg-[var(--hover-bg)] mb-1"></div>
          <div class="h-2 w-8 rounded-full bg-[var(--hover-bg)]"></div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
</style>
