<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const emit = defineEmits(['switch-mode']);

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Vui lòng nhập đầy đủ thông tin.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login({ email: email.value, password: password.value });
    router.push({ name: 'chat' });
  } catch (error) {
    const data = error.response?.data;
    errorMessage.value = data?.errors ? Object.values(data.errors)[0][0] : (data?.message || 'Sai tài khoản hoặc mật khẩu.');
  } finally {
    isLoading.value = false;
  }
};

const handleLoginSuccess = async (response) => {
  try {
    await authStore.loginWithGoogle(response.credential);
    router.push({ name: 'chat' });
  } catch (error) {
    console.error('Lỗi Google Login:', error);
    errorMessage.value = 'Đăng nhập Google thất bại. Vui lòng thử lại.';
  }
};
</script>

<template>
  <div class="w-full">
    <!-- Mobile Logo & Header -->
    <div class="text-center md:text-left mb-10">
      <div class="md:hidden inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-[#1d1d1f] border border-white/10 mb-6 shadow-xl">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 class="font-display text-white font-semibold mb-2 text-3xl tracking-tight transition-all duration-300">
        YuiChat
      </h2>
      <p class="text-[15px] font-light text-white/50 transition-all duration-300">
        Đăng nhập để bắt đầu trò chuyện
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleLogin" class="space-y-4">
      <!-- Error banner -->
      <transition name="fade">
        <div v-if="errorMessage"
             class="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p class="text-[13px] text-red-400 font-medium">{{ errorMessage }}</p>
        </div>
      </transition>

      <div class="space-y-1.5">
        <label for="email-input" class="block text-[13px] font-medium text-white/70">Email</label>
        <input id="email-input" v-model="email" type="email" autocomplete="email" required placeholder="ten@example.com" class="apple-input w-full"/>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label for="password-input" class="block text-[13px] font-medium text-white/70">Mật khẩu</label>
          <a href="#" @click.prevent="emit('switch-mode', 'forgot-password')" class="text-[13px] text-blue-400 hover:opacity-80 transition-opacity">Quên mật khẩu?</a>
        </div>
        <div class="relative">
          <input id="password-input" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required placeholder="••••••••" class="apple-input w-full pr-12"/>
          <button type="button" :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showPassword = !showPassword" class="absolute inset-y-0 right-3 flex items-center px-1 text-white/40 hover:text-white/70 transition-colors">
            <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Primary CTA -->
      <div class="pt-4">
        <button type="submit" :disabled="isLoading" class="apple-btn w-full py-3.5 text-[17px]">
          <span v-if="isLoading" class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin-smooth" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="3"/>
              <path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Đang xử lý...
          </span>
          <span v-else>Đăng nhập</span>
        </button>
      </div>

      <!-- Mode Toggle -->
      <div class="text-center pt-3">
        <button type="button" @click="emit('switch-mode', 'register')" class="text-[14px] font-medium text-blue-400 hover:opacity-80 transition-opacity">
          Chưa có tài khoản? Đăng ký ngay
        </button>
      </div>

      <!-- Divider & Google -->
      <div class="mt-4">
        <div class="flex items-center gap-4 py-3">
          <div class="flex-1 h-px bg-white/10"></div>
          <span class="text-[11px] font-semibold tracking-wider text-white/30 uppercase">Hoặc</span>
          <div class="flex-1 h-px bg-white/10"></div>
        </div>
        <div class="flex justify-center mt-2">
          <GoogleLogin :callback="handleLoginSuccess" />
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
