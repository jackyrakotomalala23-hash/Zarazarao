import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  runTransaction, 
  orderBy, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Coupon, LoyaltyTransaction, UserProfile } from '@/types';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';
import { notificationService } from './notificationService';

export const loyaltyService = {
  // Generate a random reward between 10 and 1000 apples for publishing a donation
  generateRandomDonationReward(): number {
    return Math.floor(Math.random() * (1000 - 10 + 1)) + 10;
  },

  // Generates a unique 8-digit coupon code
  generateEightDigitCode(): string {
    const min = 10000000;
    const max = 99999999;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  },

  // Award Signup Bonus (10 pommes)
  async awardSignupBonus(userId: string): Promise<boolean> {
    const userRef = doc(db, 'users', userId);
    try {
      return await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) return false;
        const data = userDoc.data() as UserProfile;
        if (data.signupBonusAwarded) return false;

        const newBalance = (data.applesCount || 0) + 10;
        transaction.update(userRef, {
          applesCount: newBalance,
          signupBonusAwarded: true,
          updatedAt: new Date().toISOString()
        });

        const txId = `tx-signup-${userId}-${Date.now()}`;
        const txRef = doc(db, 'loyaltyTransactions', txId);
        const txData: LoyaltyTransaction = {
          id: txId,
          uid: userId,
          type: 'SIGNUP_BONUS',
          pointsDelta: 10,
          sourceType: 'signup',
          sourceId: userId,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          note: 'Bonus de bienvenue Zarazarao (+10 pommes)'
        };
        transaction.set(txRef, txData);
        return true;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  },

  // Award Profile Completion Bonus (10 pommes)
  async awardProfileCompletionBonus(userId: string): Promise<boolean> {
    const userRef = doc(db, 'users', userId);
    try {
      return await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) return false;
        const data = userDoc.data() as UserProfile;
        if (data.profileCompletionStatus) return false;

        const newBalance = (data.applesCount || 0) + 10;
        transaction.update(userRef, {
          applesCount: newBalance,
          profileCompletionStatus: true,
          updatedAt: new Date().toISOString()
        });

        const txId = `tx-profile-${userId}-${Date.now()}`;
        const txRef = doc(db, 'loyaltyTransactions', txId);
        const txData: LoyaltyTransaction = {
          id: txId,
          uid: userId,
          type: 'PROFILE_BONUS',
          pointsDelta: 10,
          sourceType: 'profile',
          sourceId: userId,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          note: 'Bonus profil 100% complété (+10 pommes)'
        };
        transaction.set(txRef, txData);
        return true;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  },

  // Award Donation Rewards: checks if first donation bonus (+50) applies + random 10-1000 apples
  async awardDonationReward(userId: string, donationId: string): Promise<{ firstBonus: boolean; randomReward: number }> {
    const userRef = doc(db, 'users', userId);
    const randomReward = this.generateRandomDonationReward();
    let firstBonus = false;

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) return;
        const userData = userDoc.data() as UserProfile;
        
        let totalGain = randomReward;
        const updates: Partial<UserProfile> = {};

        // Check if first donation bonus has been claimed
        if (!userData.firstDonationBonusAwarded) {
          totalGain += 50;
          firstBonus = true;
          updates.firstDonationBonusAwarded = true;

          const bonusTxId = `tx-first-donation-${userId}-${donationId}`;
          const bonusTxRef = doc(db, 'loyaltyTransactions', bonusTxId);
          const bonusTxData: LoyaltyTransaction = {
            id: bonusTxId,
            uid: userId,
            type: 'FIRST_DONATION_BONUS',
            pointsDelta: 50,
            sourceType: 'donation',
            sourceId: donationId,
            status: 'CONFIRMED',
            createdAt: new Date().toISOString(),
            note: 'Bonus première publication de don (+50 pommes)'
          };
          transaction.set(bonusTxRef, bonusTxData);
        }

        // Random reward transaction
        const randomTxId = `tx-random-donation-${userId}-${donationId}`;
        const randomTxRef = doc(db, 'loyaltyTransactions', randomTxId);
        const randomTxData: LoyaltyTransaction = {
          id: randomTxId,
          uid: userId,
          type: 'RANDOM_DONATION_REWARD',
          pointsDelta: randomReward,
          sourceType: 'donation',
          sourceId: donationId,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          note: `Récompense aléatoire pour votre don (+${randomReward} pommes)`
        };
        transaction.set(randomTxRef, randomTxData);

        // Update user balance
        updates.applesCount = (userData.applesCount || 0) + totalGain;
        updates.updatedAt = new Date().toISOString();
        transaction.update(userRef, updates);
      });

      return { firstBonus, randomReward };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  },

  // Deduct apples gained when a donation publication is deleted
  async deductDonationApples(userId: string, donationId: string): Promise<number> {
    const userRef = doc(db, 'users', userId);
    try {
      return await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) return 0;
        const userData = userDoc.data() as UserProfile;

        // Query transactions for this donation
        const txsRef = collection(db, 'loyaltyTransactions');
        const q = query(txsRef, where('uid', '==', userId), where('sourceId', '==', donationId));
        const txSnap = await getDocs(q);

        let totalDeduction = 0;
        txSnap.forEach(d => {
          const tData = d.data() as LoyaltyTransaction;
          if (tData.status === 'CONFIRMED' && tData.pointsDelta > 0) {
            totalDeduction += tData.pointsDelta;
          }
        });

        if (totalDeduction <= 0) {
          totalDeduction = 50; // fallback default deduction
        }

        const currentBalance = userData.applesCount || 0;
        const newBalance = Math.max(0, currentBalance - totalDeduction);

        transaction.update(userRef, {
          applesCount: newBalance,
          updatedAt: new Date().toISOString()
        });

        // Record debit transaction
        const debitTxId = `tx-delete-donation-${userId}-${donationId}-${Date.now()}`;
        const debitTxRef = doc(db, 'loyaltyTransactions', debitTxId);
        const debitTxData: LoyaltyTransaction = {
          id: debitTxId,
          uid: userId,
          type: 'CONVERT_TO_COUPON', // or penalty/deduction
          pointsDelta: -totalDeduction,
          sourceType: 'donation',
          sourceId: donationId,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          note: `Retrait de ${totalDeduction} pommes suite à la suppression de l'annonce`
        };
        transaction.set(debitTxRef, debitTxData);

        return totalDeduction;
      });
    } catch (error) {
      console.warn('Failed to deduct donation apples:', error);
      return 0;
    }
  },

  // Convert Apples into Coupon (1000 pommes = 1000 Ar)
  async convertApplesToCoupon(userId: string, userName: string, pointsToConvert: number): Promise<Coupon> {
    if (pointsToConvert < 1000 || pointsToConvert % 1000 !== 0) {
      throw new Error('Le nombre de pommes à convertir doit être un multiple de 1 000.');
    }

    const faceValueAr = pointsToConvert; // 1000 pommes = 1000 Ar
    const userRef = doc(db, 'users', userId);
    const couponId = `coupon-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const eightDigitCode = this.generateEightDigitCode();
    const barcodePayload = `ZZR-${eightDigitCode}-${faceValueAr}AR`;

    try {
      const coupon = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('Utilisateur non trouvé');
        }
        const userData = userDoc.data() as UserProfile;
        const currentBalance = userData.applesCount || 0;

        if (currentBalance < pointsToConvert) {
          throw new Error('Solde de pommes insuffisant pour cette conversion.');
        }

        // Deduct points
        const newBalance = currentBalance - pointsToConvert;
        transaction.update(userRef, {
          applesCount: newBalance,
          updatedAt: new Date().toISOString()
        });

        // Record debit transaction
        const txId = `tx-conversion-${couponId}`;
        const txRef = doc(db, 'loyaltyTransactions', txId);
        const txData: LoyaltyTransaction = {
          id: txId,
          uid: userId,
          type: 'CONVERT_TO_COUPON',
          pointsDelta: -pointsToConvert,
          sourceType: 'coupon',
          sourceId: couponId,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          note: `Conversion de ${pointsToConvert} pommes en bon d'achat de ${faceValueAr.toLocaleString('fr-FR')} Ar`
        };
        transaction.set(txRef, txData);

        // Create coupon document
        const couponRef = doc(db, 'coupons', couponId);
        const newCoupon: Coupon = {
          id: couponId,
          ownerUid: userId,
          ownerName: userName,
          pointsConverted: pointsToConvert,
          faceValueAr,
          eightDigitCode,
          barcodePayload,
          status: 'CREE', // Will become 'AFFECTE_A_UNE_ENSEIGNE' or 'ACTIF'
          createdAt: new Date().toISOString(),
          // Default expiry 6 months
          expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
        };
        transaction.set(couponRef, newCoupon);

        return newCoupon;
      });

      return coupon;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `coupons/${couponId}`);
    }
  },

  // Assign Coupon to a Partner Store
  async assignCouponToPartner(couponId: string, partnerId: string, partnerName: string): Promise<void> {
    const couponRef = doc(db, 'coupons', couponId);
    try {
      await runTransaction(db, async (transaction) => {
        const cDoc = await transaction.get(couponRef);
        if (!cDoc.exists()) throw new Error('Coupon introuvable.');
        const cData = cDoc.data() as Coupon;
        if (cData.status === 'UTILISE' || cData.status === 'ANNULE') {
          throw new Error('Ce coupon ne peut plus être modifié.');
        }

        transaction.update(couponRef, {
          partnerId,
          partnerName,
          status: 'AFFECTE_A_UNE_ENSEIGNE',
          updatedAt: new Date().toISOString()
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `coupons/${couponId}`);
    }
  },

  // Convert Apples into Coupon for a specific Partner Store (min 10,000 apples)
  async convertApplesToCouponWithPartner(
    userId: string, 
    userName: string, 
    pointsToConvert: number,
    partnerId: string,
    partnerName: string
  ): Promise<Coupon> {
    if (pointsToConvert < 10000) {
      throw new Error('Le nombre minimum de pommes requis pour débloquer un bon d\'achat est de 10 000 pommes.');
    }

    const faceValueAr = pointsToConvert; // 10,000 pommes = 10,000 Ar
    const userRef = doc(db, 'users', userId);
    const couponId = `coupon-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const eightDigitCode = this.generateEightDigitCode();
    const barcodePayload = `ZZR-${eightDigitCode}-${faceValueAr}AR`;

    try {
      const coupon = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('Utilisateur non trouvé');
        }
        const userData = userDoc.data() as UserProfile;
        const currentBalance = userData.applesCount || 0;

        if (currentBalance < pointsToConvert) {
          throw new Error(`Solde de pommes insuffisant. Vous disposez de ${currentBalance.toLocaleString('fr-FR')} pommes.`);
        }

        // Deduct points
        const newBalance = currentBalance - pointsToConvert;
        transaction.update(userRef, {
          applesCount: newBalance,
          updatedAt: new Date().toISOString()
        });

        // Record debit transaction
        const txId = `tx-conversion-${couponId}`;
        const txRef = doc(db, 'loyaltyTransactions', txId);
        const txData: LoyaltyTransaction = {
          id: txId,
          uid: userId,
          type: 'CONVERT_TO_COUPON',
          pointsDelta: -pointsToConvert,
          sourceType: 'coupon',
          sourceId: couponId,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          note: `Conversion de ${pointsToConvert.toLocaleString('fr-FR')} pommes en bon d'achat pour ${partnerName}`
        };
        transaction.set(txRef, txData);

        // Create coupon document with status EN_ATTENTE_VALIDATION_MAGASIN
        const couponRef = doc(db, 'coupons', couponId);
        const newCoupon: Coupon = {
          id: couponId,
          ownerUid: userId,
          ownerName: userName,
          partnerId,
          partnerName,
          pointsConverted: pointsToConvert,
          faceValueAr,
          eightDigitCode,
          barcodePayload,
          status: 'EN_ATTENTE_VALIDATION_MAGASIN',
          createdAt: new Date().toISOString()
        };
        transaction.set(couponRef, newCoupon);

        return newCoupon;
      });

      // Notify the partner store account
      try {
        await notificationService.sendNotification({
          recipientUid: partnerId,
          type: 'coupon',
          title: `🎟️ Nouveau coupon de ${faceValueAr.toLocaleString('fr-FR')} Ar à valider !`,
          body: `Client ${userName} • Code ${eightDigitCode}. Veuillez définir la durée d'utilisation et valider le coupon.`,
          resourceType: 'coupon',
          resourceId: couponId
        });
      } catch (nErr) {
        console.warn('Could not notify store partner:', nErr);
      }

      return coupon;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `coupons/${couponId}`);
    }
  },

  // Store Partner validates pending coupon, sets validity duration and terms
  async validateCouponByPartner(
    couponId: string,
    partnerUid: string,
    storeName: string,
    validityDays: number = 90,
    termsAndConditions: string = 'Valable dans tous les rayons du magasin hors promotions en cours.'
  ): Promise<Coupon> {
    const couponRef = doc(db, 'coupons', couponId);
    try {
      const updated = await runTransaction(db, async (transaction) => {
        const cDoc = await transaction.get(couponRef);
        if (!cDoc.exists()) throw new Error('Coupon introuvable.');
        const cData = cDoc.data() as Coupon;

        if (cData.status === 'UTILISE' || cData.status === 'ANNULE') {
          throw new Error('Ce coupon a déjà été traité ou annulé.');
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000).toISOString();

        const updatedCoupon: Coupon = {
          ...cData,
          status: 'ACTIF',
          validityDays,
          termsAndConditions,
          validatedAt: now.toISOString(),
          expiresAt,
          partnerName: storeName || cData.partnerName
        };

        transaction.update(couponRef, {
          status: 'ACTIF',
          validityDays,
          termsAndConditions,
          validatedAt: now.toISOString(),
          expiresAt,
          partnerName: storeName || cData.partnerName
        });

        return updatedCoupon;
      });

      // Send notification to coupon owner
      try {
        await notificationService.sendNotification({
          recipientUid: updated.ownerUid,
          type: 'coupon',
          title: `🎉 Bon d'achat de ${updated.faceValueAr.toLocaleString('fr-FR')} Ar validé !`,
          body: `L'enseigne ${storeName || updated.partnerName} a validé votre coupon (Code : ${updated.eightDigitCode}). Valable ${validityDays} jours. Accédez à votre Coffre-fort pour l'imprimer !`,
          resourceType: 'coupon',
          resourceId: couponId
        });
      } catch (nErr) {
        console.warn('Could not notify coupon owner:', nErr);
      }

      return updated;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `coupons/${couponId}`);
    }
  },

  // Get coupons pending validation for a partner
  async getPendingCouponsForPartner(partnerId?: string): Promise<Coupon[]> {
    try {
      const q = query(
        collection(db, 'coupons'),
        where('status', '==', 'EN_ATTENTE_VALIDATION_MAGASIN')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
      if (partnerId) {
        return list.filter(c => c.partnerId === partnerId || c.partnerName?.toLowerCase().includes(partnerId.toLowerCase()));
      }
      return list;
    } catch (error) {
      console.warn('Could not fetch pending coupons for partner:', error);
      return [];
    }
  },

  // Get user loyalty transactions history
  async getUserTransactions(userId: string): Promise<LoyaltyTransaction[]> {
    const q = query(
      collection(db, 'loyaltyTransactions'),
      where('uid', '==', userId),
      orderBy('createdAt', 'desc')
    );
    try {
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as LoyaltyTransaction);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'loyaltyTransactions');
    }
  },

  // Get user coupons
  async getUserCoupons(userId: string): Promise<Coupon[]> {
    const q = query(
      collection(db, 'coupons'),
      where('ownerUid', '==', userId),
      orderBy('createdAt', 'desc')
    );
    try {
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as Coupon);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'coupons');
    }
  }
};
