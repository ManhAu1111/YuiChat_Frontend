import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Tự động lấy IP hiện tại mà người dùng đang truy cập trên thanh địa chỉ (vd: 192.168.x.x hoặc localhost)
const currentHostname = window.location.hostname;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
    if (window.Echo && window.Echo.connector?.pusher?.connection?.socket_id) {
      config.headers['X-Socket-ID'] = window.Echo.connector.pusher.connection.socket_id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

window.Pusher = Pusher;
window.axios = api; // Expose to window so Laravel Echo uses it automatically for channel auth

window.Echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: currentHostname,
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  forceTLS: false,
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        // Remove /api from the base URL since broadcasting/auth is usually at the root domain
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');
        api.post(`${baseUrl}/broadcasting/auth`, {
            socket_id: socketId,
            channel_name: channel.name
        })
        .then(response => {
            callback(false, response.data);
        })
        .catch(error => {
            callback(true, error);
        });
      }
    };
  },
});

export const getFileUrl = (url) => {
  if (!url) return '';
  if (url.includes('/storage/')) {
    const path = url.substring(url.indexOf('/storage/'));
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');
    return `${baseUrl}${path}`;
  }
  return url;
};

export default api;
