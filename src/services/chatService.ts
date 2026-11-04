import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Conversation, Donation, Message } from '@/types';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';

export const chatService = {
  // Get or initiate a conversation between donor and potential beneficiary
  async getOrCreateConversation(
    donation: Donation,
    beneficiaryUid: string,
    beneficiaryName: string
  ): Promise<Conversation> {
    const conversationId = `conv_${donation.id}_${beneficiaryUid}`;
    const convRef = doc(db, 'conversations', conversationId);

    try {
      const snap = await getDoc(convRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Conversation;
      }

      const now = new Date().toISOString();
      const newConv: Conversation = {
        id: conversationId,
        donationId: donation.id,
        donationTitle: donation.title,
        donationImage: donation.primaryImageUrl || donation.imageUrls[0] || '',
        donorUid: donation.ownerUid,
        donorName: donation.ownerDisplayName,
        beneficiaryUid,
        beneficiaryName,
        participantUids: [donation.ownerUid, beneficiaryUid],
        status: 'ACTIVE',
        lastMessagePreview: `Discussion initiée pour : ${donation.title}`,
        lastMessageAt: now,
        unreadCountDonor: 0,
        unreadCountBeneficiary: 0,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(convRef, newConv);

      // Create initial system message
      await this.sendSystemMessage(
        conversationId,
        'DONATION_AVAILABLE',
        `👋 ${beneficiaryName} a manifesté son intérêt pour le don « ${donation.title} ». Vous pouvez échanger ici sur les détails de remise.`
      );

      return newConv;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${conversationId}`);
    }
  },

  // Get user's active conversations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participantUids', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'conversations');
    }
  },

  // Subscribe to real-time conversation messages
  subscribeToMessages(
    conversationId: string,
    onMessages: (messages: Message[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        onMessages(msgs);
      },
      (error) => {
        if (onError) onError(error);
        else handleFirestoreError(error, OperationType.GET, `conversations/${conversationId}/messages`);
      }
    );
  },

  // Send a chat message
  async sendMessage(
    conversationId: string,
    senderUid: string,
    senderName: string,
    text: string,
    mediaUrls?: string[]
  ): Promise<Message> {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    const convRef = doc(db, 'conversations', conversationId);
    const now = new Date().toISOString();

    const newMessage: Message = {
      id: messageId,
      conversationId,
      senderUid,
      senderName,
      text: text.trim(),
      mediaUrls: mediaUrls || [],
      createdAt: now
    };

    try {
      await setDoc(msgRef, newMessage);
      await updateDoc(convRef, {
        lastMessagePreview: text.trim().substring(0, 70),
        lastMessageAt: now,
        updatedAt: now
      });
      return newMessage;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${conversationId}/messages/${messageId}`);
    }
  },

  // Send a backend system audit message inside a conversation
  async sendSystemMessage(
    conversationId: string,
    systemEventType: Message['systemEventType'],
    text: string
  ): Promise<void> {
    const messageId = `sys-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    const now = new Date().toISOString();

    const sysMsg: Message = {
      id: messageId,
      conversationId,
      senderUid: 'system_zarazarao',
      senderName: 'Zarazarao',
      text,
      systemEventType,
      createdAt: now
    };

    try {
      await setDoc(msgRef, sysMsg);
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        lastMessagePreview: text.substring(0, 60),
        lastMessageAt: now,
        updatedAt: now
      });
    } catch (error) {
      console.warn('System message error:', error);
    }
  }
};
