import React, { useEffect, useRef, useState } from 'react';
import { 
  Send, 
  Smile, 
  Phone, 
  Video, 
  ArrowLeft, 
  CheckCircle2, 
  Package, 
  ShieldCheck,
  PhoneOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { donationService } from '@/services/donationService';
import { reviewService } from '@/services/reviewService';
import { EmojiPickerModal } from '@/components/common/EmojiPickerModal';
import { Conversation, Donation, Message } from '@/types';

interface MessagingPageProps {
  initialConversationId?: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuthModal: () => void;
}

export const MessagingPage: React.FC<MessagingPageProps> = ({
  initialConversationId,
  onNavigate,
  onOpenAuthModal
}) => {
  const { currentUser, userProfile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [linkedDonation, setLinkedDonation] = useState<Donation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [sending, setSending] = useState(false);
  const [targetProfile, setTargetProfile] = useState<any>(null);

  // Missing Phone Modal State
  const [missingPhoneModalOpen, setMissingPhoneModalOpen] = useState(false);
  const [missingPhoneUser, setMissingPhoneUser] = useState<'me' | 'other' | 'both'>('me');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [emojiModalOpen, setEmojiModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    async function fetchConvs() {
      if (!currentUser) return;
      try {
        const list = await chatService.getUserConversations(currentUser.uid);
        setConversations(list);
        if (initialConversationId) {
          const match = list.find(c => c.id === initialConversationId);
          if (match) setActiveConv(match);
          else if (list.length > 0) setActiveConv(list[0]);
        } else if (list.length > 0) {
          setActiveConv(list[0]);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setLoadingConv(false);
      }
    }
    fetchConvs();
  }, [currentUser, initialConversationId]);

  // Load active conversation messages, linked donation & target profile
  useEffect(() => {
    if (!activeConv || !currentUser) return;

    // Fetch linked donation
    donationService.getDonationById(activeConv.donationId).then(setLinkedDonation);

    // Fetch target profile
    const targetUid = activeConv.donorUid === currentUser.uid ? activeConv.beneficiaryUid : activeConv.donorUid;
    import('@/services/userService').then(({ userService }) => {
      userService.getUserProfile(targetUid).then(setTargetProfile).catch(console.warn);
    });

    // Subscribe to messages
    const unsubscribe = chatService.subscribeToMessages(
      activeConv.id,
      (msgs) => {
        setMessages(msgs);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    );

    return () => unsubscribe();
  }, [activeConv, currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-3xl">
          💬
        </div>
        <h2 className="text-xl font-bold text-gray-900">Connectez-vous à la messagerie</h2>
        <p className="text-sm text-gray-500">
          Échangez en temps réel avec les donateurs et organisez la remise sécurisée de vos dons.
        </p>
        <button
          onClick={onOpenAuthModal}
          className="px-6 py-2.5 bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const isDonor = activeConv?.donorUid === currentUser.uid;
  const isBeneficiary = activeConv?.beneficiaryUid === currentUser.uid;
  const isAvailable = linkedDonation?.status === 'DISPONIBLE';
  const isReserved = linkedDonation?.status === 'RESERVE';
  const isRecovered = linkedDonation?.status === 'RECUPERE';
  const isAccepted = linkedDonation?.acceptedByBeneficiary;
  const isDelivered = linkedDonation?.deliveredByDonor;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConv || !inputText.trim() || sending) return;

    setSending(true);
    const textToSend = inputText.trim();
    setInputText('');

    try {
      await chatService.sendMessage(
        activeConv.id,
        currentUser.uid,
        userProfile?.displayName || currentUser.displayName || 'Utilisateur',
        textToSend
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const getCleanErrorMessage = (err: any): string => {
    const msg = err?.message || String(err);
    if (msg.includes('Missing or insufficient permissions')) {
      return 'Erreur de permissions (règles de sécurité Firestore).';
    }
    return msg;
  };

  // WhatsApp Call launcher
  const handleWhatsAppCall = (type: 'audio' | 'video') => {
    if (!activeConv || !currentUser) return;

    const myPhone = userProfile?.phoneNumber?.trim();
    const otherPhone = targetProfile?.phoneNumber?.trim();

    const hasMyPhone = !!(myPhone && myPhone.length >= 8);
    const hasOtherPhone = !!(otherPhone && otherPhone.length >= 8);

    if (!hasMyPhone || !hasOtherPhone) {
      if (!hasMyPhone && !hasOtherPhone) setMissingPhoneUser('both');
      else if (!hasMyPhone) setMissingPhoneUser('me');
      else setMissingPhoneUser('other');
      setMissingPhoneModalOpen(true);
      return;
    }

    const cleanPhone = otherPhone.replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(
      `Bonjour ${isDonor ? activeConv.beneficiaryName : activeConv.donorName}, je vous contacte depuis Zarazarao au sujet du don « ${linkedDonation?.title || activeConv.donationTitle} ».`
    );
    const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

    window.open(waUrl, '_blank');

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString('fr-FR');
    chatService.sendSystemMessage(
      activeConv.id,
      'WHATSAPP_CALL',
      `📞 Appel WhatsApp ${type === 'video' ? 'vidéo' : 'vocal'} émis le ${dateStr} à ${timeStr} • Numéros (${myPhone} ↔ ${otherPhone})`
    ).catch(console.warn);
  };

  // Donor reserves donation for this conversation's beneficiary
  const handleReserveDonation = async () => {
    if (!linkedDonation || !activeConv) return;
    const confirmed = window.confirm(
      `Voulez-vous réserver ce don (« ${linkedDonation.title} ») pour ${activeConv.beneficiaryName} ?`
    );
    if (!confirmed) return;

    try {
      await donationService.reserveDonation(
        linkedDonation.id,
        currentUser.uid,
        activeConv.beneficiaryUid,
        activeConv.beneficiaryName,
        activeConv.id
      );
      const updated = await donationService.getDonationById(linkedDonation.id);
      setLinkedDonation(updated);
    } catch (err: any) {
      alert(getCleanErrorMessage(err));
    }
  };

  // Beneficiary accepts reservation
  const handleAcceptReservation = async () => {
    if (!linkedDonation || !activeConv) return;
    const confirmed = window.confirm(`Voulez-vous accepter la réservation pour « ${linkedDonation.title} » ?`);
    if (!confirmed) return;

    try {
      await donationService.acceptDonationByBeneficiary(
        linkedDonation.id,
        currentUser.uid,
        activeConv.id
      );
      const updated = await donationService.getDonationById(linkedDonation.id);
      setLinkedDonation(updated);
    } catch (err: any) {
      alert(getCleanErrorMessage(err));
    }
  };

  // Cancel reservation
  const handleCancelReservation = async () => {
    if (!linkedDonation || !activeConv) return;
    const confirmed = window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?');
    if (!confirmed) return;

    try {
      await donationService.cancelReservation(
        linkedDonation.id,
        currentUser.uid,
        userProfile?.displayName || 'Membre',
        activeConv.id,
        'Annulation par l’utilisateur'
      );
      const updated = await donationService.getDonationById(linkedDonation.id);
      setLinkedDonation(updated);
    } catch (err: any) {
      alert(getCleanErrorMessage(err));
    }
  };

  // Donor marks donation as delivered
  const handleMarkAsDelivered = async () => {
    if (!linkedDonation || !activeConv) return;
    const confirmed = window.confirm(`Marquer ce don (« ${linkedDonation.title} ») comme livré et remis ?`);
    if (!confirmed) return;

    try {
      await donationService.markAsDelivered(
        linkedDonation.id,
        currentUser.uid,
        activeConv.id
      );
      const updated = await donationService.getDonationById(linkedDonation.id);
      setLinkedDonation(updated);
    } catch (err: any) {
      alert(getCleanErrorMessage(err));
    }
  };

  // Beneficiary confirms reception
  const handleConfirmReceived = async () => {
    if (!linkedDonation || !activeConv) return;
    const confirmed = window.confirm(
      `Confirmez-vous avoir bien reçu l'objet « ${linkedDonation.title} » auprès du donateur ?`
    );
    if (!confirmed) return;

    try {
      await donationService.confirmDonationReceived(
        linkedDonation.id,
        currentUser.uid,
        activeConv.id
      );
      const updated = await donationService.getDonationById(linkedDonation.id);
      setLinkedDonation(updated);
      setReviewModalOpen(true);
    } catch (err: any) {
      alert(getCleanErrorMessage(err));
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedDonation || !activeConv) return;
    try {
      await reviewService.addReview({
        donorUid: activeConv.donorUid,
        beneficiaryUid: currentUser.uid,
        beneficiaryName: userProfile?.displayName || currentUser.displayName || 'Bénéficiaire',
        donationId: linkedDonation.id,
        donationTitle: linkedDonation.title,
        rating,
        comment
      });
      setReviewSubmitted(true);
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSubmitted(false);
      }, 1500);
    } catch (err: any) {
      alert(getCleanErrorMessage(err));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden h-[82vh] flex flex-col md:flex-row">
        
        {/* LEFT PANEL: Conversations list */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-black text-gray-900">Messagerie Zarazarao</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {conversations.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2 text-gray-500 text-xs">
                <p>Aucune conversation pour le moment.</p>
                <p>Ouvrez une annonce pour discuter avec un donateur.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                const otherPartyName = isDonor ? conv.beneficiaryName : conv.donorName;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`p-4 cursor-pointer transition-colors flex items-center gap-3 ${
                      isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={conv.donationImage || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=150&q=80'}
                      alt={conv.donationTitle}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-bold text-xs text-gray-900 truncate">
                          {otherPartyName}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-800 truncate">
                        {conv.donationTitle}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate mt-0.5">
                        {conv.lastMessagePreview || 'Discussion initiée'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Chat discussion & Actions */}
        {activeConv ? (
          <div className="flex-1 flex flex-col h-full bg-[#f8faf7] relative">
            
            {/* Conversation Header */}
            <div className="p-4 bg-white border-b border-gray-200/80 flex items-center justify-between shrink-0 shadow-2xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConv(null)}
                  className="md:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <img
                  src={activeConv.donationImage}
                  alt={activeConv.donationTitle}
                  className="w-11 h-11 rounded-xl object-cover shrink-0"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-gray-900 truncate max-w-xs sm:max-w-md">
                      {activeConv.donationTitle}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : isReserved
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {linkedDonation?.status || 'Disponible'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Interlocuteur : <strong>{isDonor ? activeConv.beneficiaryName : activeConv.donorName}</strong>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Call Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleWhatsAppCall('audio')}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition-colors flex items-center gap-1 text-xs cursor-pointer shadow-2xs"
                  title="Appeler via WhatsApp Vocal"
                >
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span className="hidden sm:inline">Vocal WhatsApp</span>
                </button>
                <button
                  onClick={() => handleWhatsAppCall('video')}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition-colors flex items-center gap-1 text-xs cursor-pointer shadow-2xs"
                  title="Appeler via WhatsApp Vidéo"
                >
                  <Video className="w-4 h-4 text-emerald-700" />
                  <span className="hidden sm:inline">Vidéo WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Revocable Multi-Step Handover Tracking Banner */}
            <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-950 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {isAvailable && isDonor && 'Vous pouvez réserver cet objet pour cet interlocuteur.'}
                  {isAvailable && !isDonor && 'En attente d’une réservation du donateur.'}
                  {isReserved && !isAccepted && isDonor && 'Objet réservé. En attente d’acceptation par le bénéficiaire.'}
                  {isReserved && !isAccepted && isBeneficiary && '🎉 Le donateur vous a réservé ce don ! Acceptez la réservation.'}
                  {isReserved && isAccepted && !isDelivered && isDonor && '✅ Réservation acceptée ! Vous pouvez effectuer la remise et marquer comme livré.'}
                  {isReserved && isAccepted && !isDelivered && isBeneficiary && 'Réservation acceptée. En attente de la livraison par le donateur.'}
                  {isReserved && isDelivered && isDonor && '🚚 Vous avez marqué ce don comme livré. En attente de confirmation finale.'}
                  {isReserved && isDelivered && isBeneficiary && '🚚 Le donateur a marqué le don comme livré ! Confirmez la réception.'}
                  {isRecovered && '✨ Don transmis et réception confirmée ! Merci pour votre solidarité Fihavanana.'}
                </span>
              </div>

              {/* Action Buttons State Machine */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* 1. Donor reserves donation */}
                {isDonor && isAvailable && (
                  <button
                    onClick={handleReserveDonation}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    Réserver pour ce bénéficiaire
                  </button>
                )}

                {/* 2. Beneficiary accepts reservation */}
                {isBeneficiary && isReserved && !isAccepted && (
                  <button
                    onClick={handleAcceptReservation}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1 cursor-pointer animate-pulse"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Accepter la réservation</span>
                  </button>
                )}

                {/* 3. Donor marks as delivered */}
                {isDonor && isReserved && isAccepted && (
                  <button
                    onClick={handleMarkAsDelivered}
                    className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isDelivered ? 'Don marqué livré (Mis à jour)' : 'Marquer comme livré'}</span>
                  </button>
                )}

                {/* 4. Beneficiary confirms reception */}
                {isBeneficiary && isReserved && isDelivered && (
                  <button
                    onClick={handleConfirmReceived}
                    className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Oui, j'ai bien reçu l'objet</span>
                  </button>
                )}

                {/* Review button */}
                {isRecovered && isBeneficiary && (
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    ⭐ Noter le donateur
                  </button>
                )}

                {/* Revocable cancel reservation button available until final confirmation */}
                {isReserved && (isDonor || isBeneficiary) && (
                  <button
                    onClick={handleCancelReservation}
                    className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 font-semibold rounded-xl text-[11px] transition-colors cursor-pointer"
                  >
                    Annuler la réservation
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages Flow */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.senderUid === currentUser.uid;
                const isSystem = msg.senderUid === 'system_zarazarao' || msg.systemEventType;

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <div className="max-w-md bg-emerald-100/80 border border-emerald-200/90 text-emerald-950 px-4 py-2 rounded-2xl text-xs text-center font-medium shadow-2xs">
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="text-[10px] text-gray-400 mb-0.5 px-1 font-medium">
                      {isMe ? 'Vous' : msg.senderName}
                    </div>
                    <div
                      className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-emerald-700 text-white rounded-br-xs'
                          : 'bg-white text-gray-900 border border-gray-200/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="text-[9px] text-gray-400 mt-0.5 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick emoji reaction bar */}
            <div className="px-4 py-1.5 bg-white/80 border-t border-gray-100 flex items-center gap-2 text-sm">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Réaction :</span>
              {['❤️', '👍', '🙏', '🍎', '🎉', '😊', '👌'].map((em) => (
                <button
                  key={em}
                  onClick={() => handleQuickEmoji(em)}
                  className="hover:scale-125 transition-transform cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEmojiModalOpen(true)}
                className="p-2.5 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded-xl transition-colors shrink-0 cursor-pointer"
                title="Ouvrir la banque d'émojis"
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="p-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-2xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center p-8 text-center text-gray-400">
            <div>
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">Sélectionnez une conversation pour échanger</p>
            </div>
          </div>
        )}

      </div>

      {/* Missing Phone Number Alert Modal */}
      {missingPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-emerald-100 text-gray-900">
            <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              📱
            </div>
            
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-gray-900">Numéro de Téléphone Requis</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {missingPhoneUser === 'me' && (
                  <>Pour effectuer des appels WhatsApp directs, vous devez d'abord ajouter votre numéro de téléphone dans votre profil Zarazarao.</>
                )}
                {missingPhoneUser === 'other' && (
                  <>L'interlocuteur (<strong>{isDonor ? activeConv?.beneficiaryName : activeConv?.donorName}</strong>) n'a pas encore renseigné son numéro de téléphone mobile dans son profil.</>
                )}
                {missingPhoneUser === 'both' && (
                  <>Un numéro de téléphone valide enregistré dans les profils respectifs est requis pour passer des appels WhatsApp.</>
                )}
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <p className="font-bold text-emerald-950">💡 Pourquoi cette mesure ?</p>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                La mise en relation WhatsApp s'appuie directement sur les numéros vérifiés des profils pour garantir la sécurité et la traçabilité des échanges solidaire.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMissingPhoneModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Fermer
              </button>

              {(missingPhoneUser === 'me' || missingPhoneUser === 'both') && (
                <button
                  type="button"
                  onClick={() => {
                    setMissingPhoneModalOpen(false);
                    onNavigate('profile');
                  }}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Compléter mon profil
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100">
            {reviewSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-2xl">
                  ⭐
                </div>
                <h3 className="text-lg font-black text-gray-900">Merci pour votre avis !</h3>
                <p className="text-xs text-gray-600">Votre évaluation a bien été publiée sur le profil du donateur.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-gray-900">Évaluer le donateur</h3>
                  <p className="text-xs text-gray-500">Partagez votre ressenti sur cet échange solidaire Fihavanana.</p>
                </div>

                <div className="flex justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-transform hover:scale-110 cursor-pointer ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Commentaire (public sur le profil) :</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ex: Personne très ponctuelle, aimable et généreuse. Misaotra betsaka !"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Ignorer
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Publier l'avis
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Emoji Picker Bank Modal */}
      <EmojiPickerModal
        isOpen={emojiModalOpen}
        onClose={() => setEmojiModalOpen(false)}
        onSelectEmoji={handleQuickEmoji}
      />

    </div>
  );
};
