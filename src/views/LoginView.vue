<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const password_confirmation = ref('');
const name = ref('');
const username = ref('');
const otp = ref('');

const errorMessage = ref('');
const isLoading = ref(false);
const showPassword = ref(false);
const isRegisterMode = ref(false);

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
    errorMessage.value = data?.errors ? Object.values(data.errors)[0][0] : (data?.message || 'Có lỗi xảy ra khi gửi OTP.');
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

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
  registerStep.value = 1;
  errorMessage.value = '';
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
  <!-- Responsive Layout: Split on desktop, single column on mobile -->
  <div class="min-h-screen bg-apple-black flex md:flex-row flex-col overflow-hidden">
    
    <!-- Left Side: Branding (Desktop Only) -->
    <div class="hidden md:flex md:w-[45%] lg:w-[50%] relative bg-gradient-to-br from-[#1d1d1f] to-black flex-col justify-between p-12 border-r border-white/10">
      <!-- Background subtle pattern -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(white 1px, transparent 1px); background-size: 24px 24px;"></div>
      
      <div class="relative z-10">
        <!-- Logo -->
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h1 class="text-5xl lg:text-6xl font-display font-semibold text-white mb-6 leading-[1.1] tracking-tight">
          Kết nối<br/>theo cách của bạn.
        </h1>
        <p class="text-lg text-white/50 max-w-md font-light leading-relaxed">
          Trải nghiệm nhắn tin mượt mà, nhanh chóng và bảo mật với YuiChat. Nền tảng được thiết kế với sự tinh tế và tối giản.
        </p>
      </div>

      <!-- Decorative bottom elements -->
      <div class="relative z-10">
        <div class="flex -space-x-3 items-center">
          <div class="w-10 h-10 rounded-full border-2 border-[#151516] bg-indigo-500 shadow-lg"></div>
          <div class="w-10 h-10 rounded-full border-2 border-[#151516] bg-purple-500 shadow-lg"></div>
          <div class="w-10 h-10 rounded-full border-2 border-[#151516] bg-pink-500 shadow-lg"></div>
          <div class="w-10 h-10 rounded-full border-2 border-[#151516] bg-white/10 backdrop-blur-md flex items-center justify-center text-[10px] font-medium text-white shadow-lg">+2k</div>
          <span class="ml-5 text-sm text-white/40 font-medium">Người dùng trực tuyến</span>
        </div>
      </div>
    </div>

    <!-- Right Side: Form Container -->
    <div class="w-full md:w-[55%] lg:w-[50%] flex flex-col items-center justify-center px-6 relative py-12 md:py-0">
      
      <!-- Mobile subtle noise overlay -->
      <div class="pointer-events-none fixed inset-0 opacity-[0.025] md:hidden"
           style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>'); background-size: 200px 200px;"></div>

      <main class="relative z-10 w-full max-w-[380px] animate-fade-slide-up">

        <!-- Mobile Logo & Header -->
        <div class="text-center md:text-left mb-10">
          <div class="md:hidden inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-[#1d1d1f] border border-white/10 mb-6 shadow-xl">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 class="font-display text-white font-semibold mb-2 text-3xl tracking-tight transition-all duration-300">
            {{ isRegisterMode ? 'Đăng ký tài khoản' : 'YuiChat' }}
          </h2>
          <p class="text-[15px] font-light text-white/50 transition-all duration-300">
            {{ isRegisterMode ? (registerStep === 1 ? 'Bước 1: Thông tin cá nhân' : (registerStep === 2 ? 'Bước 2: Xác thực OTP' : 'Bước 3: Mật khẩu')) : 'Đăng nhập để bắt đầu trò chuyện' }}
          </p>
        </div>

        <!-- Form -->
        <form id="login-form" @submit.prevent="isRegisterMode ? (registerStep === 1 ? handleSendOtp() : (registerStep === 2 ? handleVerifyOtp() : handleRegister())) : handleLogin()" class="space-y-4">

          <!-- Error banner -->
          <transition name="fade">
            <div v-if="errorMessage"
                 class="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p class="text-[13px] text-red-400 font-medium">{{ errorMessage }}</p>
            </div>
          </transition>

          <!-- ================= LOGIN MODE ================= -->
          <template v-if="!isRegisterMode">
            <div class="space-y-1.5">
              <label for="email-input" class="block text-[13px] font-medium text-white/70">Email</label>
              <input id="email-input" v-model="email" type="email" autocomplete="email" required placeholder="ten@example.com" class="apple-input w-full"/>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label for="password-input" class="block text-[13px] font-medium text-white/70">Mật khẩu</label>
                <a href="#" class="text-[13px] text-blue-400 hover:opacity-80 transition-opacity">Quên mật khẩu?</a>
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
          </template>

          <!-- ================= REGISTER MODE ================= -->
          <template v-else>
            <!-- Step 1: Info -->
            <transition name="fade" mode="out-in">
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
          </template>

          <!-- Primary CTA -->
          <div class="pt-4">
            <button id="login-submit-btn" type="submit" :disabled="isLoading" class="apple-btn w-full py-3.5 text-[17px]">
              <span v-if="isLoading" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin-smooth" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="3"/>
                  <path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Đang xử lý...
              </span>
              <span v-else>
                {{ !isRegisterMode ? 'Đăng nhập' : (registerStep === 1 ? 'Tiếp tục' : (registerStep === 2 ? 'Xác nhận OTP' : 'Hoàn tất đăng ký')) }}
              </span>
            </button>
          </div>

          <!-- Mode Toggle -->
          <div class="text-center pt-3">
            <button type="button" @click="toggleMode" class="text-[14px] font-medium text-blue-400 hover:opacity-80 transition-opacity">
              {{ isRegisterMode ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay' }}
            </button>
          </div>

          <!-- Divider & Google (only show in login or first step of register) -->
          <transition name="fade">
            <div v-if="!isRegisterMode || registerStep === 1" class="mt-4">
              <div class="flex items-center gap-4 py-3">
                <div class="flex-1 h-px bg-white/10"></div>
                <span class="text-[11px] font-semibold tracking-wider text-white/30 uppercase">Hoặc</span>
                <div class="flex-1 h-px bg-white/10"></div>
              </div>
              <div class="flex justify-center mt-2">
                <GoogleLogin :callback="handleLoginSuccess" />
              </div>
            </div>
          </transition>

        </form>
      </main>

      <footer class="absolute bottom-6 w-full text-center md:hidden">
        <p class="text-[11px] text-white/20">© 2025 YuiChat. Dự án tốt nghiệp.</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Vue Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}

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
