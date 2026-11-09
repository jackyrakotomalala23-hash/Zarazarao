import { collection, doc, setDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { SearchSubscription } from '@/types';

export const subscriptionService = {
  async subscribeToSearch(uid: string, searchQuery: string, category?: string, city?: string): Promise<string> {
    const subId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const subRef = doc(db, 'searchSubscriptions', subId);
    
    const subData: SearchSubscription = {
      id: subId,
      uid,
      searchQuery,
      category,
      city,
      createdAt: new Date().toISOString()
    };
    
    await setDoc(subRef, subData);
    return subId;
  },

  async unsubscribeFromSearch(subscriptionId: string): Promise<void> {
    const subRef = doc(db, 'searchSubscriptions', subscriptionId);
    await deleteDoc(subRef);
  },

  async getUserSubscriptions(uid: string): Promise<SearchSubscription[]> {
    const q = query(collection(db, 'searchSubscriptions'), where('uid', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SearchSubscription));
  }
};
