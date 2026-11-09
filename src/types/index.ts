export type UserRole = 'user' | 'partner' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  coverURL?: string;
  bio?: string;
  birthDate?: string;
  phoneNumber?: string;
  exactAddress?: string;
  city: string;
  fokontany?: string;
  role: UserRole;
  applesCount: number;
  profileCompletionStatus: boolean;
  signupBonusAwarded: boolean;
  firstDonationBonusAwarded: boolean;
  mfaEnabled?: boolean;
  mfaPhoneNumber?: string;
  privacySettings?: {
    showPhone: boolean;
    showLocation: boolean;
    showBio: boolean;
  };
  alertCity?: string;
  savedCategories?: string[];
  notifyNewDonations?: boolean;
  averageRating?: number;
  reviewsCount?: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SearchSubscription {
  id: string;
  uid: string;
  searchQuery: string;
  category?: string;
  city?: string;
  createdAt: string;
}

export interface UserPrivateInfo {
  phoneNumber?: string;
  email?: string;
  address?: string;
  verifiedPhoneStatus: boolean;
  verifiedEmailStatus: boolean;
  notificationPreferences?: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
  };
}

export type DonationStatus = 'DISPONIBLE' | 'RESERVE' | 'RECUPERE' | 'INDISPONIBLE' | 'ARCHIVE';

export type HandoverMode = 'pickup' | 'delivery' | 'discuss';

export interface Donation {
  id: string;
  ownerUid: string;
  ownerDisplayName: string;
  ownerPhotoURL?: string;
  title: string;
  description: string;
  category: string;
  conditionScore: number; // 0 to 10
  imageUrls: string[];
  primaryImageUrl: string;
  city: string;
  fokontany: string;
  handoverMode: HandoverMode;
  estUrgent: boolean;
  specialInstructions?: string;
  status: DonationStatus;
  viewsCount: number;
  uniqueInterestsCount: number;
  conversationsCount: number;
  reservedForUid?: string;
  reservedForName?: string;
  reservedAt?: string;
  reservedByDonor?: boolean;
  acceptedByBeneficiary?: boolean;
  deliveredByDonor?: boolean;
  acceptedAt?: string;
  deliveredAt?: string;
  recoveredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DonationInterest {
  id: string;
  donationId: string;
  viewerUid: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  donationId: string;
  donationTitle: string;
  donationImage: string;
  donorUid: string;
  donorName: string;
  beneficiaryUid: string;
  beneficiaryName: string;
  participantUids: string[];
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCountDonor?: number;
  unreadCountBeneficiary?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUid: string;
  senderName: string;
  text: string;
  mediaUrls?: string[];
  systemEventType?: 'RESERVATION_CREATED' | 'RESERVATION_CANCELLED' | 'RESERVATION_ACCEPTED' | 'DONATION_DELIVERED' | 'DONATION_RECOVERED' | 'DONATION_AVAILABLE' | 'WHATSAPP_CALL';
  createdAt: string;
}

export interface Reservation {
  id: string;
  donationId: string;
  donationTitle: string;
  donorUid: string;
  beneficiaryUid: string;
  conversationId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'CONFIRMED';
  cancellationReason?: string;
  cancellationActorUid?: string;
  createdAt: string;
  recoveredAt?: string;
}

export interface InAppNotification {
  id: string;
  recipientUid: string;
  type: 'message' | 'interest' | 'reservation' | 'donation_recovered' | 'loyalty' | 'coupon' | 'security' | 'donation_alert';
  title: string;
  body: string;
  resourceType?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
}

export type LoyaltyTransactionType = 
  | 'SIGNUP_BONUS'
  | 'PROFILE_BONUS'
  | 'FIRST_DONATION_BONUS'
  | 'RANDOM_DONATION_REWARD'
  | 'CONVERT_TO_COUPON'
  | 'ADMIN_ADJUSTMENT';

export interface LoyaltyTransaction {
  id: string;
  uid: string;
  type: LoyaltyTransactionType;
  pointsDelta: number;
  sourceType?: string;
  sourceId?: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
  note?: string;
}

export type CouponStatus = 
  | 'CREE'
  | 'EN_ATTENTE_VALIDATION_MAGASIN'
  | 'ACTIF'
  | 'AFFECTE_A_UNE_ENSEIGNE'
  | 'UTILISE'
  | 'EXPIRE'
  | 'ANNULE';

export interface Coupon {
  id: string;
  ownerUid: string;
  ownerName: string;
  partnerId?: string;
  partnerName?: string;
  pointsConverted: number;
  faceValueAr: number;
  eightDigitCode: string;
  barcodePayload: string;
  status: CouponStatus;
  validityDays?: number;
  termsAndConditions?: string;
  validatedAt?: string;
  createdAt: string;
  expiresAt?: string;
  usedAt?: string;
  usedByPartnerUid?: string;
  usedInStoreName?: string;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl?: string;
  city: string;
  address: string;
  phone: string;
  status: 'ACTIF' | 'EN_ATTENTE';
  terms: string;
  minCouponValueAr: number;
  createdAt: string;
}

export interface ModerationReport {
  id: string;
  reporterUid: string;
  reportedType: 'donation' | 'user' | 'message';
  reportedId: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string;
  description: string;
}
