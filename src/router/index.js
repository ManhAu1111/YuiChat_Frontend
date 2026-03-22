import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ChatView from '../views/Home.vue'

import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.token) {
    // Nếu trang cần đăng nhập mà chưa có token -> Đuổi về login
    return { name: 'login' };
  } else if (to.name === 'login' && authStore.token) {
    // Nếu có token rồi mà còn ráng vô trang login -> Đẩy thẳng vào phòng chat
    return { name: 'chat' };
  }
  
  return true; // Hợp lệ, cho qua!
})

export default router
