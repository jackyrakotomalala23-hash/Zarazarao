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
import { sanitizeForFirestore } from './donationService';

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
  // Add a review and recalculate aggregate average rating for the reviewed user
  async addReview(data: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const reviewRef = doc(db, 'reviews', reviewId);

    const rawReview: Review = {
      ...data,
      id: reviewId,
      createdAt: new Date().toISOString()
    };

    const review = sanitizeForFirestore(rawReview);

    try {
      await setDoc(reviewRef, review);

      // Recalculate target user's aggregate average rating
      await this.updateUserRatingStats(data.donorUid);

      return review;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `reviews/${reviewId}`);
    }
  },

  // Recalculate and persist aggregate rating stats
  async updateUserRatingStats(donorUid: string): Promise<{ averageRating: number; reviewsCount: number }> {
    try {
      const reviews = await this.getReviewsForDonor(donorUid);
      const reviewsCount = reviews.length;
      let averageRating = 5.0;

      if (reviewsCount > 0) {
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
        averageRating = Math.round((sum / reviewsCount) * 10) / 10;
      }

      const userRef = doc(db, 'users', donorUid);
      await setDoc(userRef, {
        averageRating,
        reviewsCount,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return { averageRating, reviewsCount };
    } catch (err) {
      console.warn('Could not update user aggregate rating stats:', err);
      return { averageRating: 5.0, reviewsCount: 0 };
    }
  },

  // Get all reviews received by a donor/member
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
      // Fallback without index sorting
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
