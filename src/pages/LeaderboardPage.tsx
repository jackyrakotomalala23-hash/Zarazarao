import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Sparkles } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface LeaderboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

interface TopDonor {
  rank: number;
  name: string;
  city: string;
  recoveredCount: number;
  publishedCount: number;
  badgeKey: string;
  avatar: string;
}

const TOP_DONORS: TopDonor[] = [
  {
    rank: 1,
    name: 'Mialy Rakoto',
    city: 'Antananarivo (Analamanga)',
    recoveredCount: 28,
    publishedCount: 32,
    badgeKey: 'Ambassadrice du Partage',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    rank: 2,
    name: 'Andry Randrianarisoa',
    city: 'Toamasina (Atsinanana)',
    recoveredCount: 22,
    publishedCount: 25,
    badgeKey: 'Donateur Engagé',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    rank: 3,
    name: 'Soa Raharisoa',
    city: 'Antsirabe (Vakinankaratra)',
    recoveredCount: 19,
    publishedCount: 21,
    badgeKey: 'Championne de la Réutilisation',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
  },
  {
    rank: 4,
    name: 'Faly Rajaona',
    city: 'Mahajanga (Boeny)',
    recoveredCount: 15,
    publishedCount: 18,
    badgeKey: 'Membre Solidaire',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  },
  {
    rank: 5,
    name: 'Nirina Rabe',
    city: 'Fianarantsoa (Haute Matsiatra)',
    recoveredCount: 12,
    publishedCount: 14,
    badgeKey: 'Membre Solidaire',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  }
];

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10"
    >
      
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-bold shadow-2xs">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          {t('lead.badge', 'Reconnaissance & Fihavanana')}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
          {t('lead.title', 'Classement des Meilleurs Donateurs')}
        </h1>
        <p className="text-sm text-gray-600">
          {t('lead.subtitle', 'Ce classement valorise les membres les plus généreux selon le nombre d\'objets réellement remis à des bénéficiaires malgaches.')}
        </p>
      </div>

      {/* Top 3 Podium with vibrant multi-color gradients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
        {/* Rank 2 - Silver / Purple Gradient */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-b from-slate-50 via-purple-50/30 to-white rounded-3xl p-6 border border-slate-200 text-center space-y-3 order-2 md:order-1 shadow-sm"
        >
          <div className="relative inline-block">
            <img src={TOP_DONORS[1].avatar} alt="" className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-slate-300" />
            <span className="absolute -bottom-2 right-2 w-7 h-7 bg-slate-300 text-slate-900 rounded-full flex items-center justify-center font-black text-xs shadow-xs">
              2
            </span>
          </div>
          <h3 className="font-bold text-gray-900">{TOP_DONORS[1].name}</h3>
          <p className="text-xs text-gray-500">{TOP_DONORS[1].city}</p>
          <div className="text-xs font-black text-purple-900 bg-purple-100/80 py-1.5 px-3 rounded-xl">
            {TOP_DONORS[1].recoveredCount} {t('lead.transmitted', 'dons transmis')}
          </div>
        </motion.div>

        {/* Rank 1 (Gold) - Amber/Emerald Vibrant Gradient */}
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-b from-amber-100 via-amber-50 to-white rounded-3xl p-8 border-2 border-amber-400 text-center space-y-3 order-1 md:order-2 shadow-lg relative -mt-4"
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-emerald-950 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-900" />
            <span>{t('lead.nationalRank1', 'N°1 National')}</span>
          </div>
          <div className="relative inline-block mt-2">
            <img src={TOP_DONORS[0].avatar} alt="" className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-amber-400 shadow-md" />
            <span className="absolute -bottom-2 right-2 w-8 h-8 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center font-black text-sm shadow-xs">
              1
            </span>
          </div>
          <h3 className="text-lg font-black text-gray-900">{TOP_DONORS[0].name}</h3>
          <p className="text-xs text-gray-500">{TOP_DONORS[0].city}</p>
          <div className="text-sm font-black text-emerald-950 bg-amber-200/90 py-2 px-4 rounded-xl shadow-2xs">
            {TOP_DONORS[0].recoveredCount} {t('lead.transmitted', 'dons transmis')}
          </div>
        </motion.div>

        {/* Rank 3 - Bronze / Indigo Gradient */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-b from-amber-50/40 via-indigo-50/30 to-white rounded-3xl p-6 border border-amber-200 text-center space-y-3 order-3 md:order-3 shadow-sm"
        >
          <div className="relative inline-block">
            <img src={TOP_DONORS[2].avatar} alt="" className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-amber-700/60" />
            <span className="absolute -bottom-2 right-2 w-7 h-7 bg-amber-700 text-white rounded-full flex items-center justify-center font-black text-xs shadow-xs">
              3
            </span>
          </div>
          <h3 className="font-bold text-gray-900">{TOP_DONORS[2].name}</h3>
          <p className="text-xs text-gray-500">{TOP_DONORS[2].city}</p>
          <div className="text-xs font-black text-amber-900 bg-amber-100/80 py-1.5 px-3 rounded-xl">
            {TOP_DONORS[2].recoveredCount} {t('lead.transmitted', 'dons transmis')}
          </div>
        </motion.div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-black text-gray-900">{t('lead.engagedMembers', 'Membres engagés de la communauté')}</h3>

        <div className="divide-y divide-gray-100">
          {TOP_DONORS.map((donor) => (
            <motion.div 
              key={donor.rank} 
              whileHover={{ backgroundColor: '#f8fafc' }}
              className="py-4 px-2 rounded-2xl transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <span className="w-6 font-black text-gray-400 text-center text-sm">
                  #{donor.rank}
                </span>
                <img src={donor.avatar} alt="" className="w-11 h-11 rounded-full object-cover border border-gray-200" />
                <div>
                  <div className="font-bold text-sm text-gray-900">{donor.name}</div>
                  <div className="text-xs text-gray-500">{donor.city}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-100">
                  {donor.badgeKey}
                </span>
                <div className="text-right">
                  <div className="font-black text-sm text-emerald-950">{donor.recoveredCount}</div>
                  <div className="text-[10px] text-gray-400">{t('lead.receivedDons', 'dons reçus')}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};
