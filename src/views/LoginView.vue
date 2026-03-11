<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // Import cái "ví" Pinia của bạn

const authStore = useAuthStore();
const router = useRouter();

// Hàm này được gọi khi bạn bấm nút Google và đăng nhập thành công
const handleLoginSuccess = async (response) => {
  try {
    await authStore.loginWithGoogle(response.credential);
    router.push({ name: 'chat' });
  } catch (error) {
    console.error("Lỗi rồi:", error);
    alert("Đăng nhập thất bại! Kiểm tra console.");
  }
};
</script>

<template>
  <div class="bg-black min-h-screen flex items-center justify-center overflow-hidden font-sans relative">
    <div class="fixed inset-0 z-0 overflow-hidden" data-purpose="animated-background">
      <div class="absolute top-[10%] left-[15%] w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-float"></div>
      <div class="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-float-delayed"></div>
      <div class="absolute top-[40%] right-[25%] w-64 h-64 bg-pink-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-float-slow"></div>
      <div class="absolute bottom-[10%] left-[30%] w-80 h-80 bg-cyan-400 rounded-full mix-blend-screen filter blur-[90px] opacity-30 animate-float"></div>
    </div>
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

        <form @submit.prevent class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-white/80 mb-2 ml-1" for="username">Tài khoản</label>
            <div class="relative">
              <input class="glass-input w-full px-5 py-3.5 rounded-xl text-white placeholder-white/30 focus:ring-0" id="username" placeholder="Nhập email..." type="text" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2 ml-1">
              <label class="block text-sm font-medium text-white/80" for="password">Mật khẩu</label>
              <a class="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors" href="#">Quên mật khẩu?</a>
            </div>
            <div class="relative">
              <input class="glass-input w-full px-5 py-3.5 rounded-xl text-white placeholder-white/30 focus:ring-0" id="password" placeholder="••••••••" type="password" />
            </div>
          </div>

          <div class="pt-2">
            <button class="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-white/5" type="submit">
              Đăng nhập
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

<style scoped>
/* Hiệu ứng bong bóng lơ lửng */
@keyframes float {
  0% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(-30px) translateX(20px); }
  100% { transform: translateY(0px) translateX(0px); }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
.animate-float-delayed {
  animation: float 8s ease-in-out infinite;
  animation-delay: 2s;
}
.animate-float-slow {
  animation: float 12s ease-in-out infinite;
  animation-delay: 1s;
}

/* Hiệu ứng Kính mờ (Glassmorphism) */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
.glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}
.glass-input:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
  outline: none;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
}
</style>
