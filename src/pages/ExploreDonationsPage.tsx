import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  RotateCcw, 
  Package, 
  Tag, 
  Clock, 
  Eye, 
  ArrowUpDown,
  Sparkles,
  Flame,
  PlusCircle,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Users,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { Donation, UserProfile } from '@/types';
import { donationService } from '@/services/donationService';
import { userService } from '@/services/userService';
import { forceSeedMoreSampleDonations } from '@/services/seedService';
import { CATEGORIES, MADAGASCAR_CITIES } from '@/config/constants';
import { useTranslation } from '@/contexts/TranslationContext';
import { formatPublicationDuration } from '@/utils/dateUtils';
import { ZaraLoader } from '@/components/common/ZaraLoader';
import { useAuth } from '@/contexts/AuthContext';

interface ExploreDonationsPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialFilters?: {
    search?: string;
    category?: string;
    city?: string;
    fokontany?: string;
  };
}

export const ExploreDonationsPage: React.FC<ExploreDonationsPageProps> = ({
  onNavigate,
  initialFilters = {}
}) => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccessNotice, setSeedSuccessNotice] = useState<string | null>(null);

  // Filters state
  const [activeTab, setActiveTab] = useState<'donations' | 'users'>('donations');
  const [search, setSearch] = useState(initialFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'all');
  const [selectedCity, setSelectedCity] = useState(initialFilters.city || 'all');
  const [selectedFokontany, setSelectedFokontany] = useState(initialFilters.fokontany || 'all');
  const [statusFilter, setStatusFilter] = useState('DISPONIBLE');
  const [handoverMode, setHandoverMode] = useState('all');
  const [minCondition, setMinCondition] = useState(0);
  const [sortBy, setSortBy] = useState<'recent' | 'views' | 'condition'>('recent');

  // User search state
  const [userSearch, setUserSearch] = useState('');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Compute available fokontanys based on selected city
  const currentCityObj = useMemo(() => {
    return MADAGASCAR_CITIES.find(c => c.name.toLowerCase() === selectedCity.toLowerCase());
  }, [selectedCity]);

  const availableFokontanys = currentCityObj?.fokontanys || [];

  const fetchFilteredDonations = async () => {
    setLoading(true);
    try {
      const data = await donationService.getDonations({
        search,
        category: selectedCategory,
        city: selectedCity,
        fokontany: selectedFokontany,
        status: statusFilter,
        handoverMode,
        minCondition,
        sortBy
      });

      // Priority sort: Same Fokontany > Same City > Others
      const sortedData = [...data].sort((a, b) => {
        const userProfileCity = userProfile?.city?.toLowerCase();
        const userProfileFokontany = userProfile?.fokontany?.toLowerCase();

        const aCityMatch = a.city.toLowerCase() === userProfileCity;
        const bCityMatch = b.city.toLowerCase() === userProfileCity;
        const aFokontanyMatch = a.fokontany?.toLowerCase() === userProfileFokontany;
        const bFokontanyMatch = b.fokontany?.toLowerCase() === userProfileFokontany;

        if (aFokontanyMatch && !bFokontanyMatch) return -1;
        if (!aFokontanyMatch && bFokontanyMatch) return 1;
        if (aCityMatch && !bCityMatch) return -1;
        if (!aCityMatch && bCityMatch) return 1;
        return 0;
      });

      setDonations(sortedData);
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const list = await userService.searchUsers(userSearch);
      setUsersList(list);
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'donations') {
      fetchFilteredDonations();
    } else {
      fetchUsers();
    }
  }, [activeTab, selectedCategory, selectedCity, selectedFokontany, statusFilter, handoverMode, minCondition, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFilteredDonations();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setSelectedFokontany('all');
    setStatusFilter('DISPONIBLE');
    setHandoverMode('all');
    setMinCondition(0);
    setSortBy('recent');
  };

  const handleGenerateSampleMockData = async () => {
    setSeeding(true);
    try {
      const count = await forceSeedMoreSampleDonations();
      setSeedSuccessNotice(`${count} nouvelles annonces réparties par fokontanys ont été générées avec succès !`);
      await fetchFilteredDonations();
      setTimeout(() => setSeedSuccessNotice(null), 5000);
    } catch (err) {
      console.error('Failed to seed:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header and Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Zarazarao
            </span>
            <span className="text-xs font-bold text-gray-500">
              100% {t('common.free')} • Fihavanana
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 via-purple-900 to-amber-700">
            {t('explore.title')}
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
            {t('explore.subtitle')}
          </p>
        </div>

        {/* Action Buttons: Sample Data Generation & Publish */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleGenerateSampleMockData}
            disabled={seeding}
            className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Générer 15 annonces supplémentaires pour tester la fluidité et les concentrations"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            <span>{seeding ? 'Génération en cours...' : 'Générer +15 dons d’exemple (Fluidité)'}</span>
          </button>

          <button
            onClick={() => onNavigate('map')}
            className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Voir sur la carte</span>
          </button>
        </div>
      </motion.div>

      {/* Success Notification Banner for Seeding */}
      {seedSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{seedSuccessNotice}</span>
          </div>
          <button onClick={() => setSeedSuccessNotice(null)} className="text-emerald-700 hover:text-emerald-950 font-black">
            ✕
          </button>
        </div>
      )}

      {/* Search Mode Tabs: Donations vs Members */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('donations')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'donations'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catalogue des dons & objets</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-500" />
          <span>Rechercher des membres (Utilisateurs)</span>
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              Rechercher des donateurs et membres par nom ou ville
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  placeholder="Tapez un prénom, un nom de donateur ou une ville (ex: Mialy, Fidy, Antananarivo)..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white shadow-2xs transition-all"
                />
              </div>
              <button
                onClick={fetchUsers}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors cursor-pointer"
              >
                Rechercher membre
              </button>
            </div>
          </div>

          {usersLoading ? (
            <div className="py-16 flex justify-center">
              <ZaraLoader size="md" text="Recherche des membres et donateurs..." />
            </div>
          ) : usersList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3 max-w-md mx-auto">
              <Users className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">Aucun membre trouvé</h3>
              <p className="text-xs text-gray-500">
                Essayez avec une autre orthographe ou réinitialisez la recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {usersList.map((user) => (
                <div key={user.uid} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        {user.displayName}
                        {user.role === 'admin' && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black rounded-full">
                            Admin
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {user.city || 'Madagascar'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSearch(user.displayName);
                      setActiveTab('donations');
                      fetchFilteredDonations();
                    }}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Voir ses dons
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Main Search Bar & Sort Bar */}
          <div className="space-y-4 bg-white p-4 sm:p-6 rounded-3xl border border-emerald-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par titre, description, ville ou fokontany (ex: table, poussette, Analakely)..."
              className="w-full pl-11 pr-24 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white shadow-2xs transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Rechercher
            </button>
          </form>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none pl-9 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="recent">Plus récents d'abord</option>
                <option value="views">Les plus consultés</option>
                <option value="condition">Meilleur état (0 à 10)</option>
              </select>
              <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>

            {/* Reset Filters */}
            <button
              onClick={handleResetFilters}
              className="p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl text-gray-600 hover:text-emerald-800 transition-colors shadow-2xs cursor-pointer"
              title="Réinitialiser tous les filtres"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Horizontal Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes les catégories
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Bar: City & Fokontany & Handover & Status */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
          
          {/* City Selector */}
          <div className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 shadow-2xs">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedFokontany('all');
              }}
              className="bg-transparent text-xs font-bold text-gray-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Toutes les villes (Madagascar)</option>
              {MADAGASCAR_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.region})
                </option>
              ))}
            </select>
          </div>

          {/* Fokontany Selector (Dynamic based on selected City) */}
          <div className="flex items-center gap-1.5 text-xs bg-emerald-50/60 border border-emerald-200 rounded-xl px-2.5 py-1 shadow-2xs">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <select
              value={selectedFokontany}
              onChange={(e) => setSelectedFokontany(e.target.value)}
              className="bg-transparent text-xs font-bold text-emerald-950 focus:outline-hidden cursor-pointer"
            >
              <option value="all">
                {selectedCity !== 'all' ? `Tous les fokontanys (${selectedCity})` : 'Filtre par fokontany'}
              </option>
              {availableFokontanys.map((f) => (
                <option key={f} value={f}>
                  Quartier : {f}
                </option>
              ))}
            </select>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl text-xs font-semibold text-gray-700">
            <button
              onClick={() => setStatusFilter('DISPONIBLE')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'DISPONIBLE' ? 'bg-white text-emerald-900 shadow-2xs font-bold' : 'text-gray-500'
              }`}
            >
              Disponibles
            </button>
            <button
              onClick={() => setStatusFilter('RESERVE')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'RESERVE' ? 'bg-white text-amber-900 shadow-2xs font-bold' : 'text-gray-500'
              }`}
            >
              Réservés
            </button>
            <button
              onClick={() => setStatusFilter('RECUPERE')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'RECUPERE' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-500'
              }`}
            >
              Récupérés
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-500'
              }`}
            >
              Tous
            </button>
          </div>

          {/* Handover mode */}
          <select
            value={handoverMode}
            onChange={(e) => setHandoverMode(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700 focus:outline-hidden cursor-pointer shadow-2xs font-medium"
          >
            <option value="all">Tous modes de remise</option>
            <option value="pickup">À récupérer sur place</option>
            <option value="delivery">Livraison possible</option>
            <option value="discuss">À discuter</option>
          </select>
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <ZaraLoader size="lg" text="Chargement des dons et des quartiers..." />
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-3xl mx-auto shadow-inner">
            🎁
          </div>
          <h3 className="text-lg font-black text-gray-900">Aucun don trouvé avec ces critères</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Essayez d’élargir vos filtres ou sélectionnez un autre fokontany pour explorer davantage de dons disponibles.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Effacer les filtres
            </button>
            <button
              onClick={handleGenerateSampleMockData}
              className="px-4 py-2 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Générer des dons de test
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {donations.map((donation) => {
            const isAvailable = donation.status === 'DISPONIBLE';
            const isReserved = donation.status === 'RESERVE';
            const isRecovered = donation.status === 'RECUPERE';

            return (
              <div
                key={donation.id}
                onClick={() => onNavigate('donation-detail', { id: donation.id })}
                className="group bg-white rounded-3xl border border-gray-200/90 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1"
              >
                {/* Photo & Badges */}
                <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                  <img
                    src={donation.primaryImageUrl || donation.imageUrls[0]}
                    alt={donation.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {isAvailable && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-700 text-white shadow-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                        Disponible
                      </span>
                    )}
                    {donation.estUrgent && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-600 text-white shadow-md flex items-center gap-1 animate-pulse">
                        🔥 Urgent
                      </span>
                    )}
                    {isReserved && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-md">
                        Réservé
                      </span>
                    )}
                    {isRecovered && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gray-700 text-white shadow-md">
                        Don récupéré
                      </span>
                    )}
                  </div>

                  {/* Condition Score Badge */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-white/20">
                    État {donation.conditionScore}/10
                  </div>

                  {/* Handover & Publication Duration Pill */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-center text-[10px] font-bold text-white">
                    <span className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md truncate max-w-[55%]">
                      {donation.handoverMode === 'pickup' && 'À récupérer sur place'}
                      {donation.handoverMode === 'delivery' && 'Livraison possible'}
                      {donation.handoverMode === 'discuss' && 'À discuter'}
                    </span>
                    <span className="bg-black/70 backdrop-blur-xs text-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 border border-white/10">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{formatPublicationDuration(donation.createdAt)}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-black text-emerald-800 uppercase tracking-wider mb-1">
                      <span>{donation.category}</span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {donation.viewsCount || 0} vue{(donation.viewsCount || 0) > 1 ? 's' : ''}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-gray-900 text-base line-clamp-1 group-hover:text-emerald-800 transition-colors">
                      {donation.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                      {donation.description}
                    </p>
                  </div>

                  {/* Location & Donor Footer */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {donation.fokontany ? `${donation.fokontany}, ${donation.city}` : donation.city}
                      </span>
                    </div>
                    <span className="text-emerald-700 font-extrabold text-xs group-hover:translate-x-1 transition-transform flex items-center">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

    </div>
  );
};
