import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, 
  Layers, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Package,
  Sparkles,
  Bell,
  Sliders
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { donationService } from '@/services/donationService';
import { notificationService } from '@/services/notificationService';
import { CATEGORIES, MADAGASCAR_CITIES } from '@/config/constants';
import { Donation } from '@/types';
import { ProfileManagementPage } from '@/pages/ProfileManagementPage';

interface UserDashboardPageProps {
  initialTab?: 'overview' | 'profile' | 'donations' | 'reservations' | 'alerts';
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
      if (initialTab === ('apples' as any) || initialTab === ('vault' as any)) {
        setActiveTab('overview');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  // Data states
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [myReservations, setMyReservations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [dons, resv] = await Promise.all([
        donationService.getUserDonations(currentUser.uid),
        donationService.getUserReservations(currentUser.uid)
      ]);
      setMyDonations(dons);
      setMyReservations(resv);
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
          Votre espace privé vous permet de gérer vos publications, réservations et échanges solidaires.
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

  // Complete profile check (bonus +10 points)
  const isProfileComplete = Boolean(
    userProfile.firstName && userProfile.lastName && userProfile.city && userProfile.fokontany
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfileData({
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      displayName: `${editFirstName.trim()} ${editLastName.trim()}` || userProfile.displayName,
      city: editCity,
      fokontany: editFokontany.trim()
    });
    await refreshProfile();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
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

        {/* Community Engagement Callout */}
        <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200/70 p-3.5 rounded-2xl">
          <span className="text-3xl">🤝</span>
          <div>
            <div className="text-xs text-emerald-800 font-semibold">Engagement Solidaire</div>
            <div className="text-xl font-black text-emerald-950">
              {totalPublished} dons partagés
            </div>
            <div className="text-[10px] text-gray-500">
              {recoveredCount} remis avec succès • 100% bénévole
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
                  Confiance & Sécurité Solidaire
                </span>
                <h3 className="text-xl font-black mt-1">
                  {userProfile.profileCompletionStatus || isProfileComplete
                    ? 'Votre profil est complété à 100% !'
                    : 'Complétez votre profil pour inspirer confiance'}
                </h3>
                <p className="text-xs text-emerald-100 max-w-xl mt-1 leading-relaxed">
                  Renseignez votre prénom, nom, ville et fokontany pour sécuriser vos échanges et vos remises d'objets gratuits.
                </p>
              </div>
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
                  Publier mon premier don solidaire
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



      {/* TAB: REAL-TIME ALERTS & SAVED CATEGORIES */}
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
                    estUrgent: false,
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

    </div>
  );
};
