import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { UserProfile } from '@/types';

export const userService = {
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
