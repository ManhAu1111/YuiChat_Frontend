import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let messaging;

try {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
} catch (error) {
  console.error("Firebase initialization error", error);
}

export const requestFirebaseNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Pass config to SW via URL parameters so it's available during background wake-ups
      const configParams = new URLSearchParams(firebaseConfig).toString();
      const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${configParams}`);

      // Get the token. Make sure you add your VAPID key in .env as VITE_FIREBASE_VAPID_KEY
      const currentToken = await getToken(messaging, { 
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      });
      
      if (currentToken) {
        return currentToken;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.warn("Notification permission denied.");
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
};

export const onMessageListener = (callback) => {
  if (!messaging) return;
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

export { messaging };
