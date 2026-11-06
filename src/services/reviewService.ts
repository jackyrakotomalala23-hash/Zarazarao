import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';

export interface Review {
  id: string;
  donorUid: string;
  beneficiaryUid: string;
  beneficiaryName: string;
  beneficiaryPhoto?: string;
  donationId: string;
  donationTitle: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export const reviewService = {
  async addReview(data: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const reviewRef = doc(db, 'reviews', reviewId);

    const review: Review = {
      ...data,
      id: reviewId,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(reviewRef, review);
      return review;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `reviews/${reviewId}`);
    }
  },

  async getReviewsForDonor(donorUid: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('donorUid', '==', donorUid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
    } catch (error) {
      // If index is building or missing, fallback to unordered get
      try {
        const qFallback = query(
          collection(db, 'reviews'),
          where('donorUid', '==', donorUid)
        );
        const snap = await getDocs(qFallback);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return list;
      } catch (err2) {
        console.warn('Could not fetch reviews:', err2);
        return [];
      }
    }
  }
};
