<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useFriendshipStore } from './stores/friendshipStore';

const authStore = useAuthStore();
const friendshipStore = useFriendshipStore();

onMounted(async () => {
  // Only bootstrap when the user already has a saved token (page refresh).
  // For fresh logins the auth store's login() / loginWithGoogle() handles this.
  if (!localStorage.getItem('token')) return;

  // 1. Make sure we have the user object (needed for the Echo channel ID)
  if (!authStore.user) {
    await authStore.fetchUser();
  }

  // 2. Hydrate friendship states from the server
  await friendshipStore.fetchStates();

  // 3. Start the real-time listener so we get live updates while online
  friendshipStore.listenForRealTimeUpdates(authStore.user?.id);
});
</script>

<template>
  <RouterView />
</template>

<style>
/* Bạn có thể để trống thẻ style này, vì CSS mình đã dùng Tailwind hết rồi */
</style>
