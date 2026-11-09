import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  increment
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Donation, DonationStatus, HandoverMode, Reservation } from '@/types';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';
import { loyaltyService } from './loyaltyService';
import { chatService } from './chatService';
import { notificationService } from './notificationService';

export interface DonationFilterParams {
  category?: string;
  city?: string;
  fokontany?: string;
  status?: string;
  handoverMode?: string;
  search?: string;
  minCondition?: number;
  sortBy?: 'recent' | 'views' | 'condition';
  limitCount?: number;
}

export function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const cleaned: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      cleaned[key] = sanitizeForFirestore(val);
    }
  }
  return cleaned;
}

export const donationService = {
  // Get all donations matching filters
  async getDonations(filters: DonationFilterParams = {}): Promise<Donation[]> {
    try {
      let q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'));

      if (filters.status && filters.status !== 'ALL') {
        q = query(collection(db, 'donations'), where('status', '==', filters.status), orderBy('createdAt', 'desc'));
      }

      if (filters.limitCount) {
        q = query(q, limit(filters.limitCount));
      } else {
        q = query(q, limit(50)); // Default limit to improve initial load time
      }

      const snap = await getDocs(q);
      let list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Donation));

      // In-memory multi-attribute filtering for full text, category, city, etc.
      if (filters.category && filters.category !== 'all') {
        list = list.filter(d => d.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters.city && filters.city !== 'all') {
        list = list.filter(d => d.city.toLowerCase() === filters.city!.toLowerCase());
      }
      if (filters.fokontany && filters.fokontany !== 'all') {
        list = list.filter(d => d.fokontany && d.fokontany.toLowerCase() === filters.fokontany!.toLowerCase());
      }
      if (filters.handoverMode && filters.handoverMode !== 'all') {
        list = list.filter(d => d.handoverMode === filters.handoverMode);
      }
      if (filters.minCondition !== undefined && filters.minCondition > 0) {
        list = list.filter(d => d.conditionScore >= filters.minCondition!);
      }
      if (filters.search && filters.search.trim()) {
        const term = filters.search.toLowerCase().trim();
        list = list.filter(d => 
          d.title.toLowerCase().includes(term) || 
          d.description.toLowerCase().includes(term) ||
          d.fokontany.toLowerCase().includes(term) ||
          d.city.toLowerCase().includes(term)
        );
      }

      if (filters.sortBy === 'views') {
        list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      } else if (filters.sortBy === 'condition') {
        list.sort((a, b) => b.conditionScore - a.conditionScore);
      }

      // Filter out recovered donations older than 15 days
      const fifteenDaysAgo = Date.now() - (15 * 24 * 60 * 60 * 1000);
      list = list.filter(d => {
        if (d.status === 'RECUPERE' && d.recoveredAt) {
          const recTime = new Date(d.recoveredAt).getTime();
          if (recTime < fifteenDaysAgo) return false;
        }
        return true;
      });

      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'donations');
    }
  },

  // Get single donation by ID
  async getDonationById(id: string): Promise<Donation | null> {
    try {
      const docRef = doc(db, 'donations', id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as Donation;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `donations/${id}`);
    }
  },

  // Record view and user interest idempotently
  async recordViewAndInterest(donationId: string, viewerUid?: string): Promise<void> {
    try {
      const donationRef = doc(db, 'donations', donationId);

      // Increment view counter
      await updateDoc(donationRef, {
        viewsCount: increment(1)
      });

      // If signed in, record unique interest
      if (viewerUid) {
        const interestId = `${donationId}_${viewerUid}`;
        const interestRef = doc(db, 'donationInterests', interestId);
        const interestSnap = await getDoc(interestRef);

        if (!interestSnap.exists()) {
          await setDoc(interestRef, {
            id: interestId,
            donationId,
            viewerUid,
            createdAt: new Date().toISOString()
          });

          await updateDoc(donationRef, {
            uniqueInterestsCount: increment(1)
          });
        }
      }
    } catch (error) {
      console.warn('Could not increment interest counter:', error);
    }
  },

  // Create new donation item
  async createDonation(data: Omit<Donation, 'id' | 'viewsCount' | 'uniqueInterestsCount' | 'conversationsCount' | 'createdAt' | 'status'>): Promise<{ donation: Donation; reward: { firstBonus: boolean; randomReward: number } }> {
    const donationId = `don-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const docRef = doc(db, 'donations', donationId);

    const rawDonation: Donation = {
      ...data,
      id: donationId,
      status: 'DISPONIBLE',
      viewsCount: 0,
      uniqueInterestsCount: 0,
      conversationsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newDonation = sanitizeForFirestore(rawDonation);

    try {
      await setDoc(docRef, newDonation);
      // Award loyalty bonus
      const reward = await loyaltyService.awardDonationReward(data.ownerUid, donationId);
      // Broadcast real-time notifications to users subscribed to this city or category
      notificationService.broadcastNewDonationAlert(newDonation).catch(console.warn);
      return { donation: newDonation, reward };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `donations/${donationId}`);
    }
  },

  // Update existing donation
  async updateDonation(id: string, updates: Partial<Donation>): Promise<void> {
    try {
      const docRef = doc(db, 'donations', id);
      const cleanedUpdates = sanitizeForFirestore({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      await updateDoc(docRef, cleanedUpdates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `donations/${id}`);
    }
  },

  // Delete donation and deduct associated apples
  async deleteDonation(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'donations', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const donation = snap.data() as Donation;
        if (donation.ownerUid) {
          await loyaltyService.deductDonationApples(donation.ownerUid, id);
        }
      }
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `donations/${id}`);
    }
  },

  // Reserve donation for a beneficiary by donor
  async reserveDonation(
    donationId: string,
    donorUid: string,
    beneficiaryUid: string,
    beneficiaryName: string,
    conversationId: string
  ): Promise<Reservation> {
    const donationRef = doc(db, 'donations', donationId);
    const reservationId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const reservationRef = doc(db, 'reservations', reservationId);

    try {
      const res = await runTransaction(db, async (transaction) => {
        const dSnap = await transaction.get(donationRef);
        if (!dSnap.exists()) throw new Error('Donation non trouvée.');
        const donation = dSnap.data() as Donation;

        if (donation.ownerUid !== donorUid) {
          throw new Error('Vous n’êtes pas le donateur de cette annonce.');
        }
        if (donation.status !== 'DISPONIBLE') {
          throw new Error('Ce don n’est plus disponible pour une réservation.');
        }

        const now = new Date().toISOString();
        // Update donation status & state flags
        transaction.update(donationRef, {
          status: 'RESERVE',
          reservedForUid: beneficiaryUid,
          reservedForName: beneficiaryName,
          reservedAt: now,
          reservedByDonor: true,
          acceptedByBeneficiary: false,
          deliveredByDonor: false,
          updatedAt: now
        });

        // Create reservation record
        const reservation: Reservation = {
          id: reservationId,
          donationId,
          donationTitle: donation.title,
          donorUid,
          beneficiaryUid,
          conversationId,
          status: 'ACTIVE',
          createdAt: now
        };
        transaction.set(reservationRef, reservation);

        return reservation;
      });

      // Send system message in conversation
      await chatService.sendSystemMessage(
        conversationId,
        'RESERVATION_CREATED',
        `🎉 Le donateur a réservé cet objet pour vous ! Cliquez sur "Accepter le don" dans la barre de suivi ci-dessus pour confirmer votre accord.`
      );

      return res;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reservations/${reservationId}`);
    }
  },

  // Beneficiary accepts reservation from donor
  async acceptDonationByBeneficiary(
    donationId: string,
    beneficiaryUid: string,
    conversationId: string
  ): Promise<void> {
    const donationRef = doc(db, 'donations', donationId);

    try {
      await runTransaction(db, async (transaction) => {
        const dSnap = await transaction.get(donationRef);
        if (!dSnap.exists()) throw new Error('Donation non trouvée.');
        const donation = dSnap.data() as Donation;

        if (donation.reservedForUid !== beneficiaryUid) {
          throw new Error('Seul le bénéficiaire désigné peut accepter cette réservation.');
        }

        const now = new Date().toISOString();
        transaction.update(donationRef, {
          acceptedByBeneficiary: true,
          acceptedAt: now,
          updatedAt: now
        });
      });

      await chatService.sendSystemMessage(
        conversationId,
        'RESERVATION_ACCEPTED',
        `✅ Le bénéficiaire a accepté la réservation du don ! Le donateur peut à présent organiser la remise et marquer comme livré.`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `donations/${donationId}`);
    }
  },

  // Cancel reservation (revocable by donor or beneficiary at any stage)
  async cancelReservation(
    donationId: string,
    actorUid: string,
    actorName: string,
    conversationId: string,
    reason: string = 'Annulation demandée'
  ): Promise<void> {
    const donationRef = doc(db, 'donations', donationId);

    try {
      await runTransaction(db, async (transaction) => {
        const dSnap = await transaction.get(donationRef);
        if (!dSnap.exists()) throw new Error('Donation non trouvée.');
        const donation = dSnap.data() as Donation;

        if (donation.ownerUid !== actorUid && donation.reservedForUid !== actorUid) {
          throw new Error('Vous n’avez pas l’autorisation d’annuler cette réservation.');
        }

        const now = new Date().toISOString();
        transaction.update(donationRef, {
          status: 'DISPONIBLE',
          reservedForUid: null,
          reservedForName: null,
          reservedAt: null,
          reservedByDonor: false,
          acceptedByBeneficiary: false,
          deliveredByDonor: false,
          acceptedAt: null,
          deliveredAt: null,
          updatedAt: now
        });
      });

      // Send system message
      await chatService.sendSystemMessage(
        conversationId,
        'RESERVATION_CANCELLED',
        `⚠️ La réservation a été annulée par ${actorName} (${reason}). Le don est de nouveau disponible pour la communauté.`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `donations/${donationId}`);
    }
  },

  // Mark donation as delivered by donor
  async markAsDelivered(
    donationId: string,
    donorUid: string,
    conversationId: string
  ): Promise<void> {
    const donationRef = doc(db, 'donations', donationId);

    try {
      await runTransaction(db, async (transaction) => {
        const dSnap = await transaction.get(donationRef);
        if (!dSnap.exists()) throw new Error('Donation non trouvée.');
        const donation = dSnap.data() as Donation;

        if (donation.ownerUid !== donorUid) {
          throw new Error('Seul le donateur peut marquer le don comme livré.');
        }

        const now = new Date().toISOString();
        transaction.update(donationRef, {
          deliveredByDonor: true,
          deliveredAt: now,
          updatedAt: now
        });
      });

      await chatService.sendSystemMessage(
        conversationId,
        'DONATION_DELIVERED',
        `🚚 Le donateur a marqué l'objet comme livré ! Le bénéficiaire peut maintenant confirmer la réception finale dans la messagerie.`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `donations/${donationId}`);
    }
  },

  // Confirm receipt of donation by beneficiary (Final status RECUPERE)
  async confirmDonationReceived(
    donationId: string,
    beneficiaryUid: string,
    conversationId: string
  ): Promise<void> {
    const donationRef = doc(db, 'donations', donationId);

    try {
      await runTransaction(db, async (transaction) => {
        const dSnap = await transaction.get(donationRef);
        if (!dSnap.exists()) throw new Error('Donation non trouvée.');
        const donation = dSnap.data() as Donation;

        if (donation.reservedForUid !== beneficiaryUid) {
          throw new Error('Seul le bénéficiaire désigné peut confirmer la bonne réception du don.');
        }

        const now = new Date().toISOString();
        transaction.update(donationRef, {
          status: 'RECUPERE',
          recoveredAt: now,
          updatedAt: now
        });
      });

      // Send system message
      await chatService.sendSystemMessage(
        conversationId,
        'DONATION_RECOVERED',
        `✨ Don récupéré et validé avec succès ! Merci de faire vivre la solidarité et le partage Fihavanana à Madagascar avec Zarazarao.`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `donations/${donationId}`);
    }
  },

  // Get user's own donations
  async getUserDonations(userId: string): Promise<Donation[]> {
    try {
      const q = query(
        collection(db, 'donations'),
        where('ownerUid', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Donation));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'donations');
    }
  },

  // Get user's active and past reservations as beneficiary
  async getUserReservations(userId: string): Promise<Donation[]> {
    try {
      const q = query(
        collection(db, 'donations'),
        where('reservedForUid', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Donation));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'donations');
    }
  }
};
