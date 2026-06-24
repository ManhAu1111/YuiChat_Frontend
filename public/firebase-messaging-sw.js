// Retrieve Firebase Messaging object.
// See: https://firebase.google.com/docs/cloud-messaging/js/receive
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Extract Firebase config from URL parameters
const params = new URL(location).searchParams;
const firebaseConfig = {
    apiKey: params.get('apiKey'),
    authDomain: params.get('authDomain'),
    projectId: params.get('projectId'),
    storageBucket: params.get('storageBucket'),
    messagingSenderId: params.get('messagingSenderId'),
    appId: params.get('appId')
};

// Only initialize if we have the config (prevents errors on old cached SW without params)
if (firebaseConfig.apiKey && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Background message handler
    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        
        const notificationTitle = payload.notification?.title || payload.data?.title || 'YuiChat';
        const notificationOptions = {
            body: payload.notification?.body || payload.data?.body || 'Bạn có tin nhắn mới.',
            icon: '/favicon.ico',
            data: {
                url: payload.data?.conversation_id ? `/chat/${payload.data.conversation_id}` : '/'
            }
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
}

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            const targetUrl = event.notification.data.url;
            // If window is already open, focus it and navigate
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            // If window is not open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
