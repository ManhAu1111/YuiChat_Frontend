<script setup>
import { ref } from 'vue';
import AuthBranding from '../components/auth/AuthBranding.vue';
import LoginForm from '../components/auth/LoginForm.vue';
import RegisterForm from '../components/auth/RegisterForm.vue';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm.vue';

// 'login' | 'register' | 'forgot-password'
const currentMode = ref('login');

const handleSwitchMode = (mode) => {
  currentMode.value = mode;
};
</script>

<template>
  <!-- Responsive Layout: Split on desktop, single column on mobile -->
  <div class="min-h-screen bg-apple-black flex md:flex-row flex-col overflow-hidden">
    
    <!-- Left Side: Branding (Desktop Only) -->
    <AuthBranding />

    <!-- Right Side: Form Container -->
    <div class="w-full md:w-[55%] lg:w-[50%] flex flex-col items-center justify-center px-6 relative py-12 md:py-0">
      
      <!-- Mobile subtle noise overlay -->
      <div class="pointer-events-none fixed inset-0 opacity-[0.025] md:hidden"
           style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>'); background-size: 200px 200px;"></div>

      <main class="relative z-10 w-full max-w-[380px] animate-fade-slide-up">
        <transition name="slide-fade" mode="out-in">
          <LoginForm 
            v-if="currentMode === 'login'" 
            @switch-mode="handleSwitchMode" 
          />
          <RegisterForm 
            v-else-if="currentMode === 'register'" 
            @switch-mode="handleSwitchMode" 
          />
          <ForgotPasswordForm 
            v-else-if="currentMode === 'forgot-password'" 
            @switch-mode="handleSwitchMode" 
          />
        </transition>
      </main>

      <footer class="absolute bottom-6 w-full text-center md:hidden">
        <p class="text-[11px] text-white/20">© 2025 YuiChat. Dự án tốt nghiệp.</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Vue Transitions for switching between forms */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
