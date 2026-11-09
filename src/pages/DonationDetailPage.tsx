import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Eye, 
  Heart, 
  MessageSquare, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Truck, 
  User,
  Sparkles,
  Flag,
  Star
} from 'lucide-react';
import { Donation } from '@/types';
import { donationService } from '@/services/donationService';
import { chatService } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { formatPublicationDuration } from '@/utils/dateUtils';

interface DonationDetailPageProps {
  donationId: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuthModal: () => void;
}

export const DonationDetailPage: React.FC<DonationDetailPageProps> = ({
  donationId,
  onNavigate,
  onOpenAuthModal
}) => {
  const { currentUser, userProfile } = useAuth();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [initiatingChat, setInitiatingChat] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Annonce trompeuse');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadDonation() {
      try {
        const item = await donationService.getDonationById(donationId);
        setDonation(item);
        if (item) {
          // Record view & unique interest
          await donationService.recordViewAndInterest(donationId, currentUser?.uid);
        }
      } catch (err) {
        console.error('Failed to load donation detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDonation();
  }, [donationId, currentUser?.uid]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Chargement du don en cours...</p>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Don introuvable ou archivé</h2>
        <p className="text-sm text-gray-500">Cette annonce a peut-être été récupérée ou retirée par son propriétaire.</p>
        <button
          onClick={() => onNavigate('explore')}
          className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold"
        >
          Retour aux dons
        </button>
      </div>
    );
  }

  const isOwner = currentUser?.uid === donation.ownerUid;
  const isAvailable = donation.status === 'DISPONIBLE';
  const isReserved = donation.status === 'RESERVE';
  const isRecovered = donation.status === 'RECUPERE';
  const images = donation.imageUrls && donation.imageUrls.length > 0 ? donation.imageUrls : [donation.primaryImageUrl];

  const handleStartChat = async () => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }

    if (isOwner) {
      onNavigate('dashboard', { tab: 'donations' });
      return;
    }

    setInitiatingChat(true);
    try {
      const conv = await chatService.getOrCreateConversation(
        donation,
        currentUser.uid,
        userProfile?.displayName || currentUser.displayName || 'Bénéficiaire'
      );
      if (conv && conv.id) {
        onNavigate('messages', { conversationId: conv.id });
      } else {
        alert("Impossible de créer la discussion pour le moment. Veuillez réessayer.");
      }
    } catch (err: any) {
      console.error('Failed to start chat:', err);
      alert("Une erreur s'est produite lors de l'ouverture de la messagerie : " + (err?.message || 'Erreur réseau'));
    } finally {
      setInitiatingChat(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('explore')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-emerald-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour au catalogue des dons
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Photo Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Photo Showcase */}
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-gray-900 border border-gray-200 shadow-md">
            <img
              src={images[activeImageIndex] || donation.primaryImageUrl}
              alt={donation.title}
              className="w-full h-full object-contain"
            />

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              {isAvailable && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-700 text-white shadow-md">
                  Disponible
                </span>
              )}
              {isReserved && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-md">
                  Réservé
                </span>
              )}
              {isRecovered && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-gray-700 text-white shadow-md">
                  Don récupéré
                </span>
              )}
            </div>

            {/* Condition Score */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
              État : {donation.conditionScore}/10
            </div>

            {/* Navigation arrows if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails list (supports up to 20 images) */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    idx === activeImageIndex
                      ? 'border-emerald-600 ring-2 ring-emerald-500/40 scale-102'
                      : 'border-gray-200 hover:border-gray-300 opacity-80'
                  }`}
                >
                  <img src={img} alt={`Miniature ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Handover & Location Safeguard Notice */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Protection de la vie privée & sécurité
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Pour des raisons de sécurité, l'adresse exacte du domicile du donateur et son numéro de téléphone ne sont jamais publiés en ligne. Les coordonnées précises de rendez-vous sont transmises uniquement lors de la réservation validée dans la messagerie sécurisée.
            </p>
          </div>
        </div>

        {/* Right Column: Donation Information & CTA */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            
            {/* Title & Category */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {donation.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                  <Eye className="w-3.5 h-3.5" />
                  {donation.viewsCount || 0} consultations
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {donation.title}
              </h1>

              {/* Publication Duration Badge */}
              <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-xl w-fit mt-2">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{formatPublicationDuration(donation.createdAt)}</span>
              </div>
            </div>

            {/* Condition Gauge */}
            <div className="space-y-1.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>État de l'objet :</span>
                <span className="text-emerald-800 font-extrabold">{donation.conditionScore} / 10</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${(donation.conditionScore / 10) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>À bricoler (0-3)</span>
                <span>Bon état (4-7)</span>
                <span>Comme neuf (8-10)</span>
              </div>
            </div>

            {/* Location & Handover */}
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-semibold">{donation.city}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{donation.fokontany}</span>
              </div>

              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Mode de remise :</span>
                <span className="font-semibold text-gray-900">
                  {donation.handoverMode === 'pickup'
                    ? 'À récupérer par le bénéficiaire sur place'
                    : donation.handoverMode === 'delivery'
                    ? 'Livraison possible par le donateur'
                    : 'À convenir ensemble par messagerie'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Description détaillée
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {donation.description}
              </p>
            </div>

            {/* Special Instructions */}
            {donation.specialInstructions && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900">
                <span className="font-bold">Précisions du donateur :</span> {donation.specialInstructions}
              </div>
            )}

            {/* Donor Public Profile Card */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={donation.ownerPhotoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${donation.ownerDisplayName}`}
                  alt={donation.ownerDisplayName}
                  className="w-11 h-11 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <div className="font-bold text-sm text-gray-900">{donation.ownerDisplayName}</div>
                  <div className="text-xs text-gray-500">{donation.city} • Donateur engagé</div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 block w-fit ml-auto">
                  Membre vérifié
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>5.0 / 5 (Évaluations)</span>
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3 pt-2">
              {isOwner ? (
                <button
                  onClick={() => onNavigate('dashboard', { tab: 'donations' })}
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer text-center"
                >
                  Gérer ma publication dans mon tableau de bord
                </button>
              ) : isAvailable ? (
                <button
                  onClick={handleStartChat}
                  disabled={initiatingChat}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  {initiatingChat ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 text-amber-300" />
                      <span>Discuter avec le donateur</span>
                    </>
                  )}
                </button>
              ) : isReserved ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-1">
                  <div className="text-sm font-bold text-amber-900">
                    Ce don fait actuellement l'objet d'une réservation
                  </div>
                  <p className="text-xs text-amber-700">
                    La remise est en cours entre le donateur et le bénéficiaire désigné.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-gray-100 border border-gray-200 rounded-2xl text-center text-sm font-bold text-gray-600">
                  Don déjà récupéré avec succès
                </div>
              )}

              {/* Share & Report Buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleShare}
                  className="text-xs font-semibold text-gray-600 hover:text-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Lien copié dans le presse-papier !' : 'Partager l’annonce'}</span>
                </button>

                <button
                  onClick={() => setReportModalOpen(true)}
                  className="text-xs font-semibold text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Signaler un abus</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Signaler cette publication
            </h3>
            {reportSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-gray-900">Signalement transmis à l'équipe de modération</p>
                <p className="text-xs text-gray-500">Merci de contribuer à la sécurité et à l'intégrité de la communauté Zarazarao.</p>
                <button
                  onClick={() => { setReportModalOpen(false); setReportSubmitted(false); }}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-600">
                  Pour quel motif souhaitez-vous signaler l'annonce « {donation.title} » ?
                </p>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                >
                  <option value="Annonce trompeuse ou fausse photo">Annonce trompeuse ou fausse photo</option>
                  <option value="Demande d'argent ou vente déguisée">Demande d'argent ou vente déguisée (Interdit)</option>
                  <option value="Objet interdit ou dangereux">Objet interdit ou dangereux</option>
                  <option value="Harcèlement ou propos inappropriés">Harcèlement ou propos inappropriés</option>
                  <option value="Autre motif">Autre motif</option>
                </select>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => setReportSubmitted(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Confirmer le signalement
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
