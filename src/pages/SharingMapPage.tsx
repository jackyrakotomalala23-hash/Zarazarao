import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MadagascarMap } from '@/components/common/MadagascarMap';
import { donationService } from '@/services/donationService';
import { Donation } from '@/types';
import { MADAGASCAR_CITIES } from '@/config/constants';
import { MapPin, Filter, Flame, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface SharingMapPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const SharingMapPage: React.FC<SharingMapPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedFokontany, setSelectedFokontany] = useState<string>('all');

  useEffect(() => {
    async function fetchAll() {
      try {
        const data = await donationService.getDonations({ limitCount: 150 });
        setDonations(data);
      } catch (err) {
        console.error('Failed to load donations for map:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Compute available fokontanys based on selected city
  const currentCityObj = MADAGASCAR_CITIES.find(
    c => c.name.toLowerCase() === selectedCity.toLowerCase()
  );
  const availableFokontanys = currentCityObj?.fokontanys || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {t('map.badge', 'Google Maps Platform Madagascar')}
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-600" />
              {t('map.heatBadge', 'Concentrations thermiques')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            {t('map.title', 'La Carte Interactive du Partage')}
          </h1>
          <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
            {t('map.subtitle', 'Explorez les concentrations de dons à travers Madagascar. Cliquez sur un quartier (fokontany), une ville ou un marqueur pour afficher les objets immédiatement disponibles.')}
          </p>
        </div>

        {/* Quick Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-200 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-gray-400 ml-2" />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedFokontany('all');
              }}
              className="text-xs font-bold text-gray-800 bg-transparent py-1.5 px-2 focus:outline-hidden"
            >
              <option value="all">{t('map.allCities', 'Toutes les villes')}</option>
              {MADAGASCAR_CITIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {availableFokontanys.length > 0 && (
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-200 shadow-2xs animate-in fade-in duration-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 ml-2" />
              <select
                value={selectedFokontany}
                onChange={(e) => setSelectedFokontany(e.target.value)}
                className="text-xs font-bold text-emerald-900 bg-transparent py-1.5 px-2 focus:outline-hidden"
              >
                <option value="all">{t('map.allFokontanys', 'Tous les fokontanys')} ({currentCityObj?.name})</option>
                {availableFokontanys.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => onNavigate('explore', { city: selectedCity !== 'all' ? selectedCity : undefined })}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t('map.viewList', 'Voir en liste')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Google Maps Component */}
      <MadagascarMap
        donations={donations}
        selectedCity={selectedCity}
        selectedFokontany={selectedFokontany}
        onSelectCity={(city) => {
          setSelectedCity(city);
          setSelectedFokontany('all');
        }}
        onSelectDonation={(id) => {
          onNavigate('donation-detail', { id });
        }}
      />

      {/* Geography Highlights & Fokontany Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -3 }} className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-5 rounded-3xl border border-emerald-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0 font-bold">
            🏙️
          </div>
          <div>
            <div className="text-xl font-black text-gray-900">
              {MADAGASCAR_CITIES.length}
            </div>
            <div className="text-xs font-medium text-gray-600">
              {t('map.statConnectedCities', 'Villes & Provinces reliées')}
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="bg-gradient-to-br from-purple-50 via-indigo-50 to-white p-5 rounded-3xl border border-purple-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl shrink-0 font-bold">
            📍
          </div>
          <div>
            <div className="text-xl font-black text-gray-900">
              {MADAGASCAR_CITIES.reduce((acc, c) => acc + c.fokontanys.length, 0)}+
            </div>
            <div className="text-xs font-medium text-gray-600">
              {t('map.statFokontanys', 'Fokontanys référencés')}
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="bg-gradient-to-br from-amber-50 via-orange-50 to-white p-5 rounded-3xl border border-amber-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shrink-0 font-bold">
            🎁
          </div>
          <div>
            <div className="text-xl font-black text-gray-900">
              {donations.filter(d => d.status === 'DISPONIBLE').length}
            </div>
            <div className="text-xs font-medium text-gray-600">
              {t('map.statActiveDonations', 'Dons disponibles actuellement')}
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="bg-gradient-to-br from-cyan-50 via-blue-50 to-white p-5 rounded-3xl border border-cyan-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center text-xl shrink-0 font-bold">
            🤝
          </div>
          <div>
            <div className="text-xl font-black text-gray-900">
              100%
            </div>
            <div className="text-xs font-medium text-gray-600">
              {t('map.statZeroFee', 'Gratuit, zéro frais')}
            </div>
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};
