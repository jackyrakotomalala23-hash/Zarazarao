import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Coupon, Partner } from '@/types';
import { INITIAL_PARTNERS } from '@/config/constants';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';

export interface CouponVerificationResult {
  valid: boolean;
  coupon?: Coupon;
  message: string;
}

export const partnerService = {
  // Get active partner stores
  async getPartners(): Promise<Partner[]> {
    try {
      const snap = await getDocs(collection(db, 'partners'));
      if (snap.empty) {
        // Initialize default partners if collection empty
        for (const p of INITIAL_PARTNERS) {
          await setDoc(doc(db, 'partners', p.id), p);
        }
        return INITIAL_PARTNERS;
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Partner));
    } catch (error) {
      console.warn('Could not fetch partners from Firestore, returning initial partners:', error);
      return INITIAL_PARTNERS;
    }
  },

  // Verify an 8-digit coupon code
  async verifyCouponCode(eightDigitCode: string): Promise<CouponVerificationResult> {
    const cleanCode = eightDigitCode.trim();
    if (!cleanCode || cleanCode.length !== 8) {
      return {
        valid: false,
        message: 'Le code coupon doit être composé exactement de 8 chiffres.'
      };
    }

    try {
      const q = query(
        collection(db, 'coupons'),
        where('eightDigitCode', '==', cleanCode)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        return {
          valid: false,
          message: 'Code coupon invalide ou inexistant dans le registre Zarazarao.'
        };
      }

      const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;

      if (coupon.status === 'UTILISE') {
        return {
          valid: false,
          coupon,
          message: `Ce coupon a déjà été utilisé le ${coupon.usedAt ? new Date(coupon.usedAt).toLocaleDateString('fr-FR') : ''} chez ${coupon.usedInStoreName || 'un magasin partenaire'}.`
        };
      }

      if (coupon.status === 'EXPIRE' || (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())) {
        return {
          valid: false,
          coupon,
          message: 'Ce coupon a expiré et ne peut plus être accepté en caisse.'
        };
      }

      if (coupon.status === 'ANNULE') {
        return {
          valid: false,
          coupon,
          message: 'Ce coupon a été annulé par son titulaire ou par l’administration.'
        };
      }

      return {
        valid: true,
        coupon,
        message: `Coupon valide pour une valeur de ${coupon.faceValueAr.toLocaleString('fr-FR')} Ar !`
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'coupons');
    }
  },

  // Redeem coupon in store by cashier
  async redeemCouponInStore(
    couponId: string,
    partnerUid: string,
    storeName: string
  ): Promise<{ success: boolean; coupon: Coupon }> {
    const couponRef = doc(db, 'coupons', couponId);

    try {
      const updatedCoupon = await runTransaction(db, async (transaction) => {
        const cSnap = await transaction.get(couponRef);
        if (!cSnap.exists()) {
          throw new Error('Coupon introuvable.');
        }
        const coupon = cSnap.data() as Coupon;

        if (coupon.status === 'UTILISE') {
          throw new Error('Ce coupon a déjà été utilisé.');
        }

        const now = new Date().toISOString();
        const finalCoupon: Coupon = {
          ...coupon,
          status: 'UTILISE',
          usedAt: now,
          usedByPartnerUid: partnerUid,
          usedInStoreName: storeName
        };

        transaction.update(couponRef, {
          status: 'UTILISE',
          usedAt: now,
          usedByPartnerUid: partnerUid,
          usedInStoreName: storeName
        });

        // Audit log
        const logRef = doc(db, 'auditLogs', `log-redeem-${couponId}-${Date.now()}`);
        transaction.set(logRef, {
          actorUid: partnerUid,
          actionType: 'COUPON_REDEMPTION',
          resourceType: 'coupon',
          resourceId: couponId,
          faceValueAr: coupon.faceValueAr,
          storeName,
          createdAt: now
        });

        return finalCoupon;
      });

      return { success: true, coupon: updatedCoupon };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `coupons/${couponId}`);
    }
  }
};
