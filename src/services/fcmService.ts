import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { app, db } from '@/config/firebase';

let messagingInstance: Messaging | null = null;

try {
  if (typeof window !== 'undefined') {
    messagingInstance = getMessaging(app);
  }
} catch (error) {
  console.warn('Firebase Messaging not supported or failed to initialize:', error);
}

export const fcmService = {
  // Request permission and get FCM token
  async requestNotificationPermission(userId?: string): Promise<string | null> {
    if (!messagingInstance) {
      console.warn('Messaging is not initialized.');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission not granted.');
        return null;
      }

      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered with scope:', registration.scope);

        // Get token
        // Note: Replace or provide a valid VAPID key if configured in Firebase Console -> Cloud Messaging -> Web Push certificates
        const currentToken = await getToken(messagingInstance, {
          serviceWorkerRegistration: registration,
          // If you have a VAPID key from Firebase console, put it here. Otherwise, Firebase uses default.
        });

        if (currentToken) {
          console.log('FCM Token generated:', currentToken);
          if (userId) {
            await this.saveTokenToUser(userId, currentToken);
          }
          return currentToken;
        } else {
          console.log('No registration token available. Request permission to generate one.');
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  },

  // Save FCM token to Firestore user profile
  async saveTokenToUser(userId: string, token: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date().toISOString()
      });
      console.log('FCM token saved successfully to user profile.');
    } catch (error) {
      console.error('Error saving FCM token to Firestore:', error);
    }
  },

  // Listen for foreground messages when app is open
  onForegroundMessage(callback: (payload: any) => void) {
    if (!messagingInstance) return;
    return onMessage(messagingInstance, (payload) => {
      console.log('Message received in foreground: ', payload);
      callback(payload);
    });
  }
};
