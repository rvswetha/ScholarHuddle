import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  console.log('Requesting notification permission...');
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error('Permission not granted.');
      return;
    }

    // 1. Register the Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    
    // 2. Wait for the Service Worker to be fully active
    let serviceWorker = registration.active || registration.installing || registration.waiting;
    
    if (!registration.active) {
      console.log('Service Worker is initializing... waiting for activation.');
      await navigator.serviceWorker.ready;
    }

    // 3. Double check the VAPID key
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    
    // 4. Request the token with the now-active registration
    const token = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('FCM Token generated:', token);
      return token;
    }
    
  } catch (err) {
    console.error('Error in requestNotificationPermission:', err);
  }
};

export { app, messaging };