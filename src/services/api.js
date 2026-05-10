import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  // baseURL: 'http://127.0.0.1:8000/api', // Đường dẫn tới Backend Laravel
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Axios Interceptor để tự động gắn Token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (window.Echo && window.Echo.socketId()) {
      config.headers['X-Socket-ID'] = window.Echo.socketId();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

window.Pusher = Pusher;

// Lấy IP động từ baseURL của Axios để dùng cho authEndpoint
const currentHost = api.defaults.baseURL.replace('/api', '');

window.Echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: currentHost.replace('http://', '').replace('https://', '').split(':')[0],
  wsPort: 8080,
  wssPort: 8080,
  forceTLS: false,
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
  authEndpoint: `${currentHost}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }
});

export default api;
