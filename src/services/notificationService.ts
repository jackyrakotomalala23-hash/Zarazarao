import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Donation, InAppNotification, UserProfile } from '@/types';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';

export const notificationService = {
  // Subscribe in real-time to user's notifications
  subscribeToUserNotifications(
    userId: string,
    onNotifications: (notifications: InAppNotification[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'notifications'),
      where('recipientUid', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(40)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as InAppNotification)
        );
        onNotifications(notifs);
      },
      (error) => {
        if (onError) onError(error);
        else handleFirestoreError(error, OperationType.GET, 'notifications');
      }
    );
  },

  // Mark single notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        isRead: true,
        readAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  },

  // Mark all user notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientUid', '==', userId),
        where('isRead', '==', false)
      );
      const snap = await getDocs(q);
      if (snap.empty) return;

      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        batch.update(d.ref, {
          isRead: true,
          readAt: new Date().toISOString()
        });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications');
    }
  },

  // Broadcast real-time alerts when a new donation is published
  async broadcastNewDonationAlert(donation: Donation): Promise<number> {
    try {
      // Find eligible users in Firestore
      const usersSnap = await getDocs(collection(db, 'users'));
      if (usersSnap.empty) return 0;

      const eligibleUserIds = new Set<string>();

      usersSnap.docs.forEach((uDoc) => {
        const u = uDoc.data() as UserProfile & { alertCity?: string; savedCategories?: string[]; notifyNewDonations?: boolean };
        if (u.uid === donation.ownerUid) return; // Don't notify the author

        const cityMatches = (u.alertCity || u.city)?.toLowerCase() === donation.city.toLowerCase();
        const categoryMatches = u.savedCategories?.some(
          (cat) => cat.toLowerCase() === donation.category.toLowerCase()
        );

        if (cityMatches || categoryMatches) {
          eligibleUserIds.add(u.uid);
        }
      });

      // Send notification document to each eligible user
      const now = new Date().toISOString();
      const sendPromises = Array.from(eligibleUserIds).map(async (recipientUid) => {
        const notifId = `notif-don-${donation.id}-${recipientUid}-${Date.now()}`;
        const notif: InAppNotification = {
          id: notifId,
          recipientUid,
          type: 'donation_alert',
          title: `🎁 Nouveau don à ${donation.city} : ${donation.title}`,
          body: `Un nouvel objet dans « ${donation.category} » est disponible à ${donation.city} (${donation.fokontany}). Soyez parmi les premiers à contacter le donateur !`,
          resourceType: 'donation',
          resourceId: donation.id,
          isRead: false,
          createdAt: now
        };
        await setDoc(doc(db, 'notifications', notifId), notif);
      });

      await Promise.all(sendPromises);
      return eligibleUserIds.size;
    } catch (error) {
      console.warn('Error broadcasting donation alert:', error);
      return 0;
    }
  },

  // Send a direct in-app notification to any user or partner
  async sendNotification(notifData: Omit<InAppNotification, 'id' | 'createdAt' | 'isRead'>): Promise<string> {
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const notif: InAppNotification = {
      ...notifData,
      id: notifId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'notifications', notifId), notif);
      return notifId;
    } catch (error) {
      console.warn('Error sending notification:', error);
      return notifId;
    }
  },

  // Save user's alert preferences
  async saveAlertPreferences(
    userId: string,
    alertCity: string,
    savedCategories: string[],
    notifyNewDonations: boolean = true
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        alertCity,
        savedCategories,
        notifyNewDonations,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  }
};
