import React from 'react';
import { motion } from 'motion/react';
import { PlusCircle, Search, MessageSquare, CheckCircle2, Gift, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface HowItWorksPageProps {
  onNavigate: (page: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto space-y-3"
      >
        <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
          Zarazarao
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 via-purple-900 to-amber-700">
          {t('how.title')}
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('how.subtitle')}
        </p>
      </motion.div>

      {/* 3 Core Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          whileHover={{ y: -6 }}
          className="bg-white/90 backdrop-blur-xs rounded-3xl p-6 border border-gray-200/80 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all space-y-3 relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-md">
            1
          </div>
          <h3 className="text-base font-bold text-gray-900">{t('how.step1.title')}</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {t('how.step1.desc')}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -6 }}
          className="bg-white/90 backdrop-blur-xs rounded-3xl p-6 border border-gray-200/80 hover:border-purple-500 shadow-sm hover:shadow-xl transition-all space-y-3 relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-black text-sm shadow-md">
            2
          </div>
          <h3 className="text-base font-bold text-gray-900">{t('how.step2.title')}</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {t('how.step2.desc')}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -6 }}
          className="bg-white/90 backdrop-blur-xs rounded-3xl p-6 border border-gray-200/80 hover:border-amber-500 shadow-sm hover:shadow-xl transition-all space-y-3 relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-black text-sm shadow-md">
            3
          </div>
          <h3 className="text-base font-bold text-gray-900">{t('how.step3.title')}</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {t('how.step3.desc')}
          </p>
        </motion.div>

      </div>

      {/* Loyalty Apple Banner with Vibrant Gradient */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden space-y-4 border border-white/20"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #065f46 50%, #f59e0b 100%)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍎</span>
          <span className="text-xs font-black uppercase tracking-widest text-amber-300">
            {t('footer.loyalty')}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Convertissez vos Pommes en vrais bons d’achat (1000 Pommes = 1000 Ar)
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-2xl">
          Chaque fois que vous offrez un objet ou complétez votre profil, vous accumulez des Pommes solidaires. Dès 1000 Pommes, générez un bon d’achat sécurisé avec code-barres et code à 8 chiffres utilisable directement en caisse de nos supermarchés et enseignes partenaires à Madagascar.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('publish')}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('hero.cta.publish')}</span>
          </button>
          <button
            onClick={() => onNavigate('explore')}
            className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <span>{t('hero.cta.explore')}</span>
          </button>
        </div>
      </motion.div>

    </div>
  );
};
