<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // Import cái "ví" Pinia của bạn
import AnimatedBackground from '../components/AnimatedBackground.vue';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = "Vui lòng nhập đầy đủ email và mật khẩu.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    });
    router.push({ name: 'chat' });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    errorMessage.value = error.response?.data?.message || "Email hoặc mật khẩu không chính xác.";
  } finally {
    isLoading.value = false;
  }
};

// Hàm này được gọi khi bạn bấm nút Google và đăng nhập thành công
const handleLoginSuccess = async (response) => {
  try {
    await authStore.loginWithGoogle(response.credential);
    router.push({ name: 'chat' });
  } catch (error) {
    console.error("Lỗi Google Login:", error);
    alert("Đăng nhập Google thất bại!");
  }
};
</script>

<template>
  <div class="bg-black min-h-screen flex items-center justify-center overflow-hidden font-sans relative">
    <AnimatedBackground />
    <main class="relative z-10 w-full max-w-md px-6">
      <div class="glass-card rounded-3xl p-8 md:p-12">
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 mb-6 mx-auto">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">YuiChat</h1>
          <p class="text-white/60 mt-2 text-sm">Đăng nhập để vào phòng Chat</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div v-if="errorMessage" class="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl animate-pulse">
            {{ errorMessage }}
          </div>

          <div>
            <label class="block text-sm font-medium text-white/80 mb-2 ml-1" for="username">Email</label>
            <div class="relative">
              <input v-model="email" class="glass-input w-full px-5 py-3.5 rounded-xl text-white placeholder-white/30 focus:ring-0" id="username" placeholder="Nhập email..." type="email" required />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2 ml-1">
              <label class="block text-sm font-medium text-white/80" for="password">Mật khẩu</label>
              <a class="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors" href="#">Quên mật khẩu?</a>
            </div>
            <div class="relative">
              <input v-model="password" autocomplete="current-password" class="glass-input w-full px-5 py-3.5 rounded-xl text-white placeholder-white/30 focus:ring-0" id="password" placeholder="••••••••" type="password" required />
            </div>
          </div>

          <div class="pt-2">
            <button :disabled="isLoading" class="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-white/5 disabled:opacity-50" type="submit">
              {{ isLoading ? 'Đang kiểm tra...' : 'Đăng nhập' }}
            </button>
          </div>

          <div class="flex items-center my-4 before:flex-1 before:border-t before:border-white/20 before:mt-0.5 after:flex-1 after:border-t after:border-white/20 after:mt-0.5">
            <p class="text-center font-semibold mx-4 mb-0 text-white/50 text-sm">HOẶC</p>
          </div>

          <div class="mt-4 flex justify-center">
             <GoogleLogin :callback="handleLoginSuccess" />
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
