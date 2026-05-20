import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Tự động lấy IP hiện tại mà người dùng đang truy cập trên thanh địa chỉ (vd: 192.168.x.x hoặc localhost)
const currentHostname = window.location.hostname;

const api = axios.create({
  baseURL: `http://${currentHostname}:8000/api`,
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

window.Echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: currentHostname,
  wsPort: 8080,
  wssPort: 8080,
  forceTLS: false,
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
  authEndpoint: `http://${currentHostname}:8000/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }
});

export default api;
