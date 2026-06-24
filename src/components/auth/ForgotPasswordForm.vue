<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

const emit = defineEmits(['switch-mode']);

const authStore = useAuthStore();

const email = ref('');
const otp = ref('');
const password = ref('');
const password_confirmation = ref('');

const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const forgotPasswordStep = ref(1); // 1: Email, 2: OTP, 3: Password

const handleSendForgotOtp = async () => {
  if (!email.value) {
    errorMessage.value = 'Vui lòng nhập email.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await authStore.sendForgotPasswordOtp(email.value);
    forgotPasswordStep.value = 2;
  } catch (error) {
    const data = error.response?.data;
    if (data?.errors && data.errors.email) {
      errorMessage.value = 'Email này không tồn tại trong hệ thống.';
    } else {
      errorMessage.value = data?.errors ? Object.values(data.errors)[0][0] : (data?.message || 'Có lỗi xảy ra khi gửi OTP.');
    }
  } finally {
    isLoading.value = false;
  }
};

const handleVerifyForgotOtp = async () => {
  if (!otp.value || otp.value.length !== 6) {
    errorMessage.value = 'Vui lòng nhập mã OTP 6 số.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await authStore.verifyForgotPasswordOtp(email.value, otp.value);
    forgotPasswordStep.value = 3;
  } catch (error) {
    const data = error.response?.data;
    errorMessage.value = data?.errors ? Object.values(data.errors)[0][0] : (data?.message || 'Mã OTP không đúng.');
  } finally {
    isLoading.value = false;
  }
};

const handleResetPassword = async () => {
  if (!password.value || password.value !== password_confirmation.value) {
    errorMessage.value = 'Mật khẩu không khớp.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await authStore.resetPassword({
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value
    });
    // Trở về đăng nhập và thông báo cho cha
    emit('switch-mode', 'login');
    // We cannot show success message here because component gets unmounted
    // But parent can handle it if we pass a message
    // Just emit and let parent show it if needed, or rely on another mechanism.
  } catch (error) {
    const data = error.response?.data;
    errorMessage.value = data?.errors ? Object.values(data.errors)[0][0] : (data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
  } finally {
    isLoading.value = false;
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
        Khôi phục mật khẩu
      </h2>
      <p class="text-[15px] font-light text-white/50 transition-all duration-300">
        {{ forgotPasswordStep === 1 ? 'Bước 1: Nhập email' : (forgotPasswordStep === 2 ? 'Bước 2: Xác thực OTP' : 'Bước 3: Mật khẩu mới') }}
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="forgotPasswordStep === 1 ? handleSendForgotOtp() : (forgotPasswordStep === 2 ? handleVerifyForgotOtp() : handleResetPassword())" class="space-y-4">
      <!-- Error banner -->
      <transition name="fade">
        <div v-if="errorMessage"
             class="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p class="text-[13px] text-red-400 font-medium">{{ errorMessage }}</p>
        </div>
      </transition>

      <transition name="fade" mode="out-in">
        <!-- Step 1: Email -->
        <div v-if="forgotPasswordStep === 1" class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-[13px] font-medium text-white/70">Email đã đăng ký</label>
            <input v-model="email" type="email" autocomplete="email" required placeholder="ten@example.com" class="apple-input w-full"/>
          </div>
        </div>

        <!-- Step 2: OTP -->
        <div v-else-if="forgotPasswordStep === 2" class="space-y-5">
          <div class="space-y-1.5">
            <label class="block text-[13px] font-medium text-white/70">Nhập mã OTP</label>
            <p class="text-xs text-white/40 mb-3">Mã xác thực 6 số đã được gửi đến email <strong>{{ email }}</strong></p>
            <input v-model="otp" type="text" maxlength="6" required placeholder="------" class="apple-input w-full text-center tracking-[1em] font-mono text-xl py-3"/>
          </div>
          <div class="text-right">
            <button type="button" @click="handleSendForgotOtp" class="text-[13px] text-blue-400 hover:opacity-80 transition-opacity">Gửi lại mã OTP</button>
          </div>
        </div>

        <!-- Step 3: Password -->
        <div v-else-if="forgotPasswordStep === 3" class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-[13px] font-medium text-white/70">Mật khẩu mới</label>
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••" class="apple-input w-full pr-12"/>
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-3 flex items-center px-1 text-white/40 hover:text-white/70 transition-colors">
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="block text-[13px] font-medium text-white/70">Xác nhận mật khẩu mới</label>
            <input v-model="password_confirmation" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••" class="apple-input w-full"/>
          </div>
        </div>
      </transition>

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
          <span v-else>
            {{ forgotPasswordStep === 1 ? 'Tiếp tục' : (forgotPasswordStep === 2 ? 'Xác nhận OTP' : 'Đổi mật khẩu') }}
          </span>
        </button>
      </div>

      <!-- Mode Toggle -->
      <div class="text-center pt-3">
        <button type="button" @click="emit('switch-mode', 'login')" class="text-[14px] font-medium text-blue-400 hover:opacity-80 transition-opacity">
          Quay lại đăng nhập
        </button>
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
