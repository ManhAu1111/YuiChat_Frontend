import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const echo = new Echo({
  broadcaster: 'reverb',
  key: 'test',
  wsHost: 'localhost',
  wsPort: 8080,
  forceTLS: false,
});

console.log(Object.keys(echo.connector));
