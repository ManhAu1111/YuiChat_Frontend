<script setup>
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const logout = () => {
  authStore.token = null;
  authStore.user = null;
  localStorage.removeItem('token');
  window.location.reload(); // Tải lại trang để văng ra ngoài
};
</script>

<template>
  <div style="padding: 20px;">
    <h1>Trang Chat Chính của YuiChat 💬</h1>
    <p>Chào mừng bạn: <strong>{{ authStore.user?.name }}</strong></p>
    <img :src="authStore.user?.avatar" alt="Avatar" style="width: 50px; border-radius: 50%;">
    <br><br>
    <button @click="logout">Đăng xuất</button>
  </div>
</template>
