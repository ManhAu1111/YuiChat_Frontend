const Pusher = require('pusher-js');
const pusher = new Pusher('pjas9unma5j0hzp78uja', {
  wsHost: '127.0.0.1',
  wsPort: 8080,
  forceTLS: false,
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
});

pusher.connection.bind('connected', () => {
  console.log('Connected to Reverb');
  process.exit(0);
});

pusher.connection.bind('error', (err) => {
  console.error('Error', err);
  process.exit(1);
});
