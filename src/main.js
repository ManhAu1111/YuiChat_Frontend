import './assets/main.css'

// Redirect 127.0.0.1 to localhost to prevent duplicate PWA installation origins
if (window.location.hostname === '127.0.0.1') {
  window.location.hostname = 'localhost'
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vue3GoogleLogin from 'vue3-google-login'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Đọc Client ID từ file .env cực kỳ bảo mật
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
})

app.mount('#app')
