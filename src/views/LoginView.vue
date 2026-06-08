<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const name = ref('');
const username = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const showPassword = ref(false);
const isRegisterMode = ref(false);

const handleAuth = async () => {
  if (!email.value || !password.value || (isRegisterMode.value && (!name.value || !username.value))) {
    errorMessage.value = 'Vui lòng nhập đầy đủ thông tin.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  try {
    if (isRegisterMode.value) {
      await authStore.register({
        name: name.value,
        username: username.value,
        email: email.value,
        password: password.value
      });
    } else {
      await authStore.login({ email: email.value, password: password.value });
    }
    router.push({ name: 'chat' });
  } catch (error) {
    console.error(`Lỗi ${isRegisterMode.value ? 'đăng ký' : 'đăng nhập'}:`, error);
    errorMessage.value = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
  } finally {
    isLoading.value = false;
  }
};

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
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
  <!-- Apple Design: pure black hero with centered form — cinematic, minimal -->
  <div class="min-h-screen bg-apple-black flex flex-col items-center justify-center px-6 overflow-hidden">

    <!-- Subtle noise texture overlay — keeps solid black from feeling flat -->
    <div class="pointer-events-none fixed inset-0 opacity-[0.025]"
         style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>'); background-size: 200px 200px;"></div>

    <!-- Form Container -->
    <main class="relative z-10 w-full max-w-[400px] animate-fade-slide-up">

      <!-- Logo / Brand -->
      <div class="text-center mb-12">
        <!-- Chat bubble icon — SF-style, thin stroke -->
        <div class="inline-flex items-center justify-center w-[72px] h-[72px] rounded-[20px] mb-7"
             style="background: #1d1d1f; border: 1px solid rgba(255,255,255,0.1);">
          <svg class="w-9 h-9" fill="none" stroke="white" stroke-width="1.4" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <!-- Apple Display typography: 34px, weight 600, tight -->
        <h1 class="font-display text-white font-semibold mb-2 transition-all duration-300"
            style="font-size: 34px; line-height: 1.1; letter-spacing: -0.28px;">
          {{ isRegisterMode ? 'Đăng ký' : 'YuiChat' }}
        </h1>
        <p class="text-sm font-light transition-all duration-300" style="color: rgba(255,255,255,0.48); letter-spacing: -0.224px;">
          {{ isRegisterMode ? 'Tạo tài khoản mới để tham gia YuiChat' : 'Đăng nhập để bắt đầu trò chuyện' }}
        </p>
      </div>

      <!-- Form -->
      <form id="login-form" @submit.prevent="handleAuth" class="space-y-4">

        <!-- Error banner -->
        <transition name="fade">
          <div v-if="errorMessage"
               class="px-4 py-3 rounded-[10px]"
               style="background: rgba(255,59,48,0.1); border: 1px solid rgba(255,59,48,0.25);">
            <p class="text-sm" style="color: #ff453a; letter-spacing: -0.224px;">{{ errorMessage }}</p>
          </div>
        </transition>

        <!-- Dynamic Fields for Registration -->
        <transition name="slide-fade">
          <div v-if="isRegisterMode" class="space-y-4 mb-4">
            <!-- Name field -->
            <div class="space-y-1.5">
              <label for="name-input" class="block text-sm font-medium"
                     style="color: rgba(255,255,255,0.7); letter-spacing: -0.224px;">
                Tên hiển thị
              </label>
              <input
                id="name-input"
                v-model="name"
                type="text"
                autocomplete="name"
                :required="isRegisterMode"
                placeholder="Nguyễn Văn A"
                class="apple-input w-full"
              />
            </div>

            <!-- Username field -->
            <div class="space-y-1.5">
              <label for="username-input" class="block text-sm font-medium"
                     style="color: rgba(255,255,255,0.7); letter-spacing: -0.224px;">
                Tên đăng nhập
              </label>
              <input
                id="username-input"
                v-model="username"
                type="text"
                autocomplete="username"
                :required="isRegisterMode"
                placeholder="nguyenvana"
                class="apple-input w-full"
              />
            </div>
          </div>
        </transition>

        <!-- Email field -->
        <div class="space-y-1.5">
          <label for="email-input" class="block text-sm font-medium"
                 style="color: rgba(255,255,255,0.7); letter-spacing: -0.224px;">
            Email
          </label>
          <input
            id="email-input"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            placeholder="ten@example.com"
            class="apple-input w-full"
          />
        </div>

        <!-- Password field -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label for="password-input" class="block text-sm font-medium"
                   style="color: rgba(255,255,255,0.7); letter-spacing: -0.224px;">
              Mật khẩu
            </label>
            <!-- Apple "Learn more" pill style link -->
            <a href="#"
               class="text-[13px] transition-opacity hover:opacity-80"
               style="color: #2997ff; letter-spacing: -0.224px;">
              Quên mật khẩu?
            </a>
          </div>
          <div class="relative">
            <input
              id="password-input"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              placeholder="••••••••"
              class="apple-input w-full pr-12"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-3 flex items-center px-1 transition-opacity hover:opacity-70"
              style="color: rgba(255,255,255,0.4);"
              :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
            >
              <!-- Eye / Eye-off icon -->
              <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Primary CTA — Apple Blue, 8px radius -->
        <div class="pt-2">
          <button
            id="login-submit-btn"
            type="submit"
            :disabled="isLoading"
            class="apple-btn w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style="font-size: 17px;"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin-smooth" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="3"/>
                <path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang kiểm tra...
            </span>
            <span v-else>{{ isRegisterMode ? 'Đăng ký ngay' : 'Đăng nhập' }}</span>
          </button>
        </div>

        <!-- Mode Toggle -->
        <div class="text-center pt-2 pb-1">
          <button type="button" @click="toggleMode" class="text-sm font-medium transition-opacity hover:opacity-80"
                  style="color: #2997ff; letter-spacing: -0.224px;">
            {{ isRegisterMode ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay' }}
          </button>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-4 py-2">
          <div class="flex-1 h-px" style="background: rgba(255,255,255,0.1);"></div>
          <span class="text-xs font-medium" style="color: rgba(255,255,255,0.3); letter-spacing: 0.5px;">HOẶC</span>
          <div class="flex-1 h-px" style="background: rgba(255,255,255,0.1);"></div>
        </div>

        <!-- Google Login -->
        <div class="flex justify-center">
          <GoogleLogin :callback="handleLoginSuccess" />
        </div>
      </form>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 mt-10 text-center">
      <p class="text-[11px]" style="color: rgba(255,255,255,0.2); letter-spacing: -0.08px;">
        © 2025 YuiChat. Dự án tốt nghiệp.
      </p>
    </footer>
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
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
