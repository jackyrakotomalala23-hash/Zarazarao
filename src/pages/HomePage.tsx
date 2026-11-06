import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  PlusCircle, 
  Search, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Package,
  Clock
} from 'lucide-react';
import { Donation } from '@/types';
import { donationService } from '@/services/donationService';
import { CATEGORIES } from '@/config/constants';
import { MadagascarMap } from '@/components/common/MadagascarMap';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPublicationDuration } from '@/utils/dateUtils';
import { ZaraLoader } from '@/components/common/ZaraLoader';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuthModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuthModal }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch recent donations on mount
  useEffect(() => {
    async function loadData() {
      try {
        const donations = await donationService.getDonations({ limitCount: 8 });
        setRecentDonations(donations);
      } catch (err) {
        console.error('Failed to load recent donations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalPublished = recentDonations.length;
  const totalRecovered = recentDonations.filter(d => d.status === 'RECUPERE').length;
  const uniqueCities = Array.from(new Set(recentDonations.map(d => d.city))).length || 1;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('explore', { search: searchTerm });
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 sm:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl text-white p-8 sm:p-14 lg:p-16 shadow-2xl transition-all duration-500 border border-white/20"
            style={{ background: 'var(--gradient-hero)' }}
          >
            
            {/* Subtle background overlay circles */}
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[var(--accent-color)]/20 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-500/50 text-xs font-semibold text-emerald-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('hero.badge')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white">
                {t('hero.title')}
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal">
                {t('hero.subtitle')}
              </p>

              {/* Fast Search Input */}
              <form onSubmit={handleSearchSubmit} className="pt-2">
                <div className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-lg">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-emerald-200 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('explore.search.placeholder')}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>{t('common.search')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => onNavigate('explore')}
                  className="px-6 py-3 rounded-2xl bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {t('hero.cta.explore')}
                </button>
                <button
                  onClick={() => onNavigate('publish')}
                  className="px-6 py-3 rounded-2xl bg-emerald-700/80 hover:bg-emerald-700 text-white border border-emerald-400/40 font-bold text-sm transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                  {t('hero.cta.publish')}
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-emerald-200 border-t border-emerald-700/60">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{t('home.freeGuaranteed', '100% Gratuit garanti')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{t('home.zeroFee', 'Zéro frais de vente')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{t('home.loyaltyTrust', 'Esprit Fihavanana & Entraide')}</span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. LIVE COMMUNITY STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <motion.div 
            whileHover={{ y: -4 }} 
            className="p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md flex items-center gap-3 sm:gap-4 shadow-2xs"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--bg-card) 65%, transparent)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div 
                className="text-sm sm:text-2xl font-black tracking-tight leading-snug truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {totalPublished > 0 ? totalPublished : 'Plus de 10'}
              </div>
              <div 
                className="text-[10px] sm:text-xs font-semibold leading-tight truncate mt-0.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('home.registeredDonations', 'Dons enregistrés')}
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }} 
            className="p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md flex items-center gap-3 sm:gap-4 shadow-2xs"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--bg-card) 65%, transparent)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400 fill-amber-500/20" />
            </div>
            <div className="min-w-0">
              <div 
                className="text-sm sm:text-2xl font-black tracking-tight leading-snug truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {totalRecovered}
              </div>
              <div 
                className="text-[10px] sm:text-xs font-semibold leading-tight truncate mt-0.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('home.transmittedItems', 'Objets déjà transmis')}
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }} 
            className="p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md flex items-center gap-3 sm:gap-4 shadow-2xs"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--bg-card) 65%, transparent)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500/15 text-blue-800 dark:text-blue-200 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <div 
                className="text-sm sm:text-2xl font-black tracking-tight leading-snug truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {uniqueCities > 0 ? uniqueCities : 8}
              </div>
              <div 
                className="text-[10px] sm:text-xs font-semibold leading-tight truncate mt-0.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('home.activeCities', 'Villes malgaches actives')}
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }} 
            className="p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md flex items-center gap-3 sm:gap-4 shadow-2xs"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--bg-card) 65%, transparent)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div 
                className="text-xs sm:text-xl font-black tracking-tight leading-snug truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                100% Solidaire
              </div>
              <div 
                className="text-[10px] sm:text-xs font-semibold leading-tight truncate mt-0.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('home.partnerCoupons', 'Entraide & Zéro Déchet')}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. RECENT DONATIONS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t('home.realtimeSolidarity', 'Solidarité en temps réel')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              {t('home.recentDonationsTitle', 'Les dons récemment publiés')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group cursor-pointer"
          >
            <span>{t('home.viewAllDonations', 'Voir toutes les annonces')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <ZaraLoader size="lg" text="Chargement des dons récents..." />
          </div>
        ) : recentDonations.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-8 space-y-4">
            <Package className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('home.noDonationsYet', 'Aucun don publié pour le moment')}</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              {t('home.beFirstDonor', 'Soyez le premier citoyen malgache à proposer un objet gratuit sur Zarazarao et partagez l\'esprit de générosité !')}
            </p>
            <button
              onClick={() => onNavigate('publish')}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-sm cursor-pointer"
            >
              {t('home.publishFirstDonation', 'Publier le premier don')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentDonations.map((donation) => {
              const isAvailable = donation.status === 'DISPONIBLE';
              const isReserved = donation.status === 'RESERVE';
              const isRecovered = donation.status === 'RECUPERE';

              return (
                <motion.div
                  key={donation.id}
                  whileHover={{ y: -5 }}
                  onClick={() => onNavigate('donation-detail', { id: donation.id })}
                  className="group bg-white rounded-2xl border border-gray-200/80 hover:border-emerald-300 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                    <img
                      src={donation.primaryImageUrl || donation.imageUrls[0] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'}
                      alt={donation.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Status Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      {isAvailable && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-700 text-white shadow-xs">
                          {t('home.statusAvailable', 'Disponible')}
                        </span>
                      )}
                      {isReserved && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                          {t('home.statusReserved', 'Réservé')}
                        </span>
                      )}
                      {isRecovered && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-600 text-white shadow-xs">
                          {t('home.statusRecovered', 'Don récupéré')}
                        </span>
                      )}
                    </div>

                    {/* Condition score pill */}
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {t('common.condition', 'État')} : {donation.conditionScore}/10
                    </div>

                    {/* Publication Duration Badge */}
                    <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                      <Clock className="w-3 h-3 text-amber-300" />
                      <span>{formatPublicationDuration(donation.createdAt)}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                        {donation.category}
                      </div>
                      <h3 className="font-bold text-[var(--text-primary)] text-base line-clamp-1 group-hover:text-emerald-800 transition-colors">
                        {donation.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1 leading-relaxed">
                        {donation.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1 truncate font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{donation.city} • {donation.fokontany}</span>
                      </div>
                      <span className="text-[10px] text-[var(--text-secondary)] shrink-0">
                        {donation.viewsCount || 0} vue{donation.viewsCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        </div>
      </section>

      {/* 4. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            {t('home.homeNeeds', 'Tous les besoins de la maison')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {t('home.exploreCatTitle', 'Explorer les 14 catégories d\'objets')}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {t('home.exploreCatSub', 'Vêtements, meubles, petit électroménager, matériel scolaire : chaque objet trouve son preneur.')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => onNavigate('explore', { category: cat.name })}
              className="p-4 glass-card hover:bg-emerald-50/60 rounded-2xl border border-gray-200/80 hover:border-emerald-300 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 group shadow-xs hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-emerald-700" />
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-emerald-900 line-clamp-2 leading-tight">
                {cat.name}
              </span>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

      {/* 5. L'ESPRIT DU DON & DU FIHAVANANA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 sm:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                <span>🇲🇬</span>
                {t('home.loyaltyProgTitle', 'L\'Esprit du Don & du Fihavanana Malagasy')}
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] leading-tight">
                {t('home.earnApplesTitle', 'Donner pour faire grandir notre communauté, avec le cœur et sans rien attendre en retour')}
              </h2>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {t('home.earnApplesDesc', 'Sur Zarazarao, chaque don est un geste de pure générosité citoyenne. En offrant ce dont vous ne vous servez plus, vous illuminez le quotidien d\'un voisin, d\'une famille ou d\'un étudiant à Madagascar :')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="glass-card p-3.5 rounded-xl shadow-2xs">
                  <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>🎁</span> {t('home.bonusSignup', '100% Gratuit & Désintéressé')}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{t('home.bonusSignupSub', 'Aucun frais, aucune transaction financière. Un simple geste de cœur.')}</p>
                </div>

                <div className="glass-card p-3.5 rounded-xl shadow-2xs">
                  <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>🌿</span> {t('home.bonusProfile', 'Écologie & Seconde Vie')}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{t('home.bonusProfileSub', 'Donner au lieu de jeter : un acte solidaire qui protège notre belle île.')}</p>
                </div>

                <div className="glass-card p-3.5 rounded-xl shadow-2xs">
                  <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>🤝</span> {t('home.bonusFirstDonation', 'Le Vrai Fihavanana')}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{t('home.bonusFirstDonationSub', 'Tisser des liens humains chaleureux et bienveillants dans votre fokontany.')}</p>
                </div>

                <div className="glass-card p-3.5 rounded-xl shadow-2xs">
                  <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>🛡️</span> {t('home.bonusRandom', 'Confiance & Sécurité')}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{t('home.bonusRandomSub', 'Échanges privés, coordonnées protégées et respect mutuel garanti.')}</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-800 text-white rounded-2xl mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="font-black text-amber-300 text-lg">
                    {t('home.appleValueRatio', 'Un objet inutilisé chez vous ?')}
                  </div>
                  <div className="text-xs text-emerald-100">
                    {t('home.appleValueRatioSub', 'Prenez une photo en 30 secondes et faites un heureux dans votre quartier.')}
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('publish')}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer active:scale-95"
                >
                  {t('home.viewBalance', 'Proposer un don')}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="glass-card p-6 rounded-3xl shadow-lg max-w-sm w-full space-y-4 text-center">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-4xl shadow-inner text-emerald-700 dark:text-emerald-300">
                  🤝
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)]">{t('home.vaultTitle', 'La Joie Pure du Partage')}</h3>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                  {t('home.vaultDesc', '« Ny fihavanana toy ny tady mitondra aina ». Quand nous partageons, nous bâtissons ensemble une communauté malgache plus solidaire et plus humaine.')}
                </p>
                <div className="p-3 bg-emerald-500/10 rounded-xl font-semibold text-xs text-emerald-800 dark:text-emerald-300">
                  {t('home.vaultExample', '100% Gratuit • Sans contrepartie')}
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* 6. INTERACTIVE MAP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MadagascarMap
          donations={recentDonations}
          onSelectCity={(city) => {
            if (city !== 'all') onNavigate('explore', { city });
          }}
          onSelectDonation={(id) => {
            onNavigate('donation-detail', { id });
          }}
        />
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
              {t('home.joinMovement', 'Rejoignez le mouvement malgache')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              {t('home.readyToGive', 'Prêt à faire un geste solidaire aujourd\'hui ?')}
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              {t('home.readyToGiveSub', 'Donnez les vêtements trop petits de vos enfants, votre ancien téléphone, un livre ou une chaise. Quelqu\'un près de chez vous en a besoin.')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('publish')}
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              {t('home.ctaOfferFree', 'Proposer un don gratuit')}
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600 font-bold text-sm rounded-2xl transition-all active:scale-95 cursor-pointer"
            >
              {t('home.ctaBrowseDonations', 'Parcourir les dons disponibles')}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
