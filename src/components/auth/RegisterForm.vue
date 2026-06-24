<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const emit = defineEmits(['switch-mode']);

const authStore = useAuthStore();
const router = useRouter();

const name = ref('');
const username = ref('');
const email = ref('');
const otp = ref('');
const password = ref('');
const password_confirmation = ref('');

const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const registerStep = ref(1); // 1: Info, 2: OTP, 3: Password

const handleSendOtp = async () => {
  if (!name.value || !username.value || !email.value) {
    errorMessage.value = 'Vui lòng nhập đầy đủ thông tin.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await authStore.sendOtp({ name: name.value, username: username.value, email: email.value });
    registerStep.value = 2;
  } catch (error) {
    const data = error.response?.data;
    if (data?.errors) {
      if (data.errors.email) {
        errorMessage.value = 'Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.';
      } else if (data.errors.username) {
        errorMessage.value = 'Tên đăng nhập này đã được sử dụng.';
      } else {
        errorMessage.value = Object.values(data.errors)[0][0];
      }
    } else {
      errorMessage.value = data?.message || 'Có lỗi xảy ra khi gửi OTP.';
    }
  } finally {
    isLoading.value = false;
  }
};

const handleVerifyOtp = async () => {
  if (!otp.value || otp.value.length !== 6) {
    errorMessage.value = 'Vui lòng nhập mã OTP 6 số.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await authStore.verifyOtp(email.value, otp.value);
    registerStep.value = 3;
  } catch (error) {
    const data = error.response?.data;
    errorMessage.value = data?.errors ? Object.values(data.errors)[0][0] : (data?.message || 'Mã OTP không đúng.');
  } finally {
    isLoading.value = false;
  }
};

const handleRegister = async () => {
  if (!password.value || password.value !== password_confirmation.value) {
    errorMessage.value = 'Mật khẩu không khớp.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await authStore.register({
      name: name.value,
      username: username.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value
    });
    router.push({ name: 'chat' });
  } catch (error) {
    const data = error.response?.data;
    errorMessage.value = data?.errors ? Object.values(data.errors)[0][0] : (data?.message || 'Có lỗi xảy ra khi đăng ký.');
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleSuccess = async (response) => {
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
        Đăng ký tài khoản
      </h2>
      <p class="text-[15px] font-light text-white/50 transition-all duration-300">
        {{ registerStep === 1 ? 'Bước 1: Thông tin cá nhân' : (registerStep === 2 ? 'Bước 2: Xác thực OTP' : 'Bước 3: Mật khẩu') }}
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="registerStep === 1 ? handleSendOtp() : (registerStep === 2 ? handleVerifyOtp() : handleRegister())" class="space-y-4">
      <!-- Error banner -->
      <transition name="fade">
        <div v-if="errorMessage"
             class="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p class="text-[13px] text-red-400 font-medium">{{ errorMessage }}</p>
        </div>
      </transition>

      <transition name="fade" mode="out-in">
        <!-- Step 1: Info -->
        <div v-if="registerStep === 1" class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-[13px] font-medium text-white/70">Tên hiển thị</label>
            <input v-model="name" type="text" autocomplete="name" required placeholder="Nguyễn Văn A" class="apple-input w-full"/>
          </div>
          <div class="space-y-1.5">
            <label class="block text-[13px] font-medium text-white/70">Tên đăng nhập</label>
            <input v-model="username" type="text" autocomplete="username" required placeholder="nguyenvana" class="apple-input w-full"/>
          </div>
          <div class="space-y-1.5">
            <label class="block text-[13px] font-medium text-white/70">Email</label>
            <input v-model="email" type="email" autocomplete="email" required placeholder="ten@example.com" class="apple-input w-full"/>
          </div>
        </div>

        <!-- Step 2: OTP -->
        <div v-else-if="registerStep === 2" class="space-y-5">
          <div class="space-y-1.5">
            <label class="block text-[13px] font-medium text-white/70">Nhập mã OTP</label>
            <p class="text-xs text-white/40 mb-3">Mã xác thực 6 số đã được gửi đến email <strong>{{ email }}</strong></p>
            <input v-model="otp" type="text" maxlength="6" required placeholder="------" class="apple-input w-full text-center tracking-[1em] font-mono text-xl py-3"/>
          </div>
          <div class="text-right">
            <button type="button" @click="handleSendOtp" class="text-[13px] text-blue-400 hover:opacity-80 transition-opacity">Gửi lại mã OTP</button>
          </div>
        </div>

        <!-- Step 3: Password -->
        <div v-else-if="registerStep === 3" class="space-y-4">
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
            <label class="block text-[13px] font-medium text-white/70">Xác nhận mật khẩu</label>
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
            {{ registerStep === 1 ? 'Tiếp tục' : (registerStep === 2 ? 'Xác nhận OTP' : 'Hoàn tất đăng ký') }}
          </span>
        </button>
      </div>

      <!-- Mode Toggle -->
      <div class="text-center pt-3">
        <button type="button" @click="emit('switch-mode', 'login')" class="text-[14px] font-medium text-blue-400 hover:opacity-80 transition-opacity">
          Đã có tài khoản? Đăng nhập
        </button>
      </div>

      <!-- Divider & Google -->
      <transition name="fade">
        <div v-if="registerStep === 1" class="mt-4">
          <div class="flex items-center gap-4 py-3">
            <div class="flex-1 h-px bg-white/10"></div>
            <span class="text-[11px] font-semibold tracking-wider text-white/30 uppercase">Hoặc</span>
            <div class="flex-1 h-px bg-white/10"></div>
          </div>
          <div class="flex justify-center mt-2">
            <GoogleLogin :callback="handleGoogleSuccess" />
          </div>
        </div>
      </transition>
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
