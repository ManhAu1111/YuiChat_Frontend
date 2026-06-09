<script setup>
import { onMounted, computed, ref } from 'vue';
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

const scrollContainer = ref(null);

const handleWheel = (e) => {
  if (scrollContainer.value) {
    // Nếu chỉ cuộn dọc (chuột) thì chuyển thành cuộn ngang
    if (e.deltaY !== 0 && Math.abs(e.deltaX) < 10) {
      e.preventDefault();
      scrollContainer.value.scrollLeft += e.deltaY;
    }
  }
};

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('wheel', handleWheel, { passive: false });
  }
});
</script>

<template>
  <div class="w-full py-3 px-1 border-b border-[var(--glass-border)]">
    <!-- Horizontal scroll container -->
    <div ref="scrollContainer" class="flex items-end overflow-x-auto overflow-y-hidden snap-x hide-scrollbar pb-2">
      
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
/* Thanh trượt ngang tinh tế */
.custom-scrollbar::-webkit-scrollbar {
    height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--glass-border, rgba(150, 150, 150, 0.3));
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary, rgba(150, 150, 150, 0.6));
}
</style>
