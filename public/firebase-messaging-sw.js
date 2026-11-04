// Give the service worker access to Firebase Messaging.
// Note that you can use any version of Firebase v9+ compat libraries.
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
  apiKey: "AIzaSyD-slzf1i7-CaDdjT_rRELyF6VMjJO5s7E",
  projectId: "famous-house-hv4kj",
  messagingSenderId: "16907104065",
  appId: "1:16907104065:web:c7e62096d5b8404a9afbc0"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Zarazarao - Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'Vous avez un nouveau message ou une mise à jour de don.',
    icon: '/icon-192.jpg',
    badge: '/icon-192.jpg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
