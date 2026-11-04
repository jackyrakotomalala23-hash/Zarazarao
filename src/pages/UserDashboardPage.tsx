import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, 
  Layers, 
  Award, 
  Gift, 
  Store, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Download, 
  ArrowRight, 
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Package,
  Sparkles,
  Bell,
  Sliders,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { donationService } from '@/services/donationService';
import { loyaltyService } from '@/services/loyaltyService';
import { partnerService } from '@/services/partnerService';
import { notificationService } from '@/services/notificationService';
import { CATEGORIES, MADAGASCAR_CITIES } from '@/config/constants';
import { Coupon, Donation, LoyaltyTransaction, Partner } from '@/types';
import { AppleBadge } from '@/components/common/AppleBadge';
import { BarcodeSvg } from '@/components/common/BarcodeSvg';
import { ProfileManagementPage } from '@/pages/ProfileManagementPage';
import { ApplesConversionModal } from '@/components/loyalty/ApplesConversionModal';

interface UserDashboardPageProps {
  initialTab?: 'overview' | 'profile' | 'donations' | 'reservations' | 'apples' | 'vault' | 'alerts';
  onNavigate: (page: string, params?: any) => void;
  onOpenAuthModal: () => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  initialTab = 'overview',
  onNavigate,
  onOpenAuthModal
}) => {
  const { currentUser, userProfile, updateUserProfileData, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Data states
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [myReservations, setMyReservations] = useState<Donation[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponFilter, setCouponFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'USED' | 'EXPIRED'>('ALL');

  // Conversion state
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [conversionAmount, setConversionAmount] = useState<number>(10000); // 10 000 pommes = 10 000 Ar
  const [converting, setConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Partner store selection modal
  const [selectedCouponForStore, setSelectedCouponForStore] = useState<Coupon | null>(null);
  const [assigningStore, setAssigningStore] = useState(false);

  // Printable coupon modal
  const [voucherModalCoupon, setVoucherModalCoupon] = useState<Coupon | null>(null);

  // Profile edit state
  const [editFirstName, setEditFirstName] = useState(userProfile?.firstName || '');
  const [editLastName, setEditLastName] = useState(userProfile?.lastName || '');
  const [editCity, setEditCity] = useState(userProfile?.city || 'Antananarivo');
  const [editFokontany, setEditFokontany] = useState(userProfile?.fokontany || '');

  // Alert preferences state
  const [alertCity, setAlertCity] = useState(userProfile?.alertCity || userProfile?.city || 'Antananarivo');
  const [savedCategories, setSavedCategories] = useState<string[]>(
    userProfile?.savedCategories && userProfile.savedCategories.length > 0
      ? userProfile.savedCategories
      : ['Mobilier', 'Informatique et téléphonie', 'Livres et fournitures']
  );
  const [notifyNewDonations, setNotifyNewDonations] = useState(userProfile?.notifyNewDonations !== false);
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [alertSavedMsg, setAlertSavedMsg] = useState<string | null>(null);

  const handleSaveAlertPreferences = async () => {
    if (!currentUser) return;
    setSavingAlerts(true);
    setAlertSavedMsg(null);
    try {
      await notificationService.saveAlertPreferences(currentUser.uid, alertCity, savedCategories, notifyNewDonations);
      await refreshProfile();
      setAlertSavedMsg('Préférences d’alertes enregistrées avec succès !');
      setTimeout(() => setAlertSavedMsg(null), 3500);
    } catch (err) {
      console.error('Error saving alert preferences:', err);
    } finally {
      setSavingAlerts(false);
    }
  };

  const toggleCategory = (catName: string) => {
    setSavedCategories(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  const loadAllUserData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [dons, resv, txs, cps, pts] = await Promise.all([
        donationService.getUserDonations(currentUser.uid),
        donationService.getUserReservations(currentUser.uid),
        loyaltyService.getUserTransactions(currentUser.uid),
        loyaltyService.getUserCoupons(currentUser.uid),
        partnerService.getPartners()
      ]);
      setMyDonations(dons);
      setMyReservations(resv);
      setTransactions(txs);
      setCoupons(cps);
      setPartners(pts);
    } catch (err) {
      console.error('Failed to load user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllUserData();
  }, [currentUser]);

  if (!currentUser || !userProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-3xl">
          🔒
        </div>
        <h2 className="text-xl font-bold text-gray-900">Veuillez vous connecter</h2>
        <p className="text-sm text-gray-500">
          Votre espace privé vous permet de gérer vos publications, réservations et votre coffre-fort de coupons.
        </p>
        <button
          onClick={onOpenAuthModal}
          className="px-6 py-2.5 bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs"
        >
          Se connecter
        </button>
      </div>
    );
  }

  // Calculate Donor Stats
  const totalPublished = myDonations.length;
  const availableCount = myDonations.filter(d => d.status === 'DISPONIBLE').length;
  const reservedCount = myDonations.filter(d => d.status === 'RESERVE').length;
  const recoveredCount = myDonations.filter(d => d.status === 'RECUPERE').length;
  const totalViews = myDonations.reduce((sum, d) => sum + (d.viewsCount || 0), 0);
  const totalInterests = myDonations.reduce((sum, d) => sum + (d.uniqueInterestsCount || 0), 0);
  const recoveryRate = totalPublished > 0 ? Math.round((recoveredCount / totalPublished) * 100) : 0;

  // Complete profile check (bonus +10 pommes)
  const isProfileComplete = Boolean(
    userProfile.firstName && userProfile.lastName && userProfile.city && userProfile.fokontany
  );

  const handleClaimProfileBonus = async () => {
    if (!currentUser) return;
    try {
      const awarded = await loyaltyService.awardProfileCompletionBonus(currentUser.uid);
      if (awarded) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        await refreshProfile();
        await loadAllUserData();
      }
    } catch (err) {
      console.error('Error claiming profile bonus:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfileData({
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      displayName: `${editFirstName.trim()} ${editLastName.trim()}` || userProfile.displayName,
      city: editCity,
      fokontany: editFokontany.trim()
    });
    // Check if bonus can be claimed
    if (editFirstName && editLastName && editCity && editFokontany && !userProfile.profileCompletionStatus) {
      await handleClaimProfileBonus();
    }
  };

  // Convert apples into coupon
  const handleConvertApples = async () => {
    setConversionError(null);
    if ((userProfile.applesCount || 0) < conversionAmount) {
      setConversionError(`Solde insuffisant. Vous disposez de ${userProfile.applesCount} pommes.`);
      return;
    }
    if (conversionAmount < 1000 || conversionAmount % 1000 !== 0) {
      setConversionError('Le montant doit être un multiple de 1 000 pommes.');
      return;
    }

    setConverting(true);
    try {
      const newCoupon = await loyaltyService.convertApplesToCoupon(
        currentUser.uid,
        userProfile.displayName,
        conversionAmount
      );
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      await refreshProfile();
      await loadAllUserData();
      setVoucherModalCoupon(newCoupon);
    } catch (err: any) {
      setConversionError(err?.message || 'Erreur lors de la conversion.');
    } finally {
      setConverting(false);
    }
  };

  // Assign coupon to a store
  const handleAssignStore = async (partner: Partner) => {
    if (!selectedCouponForStore) return;
    setAssigningStore(true);
    try {
      await loyaltyService.assignCouponToPartner(selectedCouponForStore.id, partner.id, partner.name);
      await loadAllUserData();
      setSelectedCouponForStore(null);
    } catch (err) {
      console.error('Error assigning store:', err);
    } finally {
      setAssigningStore(false);
    }
  };

  // Confirm received donation (as Beneficiary)
  const handleConfirmReceived = async (donation: Donation) => {
    const confirmed = window.confirm(
      `Confirmez-vous avoir bien reçu le don « ${donation.title} » auprès du donateur ${donation.ownerDisplayName} ?`
    );
    if (!confirmed) return;

    try {
      await donationService.confirmDonationReceived(
        donation.id,
        currentUser.uid,
        `conv_${donation.id}_${currentUser.uid}`
      );
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      await loadAllUserData();
    } catch (err) {
      console.error('Error confirming reception:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <img
            src={userProfile.photoURL || currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile.displayName}`}
            alt="Profil"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                {userProfile.displayName}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {userProfile.role === 'admin' ? 'Super Admin' : 'Membre solidaire'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {userProfile.city} {userProfile.fokontany ? `• ${userProfile.fokontany}` : ''} • Membre depuis {new Date(userProfile.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Apple Balance Callout */}
        <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200/70 p-3.5 rounded-2xl">
          <span className="text-3xl">🍎</span>
          <div>
            <div className="text-xs text-amber-800 font-semibold">Solde de fidélité</div>
            <div className="text-xl font-black text-emerald-950">
              {userProfile.applesCount.toLocaleString('fr-FR')} pommes
            </div>
            <div className="text-[10px] text-gray-500">
              Valeur théorique : {userProfile.applesCount.toLocaleString('fr-FR')} Ar en coupon
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200 pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Vue d’ensemble', icon: User },
          { id: 'profile', label: 'Gestion du profil', icon: Sliders },
          { id: 'donations', label: `Mes dons (${totalPublished})`, icon: Layers },
          { id: 'reservations', label: `Mes réservations (${myReservations.length})`, icon: Award },
          { id: 'apples', label: 'Espace Pommes & Gains', icon: Gift },
          { id: 'vault', label: `Coffre-fort de coupons (${coupons.length})`, icon: Store },
          { id: 'alerts', label: 'Alertes par Ville & Catégories', icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white border border-gray-200/80 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB PROFILE: ADVANCED PROFILE MANAGEMENT */}
      {activeTab === 'profile' && (
        <ProfileManagementPage onNavigate={onNavigate} onOpenAuthModal={onOpenAuthModal} />
      )}

      {/* TAB 1: OVERVIEW & PROFILE COMPLETION */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Profile Progress Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  Complétion de profil
                </span>
                <h3 className="text-xl font-black mt-1">
                  {userProfile.profileCompletionStatus
                    ? 'Votre profil est vérifié à 100% !'
                    : 'Complétez votre profil pour débloquer +10 pommes'}
                </h3>
                <p className="text-xs text-emerald-100 max-w-xl mt-1 leading-relaxed">
                  Renseignez votre prénom, nom, ville et fokontany pour inspirer confiance et sécuriser vos remises de dons.
                </p>
              </div>

              {!userProfile.profileCompletionStatus && isProfileComplete && (
                <button
                  onClick={handleClaimProfileBonus}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
                >
                  Réclamer mes +10 pommes
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-emerald-950/60 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-300 h-full rounded-full transition-all duration-500"
                style={{
                  width: userProfile.profileCompletionStatus ? '100%' : isProfileComplete ? '90%' : '50%'
                }}
              />
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Mettre à jour mes informations personnelles</h3>
            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  placeholder="Ex: Mialy"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  placeholder="Ex: Rakotomalala"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ville de résidence</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="Ex: Antananarivo"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Fokontany / Quartier</label>
                <input
                  type="text"
                  value={editFokontany}
                  onChange={(e) => setEditFokontany(e.target.value)}
                  placeholder="Ex: Ankorondrano"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* TAB 2: DONOR DASHBOARD (TABLEAU DE BORD DONATEUR) */}
      {activeTab === 'donations' && (
        <div className="space-y-8">
          
          {/* Key Donor Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="text-xs text-gray-500 font-medium">Dons publiés</div>
              <div className="text-2xl font-black text-gray-900 mt-1">{totalPublished}</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                {availableCount} actuellement disponible{availableCount > 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="text-xs text-gray-500 font-medium">En cours de réservation</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{reservedCount}</div>
              <div className="text-[11px] text-gray-500 mt-1">Remises en attente</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="text-xs text-gray-500 font-medium">Dons récupérés</div>
              <div className="text-2xl font-black text-emerald-800 mt-1">{recoveredCount}</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                Taux de réussite : {recoveryRate}%
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="text-xs text-gray-500 font-medium">Consultations reçues</div>
              <div className="text-2xl font-black text-purple-900 mt-1">{totalViews}</div>
              <div className="text-[11px] text-purple-700 font-semibold mt-1">
                {totalInterests} personnes uniques
              </div>
            </div>
          </div>

          {/* List of Published Donations */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900">Mes annonces de don</h3>
              <button
                onClick={() => onNavigate('publish')}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
              >
                + Nouveau don
              </button>
            </div>

            {myDonations.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Package className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm text-gray-500">Vous n'avez pas encore publié de don.</p>
                <button
                  onClick={() => onNavigate('publish')}
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Publier mon premier don (+50 pommes !)
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myDonations.map((don) => (
                  <div
                    key={don.id}
                    className="p-4 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={don.primaryImageUrl || don.imageUrls[0]}
                        alt={don.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-sm text-gray-900">{don.title}</div>
                        <div className="text-xs text-gray-500">
                          {don.category} • {don.city} • État {don.conditionScore}/10
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-3">
                          <span>{don.viewsCount || 0} vues</span>
                          <span>{don.uniqueInterestsCount || 0} intéressés</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          don.status === 'DISPONIBLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : don.status === 'RESERVE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {don.status}
                      </span>
                      <button
                        onClick={() => onNavigate('donation-detail', { id: don.id })}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                      >
                        Voir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: BENEFICIARY DASHBOARD (TABLEAU DE BORD BÉNÉFICIAIRE) */}
      {activeTab === 'reservations' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-gray-900">Mes réservations en cours et passées</h3>
            <p className="text-xs text-gray-500">
              Lorsque le donateur vous réserve un objet, confirmez sa réception dès que vous l'avez en main.
            </p>
          </div>

          {myReservations.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Award className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-sm text-gray-500">Vous n'avez aucune réservation pour le moment.</p>
              <button
                onClick={() => onNavigate('explore')}
                className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Explorer les dons disponibles
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myReservations.map((don) => {
                const isStillReserved = don.status === 'RESERVE';
                const isRecovered = don.status === 'RECUPERE';

                return (
                  <div
                    key={don.id}
                    className="p-5 rounded-2xl border border-gray-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={don.primaryImageUrl || don.imageUrls[0]}
                        alt={don.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-sm text-gray-900">{don.title}</div>
                        <div className="text-xs text-gray-500">
                          Donné par {don.ownerDisplayName} • {don.city}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Mode : {don.handoverMode === 'pickup' ? 'À récupérer sur place' : 'À discuter'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isStillReserved && (
                        <button
                          onClick={() => handleConfirmReceived(don)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          <span>Oui, j'ai reçu le don</span>
                        </button>
                      )}

                      {isRecovered && (
                        <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Récupéré avec succès
                        </span>
                      )}

                      <button
                        onClick={() => onNavigate('donation-detail', { id: don.id })}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                      >
                        Détails
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: APPLES & LOYALTY DASHBOARD */}
      {activeTab === 'apples' && (
        <div className="space-y-8">
          
          {/* Conversion Module Box */}
          <div className="bg-gradient-to-br from-amber-50 to-emerald-50 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                  Programme fidélité solidaire
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-emerald-950 mt-1">
                  Convertir mes Pommes en Bon d'Achat Magasin
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Règle officielle : <strong>1 000 pommes = 1 000 Ar</strong>. Seuil minimum pour un coupon utilisable en caisse : <strong>10 000 Ar</strong>.
                </p>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-amber-200 text-right shrink-0">
                <div className="text-xs text-gray-500">Solde disponible :</div>
                <div className="text-xl font-black text-emerald-900">
                  {userProfile.applesCount.toLocaleString('fr-FR')} 🍎
                </div>
              </div>
            </div>

            {conversionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{conversionError}</span>
              </div>
            )}

            {/* Condition Check: Less than 10 000 apples vs >= 10 000 apples */}
            {userProfile.applesCount < 10000 ? (
              <div className="p-6 bg-white rounded-3xl border-2 border-amber-200 shadow-xs space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-xl font-black">
                    🔒
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Conversion bloquée — Minimum 10 000 pommes requis
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Vous avez actuellement <strong>{userProfile.applesCount.toLocaleString('fr-FR')} pommes</strong>.
                      Il vous manque encore <strong className="text-emerald-800">{(10000 - userProfile.applesCount).toLocaleString('fr-FR')} pommes</strong> pour débloquer votre premier bon d'achat utilisable en supermarché.
                    </p>
                  </div>
                </div>

                {/* Progress bar to 10 000 pommes */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>Progression vers le 1er coupon (10 000 Ar) :</span>
                    <span className="text-emerald-800">{Math.min(100, Math.round((userProfile.applesCount / 10000) * 100))}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((userProfile.applesCount / 10000) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => alert(`Il vous faut au moins 10 000 pommes pour débloquer la conversion. Publiez des dons pour accumuler des pommes gratuites !`)}
                    className="w-full py-3.5 bg-slate-100 border border-slate-300 text-slate-500 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-200 transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Convertir mes pommes (Seuil de 10 000 pommes non atteint)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white rounded-3xl border-2 border-emerald-400 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-2xl font-black shadow-xs">
                      ✨
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider mb-0.5">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Option débloquée !
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Votre solde permet de générer un ou plusieurs coupons d'achat
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Vous pouvez convertir vos <strong>{userProfile.applesCount.toLocaleString('fr-FR')} pommes</strong> et choisir votre magasin partenaire favori.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsConversionModalOpen(true)}
                  className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 text-emerald-950 font-black text-sm rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/80"
                >
                  <Sparkles className="w-5 h-5 text-amber-700 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Convertir mes pommes en coupon d'achat maintenant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Transactions Ledger */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-gray-900">
              Journal d'audit des mouvements de pommes
            </h3>

            {transactions.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">Aucun mouvement enregistré pour le moment.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-800">{tx.note || tx.type}</div>
                      <div className="text-gray-400 text-[10px]">
                        {new Date(tx.createdAt).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    <span
                      className={`font-black text-sm ${
                        tx.pointsDelta > 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {tx.pointsDelta > 0 ? `+${tx.pointsDelta}` : tx.pointsDelta} pommes
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 5: DIGITAL COUPON VAULT & HISTORY DASHBOARD (« HISTORIQUE ET SUIVI DES COUPONS CONVERTIS ») */}
      {activeTab === 'vault' && (
        <div className="space-y-8">
          
          {/* Summary KPI Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-1">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Converti</div>
              <div className="text-2xl font-black text-emerald-950">
                {coupons.reduce((sum, c) => sum + (c.faceValueAr || 0), 0).toLocaleString('fr-FR')} Ar
              </div>
              <div className="text-[11px] text-gray-500">{coupons.length} coupon{coupons.length > 1 ? 's' : ''} généré{coupons.length > 1 ? 's' : ''}</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-1">
              <div className="text-xs text-amber-800 font-bold uppercase tracking-wider">En Attente Magasin</div>
              <div className="text-2xl font-black text-amber-600">
                {coupons.filter(c => c.status === 'EN_ATTENTE_VALIDATION_MAGASIN').length}
              </div>
              <div className="text-[11px] text-amber-700 font-medium">Validation par le partenaire</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-1">
              <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Actifs & Prêts</div>
              <div className="text-2xl font-black text-emerald-700">
                {coupons.filter(c => c.status === 'ACTIF' || c.status === 'AFFECTE_A_UNE_ENSEIGNE' || c.status === 'CREE').length}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">Utilisables en caisse</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Utilisés / Expirés</div>
              <div className="text-2xl font-black text-slate-700">
                {coupons.filter(c => c.status === 'UTILISE' || c.status === 'EXPIRE' || (c.expiresAt && new Date(c.expiresAt) < new Date())).length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Historique terminé</div>
            </div>
          </div>

          {/* Main Vault Panel */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  Tableau de bord de fidélité
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                  Historique complet de mes coupons convertis
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Consultez l'état de chaque bon d'achat, de sa conversion par pommes jusqu'à sa validation en caisse.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('apples')}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-extrabold shadow-xs transition-colors shrink-0"
              >
                + Convertir de nouvelles pommes
              </button>
            </div>

            {/* Filter Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100 scrollbar-none">
              {[
                { id: 'ALL', label: `Tous (${coupons.length})` },
                { id: 'PENDING', label: `En attente (${coupons.filter(c => c.status === 'EN_ATTENTE_VALIDATION_MAGASIN').length})` },
                { id: 'ACTIVE', label: `Actifs (${coupons.filter(c => c.status === 'ACTIF' || c.status === 'AFFECTE_A_UNE_ENSEIGNE' || c.status === 'CREE').length})` },
                { id: 'USED', label: `Utilisés (${coupons.filter(c => c.status === 'UTILISE').length})` },
                { id: 'EXPIRED', label: `Expirés (${coupons.filter(c => c.status === 'EXPIRE' || (c.expiresAt && new Date(c.expiresAt) < new Date() && c.status !== 'UTILISE')).length})` }
              ].map((f) => {
                const isActive = couponFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setCouponFilter(f.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Filtered Coupon List */}
            {(() => {
              const now = new Date();
              const filteredCoupons = coupons.filter(c => {
                const isExp = c.status === 'EXPIRE' || (c.expiresAt && new Date(c.expiresAt) < now && c.status !== 'UTILISE');
                if (couponFilter === 'PENDING') return c.status === 'EN_ATTENTE_VALIDATION_MAGASIN';
                if (couponFilter === 'ACTIVE') return (c.status === 'ACTIF' || c.status === 'AFFECTE_A_UNE_ENSEIGNE' || c.status === 'CREE') && !isExp;
                if (couponFilter === 'USED') return c.status === 'UTILISE';
                if (couponFilter === 'EXPIRED') return isExp;
                return true;
              });

              if (filteredCoupons.length === 0) {
                return (
                  <div className="text-center py-16 space-y-3 bg-gray-50 rounded-2xl p-8 border border-dashed border-gray-200">
                    <Store className="w-12 h-12 text-gray-300 mx-auto" />
                    <h4 className="text-sm font-bold text-gray-800">Aucun coupon dans cette catégorie</h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      {couponFilter === 'ALL'
                        ? "Convertissez dès 10 000 pommes pour générer votre premier bon d'achat officiel !"
                        : "Aucun bon d'achat ne correspond au filtre sélectionné."}
                    </p>
                    <button
                      onClick={() => setActiveTab('apples')}
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs rounded-xl shadow-xs"
                    >
                      Convertir mes pommes
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCoupons.map((coupon) => {
                    const isUsed = coupon.status === 'UTILISE';
                    const isPending = coupon.status === 'EN_ATTENTE_VALIDATION_MAGASIN';
                    const isExpired = coupon.status === 'EXPIRE' || (coupon.expiresAt && new Date(coupon.expiresAt) < now && !isUsed);

                    return (
                      <div
                        key={coupon.id}
                        className={`rounded-3xl p-6 border-2 transition-all relative overflow-hidden flex flex-col justify-between space-y-4 ${
                          isUsed
                            ? 'bg-gray-50 border-gray-200 opacity-70'
                            : isPending
                            ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                            : isExpired
                            ? 'bg-red-50/30 border-red-200 opacity-80'
                            : 'bg-gradient-to-br from-white to-amber-50/40 border-emerald-300 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {/* Status Header */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🍎</span>
                            <div>
                              <div className="text-[10px] uppercase font-black tracking-widest text-emerald-800">
                                Zarazarao Solidaire
                              </div>
                              <div className="text-xl font-black text-emerald-950">
                                {coupon.faceValueAr.toLocaleString('fr-FR')} Ariary
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Badge */}
                          {isUsed ? (
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-slate-200 text-slate-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-slate-600" />
                              Utilisé
                            </span>
                          ) : isPending ? (
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-200 text-amber-950 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-700" />
                              En attente magasin
                            </span>
                          ) : isExpired ? (
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-red-100 text-red-900 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-red-600" />
                              Expiré
                            </span>
                          ) : (
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-950 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Validé & Actif
                            </span>
                          )}
                        </div>

                        {/* Barcode SVG */}
                        <BarcodeSvg code={coupon.eightDigitCode} />

                        {/* Store & Validity Detailed Specs */}
                        <div className="p-3.5 bg-white/90 rounded-2xl border border-gray-100 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-500">Magasin affecté :</span>
                            <span className="font-extrabold text-gray-900">
                              {coupon.partnerName || 'Tous les partenaires'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-500">Date de création :</span>
                            <span className="font-semibold text-gray-700">
                              {new Date(coupon.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>

                          {coupon.expiresAt && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-gray-500">Valable jusqu'au :</span>
                              <span className={`font-extrabold ${isExpired ? 'text-red-600' : 'text-emerald-800'}`}>
                                {new Date(coupon.expiresAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          )}

                          {coupon.termsAndConditions && (
                            <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-100 italic">
                              Conditions : {coupon.termsAndConditions}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                          {!isUsed && !isExpired && !isPending && (
                            <button
                              onClick={() => setSelectedCouponForStore(coupon)}
                              className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1"
                            >
                              <Store className="w-3.5 h-3.5" />
                              <span>Présenter en caisse</span>
                            </button>
                          )}

                          {isPending && (
                            <button
                              onClick={() => alert(`Le magasin partenaire ${coupon.partnerName || ''} a été notifié. La validation intervient sous 24h.`)}
                              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Relancer le magasin</span>
                            </button>
                          )}

                          <button
                            onClick={() => setVoucherModalCoupon(coupon)}
                            className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                            title="Imprimer / Imprimer le coupon"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Aperçu</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* TAB 6: REAL-TIME ALERTS & SAVED CATEGORIES */}
      {activeTab === 'alerts' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                <Bell className="w-3.5 h-3.5 text-emerald-700" />
                Notifications Firestore en temps réel
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                Paramétrer mes alertes de dons à Madagascar
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Soyez alerté en temps réel dès qu'un objet est publié dans votre ville ou dans l'une de vos catégories favorites. Vous recevrez une notification instantanée dans votre barre de navigation.
              </p>
            </div>

            {alertSavedMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{alertSavedMsg}</span>
              </div>
            )}

            {/* Notification toggle */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-gray-900">Alertes instantanées actives</div>
                <div className="text-xs text-gray-500">
                  Afficher la cloche et les bannières en direct lors de nouvelles annonces
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyNewDonations}
                  onChange={(e) => setNotifyNewDonations(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
              </label>
            </div>

            {/* City Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                1. Ma ville prioritaire pour les alertes :
              </label>
              <select
                value={alertCity}
                onChange={(e) => setAlertCity(e.target.value)}
                className="w-full sm:w-80 p-3 bg-gray-50 border border-gray-300 rounded-2xl text-sm font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {MADAGASCAR_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Category selection */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  2. Mes catégories surveillées ({savedCategories.length}/{CATEGORIES.length}) :
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSavedCategories(CATEGORIES.map(c => c.name))}
                    className="text-[11px] text-emerald-800 font-bold hover:underline"
                  >
                    Tout sélectionner
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={() => setSavedCategories([])}
                    className="text-[11px] text-gray-500 font-medium hover:underline"
                  >
                    Tout décocher
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const isChecked = savedCategories.includes(cat.name);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.name)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xs">{cat.name}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                type="button"
                onClick={async () => {
                  if (!currentUser) return;
                  await notificationService.broadcastNewDonationAlert({
                    id: 'don-demo-test',
                    title: 'Vélo ou livre scolaire disponible',
                    description: 'Test d’alerte temps réel',
                    category: savedCategories[0] || 'Mobilier',
                    city: alertCity,
                    fokontany: 'Centre-ville',
                    ownerUid: 'system',
                    ownerDisplayName: 'Zarazarao Alerte',
                    conditionScore: 9,
                    imageUrls: [],
                    primaryImageUrl: '',
                    handoverMode: 'pickup',
                    status: 'DISPONIBLE',
                    viewsCount: 1,
                    uniqueInterestsCount: 1,
                    conversationsCount: 0,
                    createdAt: new Date().toISOString()
                  });
                  setAlertSavedMsg('Alerte de test envoyée ! Regardez la cloche de notifications en haut à droite.');
                  setTimeout(() => setAlertSavedMsg(null), 4000);
                }}
                className="text-xs text-emerald-800 font-bold hover:underline flex items-center gap-1.5"
              >
                <span>🔔 Envoyer une alerte de test</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAlertPreferences}
                disabled={savingAlerts}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer"
              >
                {savingAlerts ? 'Enregistrement...' : 'Enregistrer mes préférences d’alerte'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Store Assignment Modal */}
      {selectedCouponForStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-black text-gray-900">
              Choisir mon magasin partenaire
            </h3>
            <p className="text-xs text-gray-600">
              Sélectionnez l'enseigne dans laquelle vous souhaitez présenter votre bon d'achat de {selectedCouponForStore.faceValueAr.toLocaleString('fr-FR')} Ar :
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {partners.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleAssignStore(p)}
                  className="p-3 rounded-xl border border-gray-200 hover:border-emerald-600 hover:bg-emerald-50/50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-gray-900">{p.name}</div>
                    <div className="text-[10px] text-gray-500">{p.city} • {p.address}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCouponForStore(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable / Downloadable Voucher Lightbox */}
      {voucherModalCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border-2 border-emerald-600 space-y-6 relative print:p-0 print:border-none">
            <div className="text-center space-y-1">
              <div className="text-xs font-black uppercase tracking-widest text-emerald-800">
                Bon d'achat officiel Zarazarao
              </div>
              <h2 className="text-3xl font-black text-emerald-950">
                {voucherModalCoupon.faceValueAr.toLocaleString('fr-FR')} Ariary
              </h2>
              <p className="text-xs text-gray-500">
                À présenter en caisse • Titulaire : {voucherModalCoupon.ownerName}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center">
              <BarcodeSvg code={voucherModalCoupon.eightDigitCode} height={64} />
            </div>

            <div className="text-xs text-gray-600 space-y-1.5 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <div><strong>Code à 8 chiffres :</strong> {voucherModalCoupon.eightDigitCode}</div>
              <div><strong>Enseigne :</strong> {voucherModalCoupon.partnerName || 'Tous supermarchés & librairies partenaires'}</div>
              <div><strong>Émis le :</strong> {new Date(voucherModalCoupon.createdAt).toLocaleDateString('fr-FR')}</div>
              <div className="text-[10px] text-gray-500 pt-1">
                Ce bon d'achat est non échangeable contre des espèces. Une seule utilisation autorisée.
              </div>
            </div>

            <div className="flex gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le coupon</span>
              </button>
              <button
                onClick={() => setVoucherModalCoupon(null)}
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-step Apples Conversion Wizard Modal */}
      <ApplesConversionModal
        isOpen={isConversionModalOpen}
        onClose={() => setIsConversionModalOpen(false)}
        partners={partners}
        onConversionSuccess={() => {
          loadAllUserData();
          setActiveTab('vault');
        }}
      />

    </div>
  );
};
