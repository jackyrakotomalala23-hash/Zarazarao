import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { UserProfile } from '@/types';

export const userService = {
  // Get single user profile by uid
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const userDoc = snap.docs.find(d => d.id === uid);
      if (!userDoc) return null;
      return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
    } catch (err) {
      console.error('Error getting user profile:', err);
      return null;
    }
  },

  // Search users by display name or city
  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
      if (!searchTerm || !searchTerm.trim()) {
        return list;
      }
      const term = searchTerm.toLowerCase().trim();
      return list.filter(u =>
        (u.displayName && u.displayName.toLowerCase().includes(term)) ||
        (u.city && u.city.toLowerCase().includes(term))
      );
    } catch (err) {
      console.error('Error searching users:', err);
      return [];
    }
  }
};
