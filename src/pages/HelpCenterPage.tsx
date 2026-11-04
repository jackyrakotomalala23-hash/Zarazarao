import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

export const HelpCenterPage: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { qKey: 'help.q1', aKey: 'help.a1' },
    { qKey: 'help.q2', aKey: 'help.a2' },
    { qKey: 'help.q3', aKey: 'help.a3' },
    { qKey: 'help.q4', aKey: 'help.a4' },
    { qKey: 'help.q5', aKey: 'help.a5' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10"
    >
      
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full inline-block">
          {t('help.badge', 'Assistance & Questions fréquentes')}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
          {t('help.title', 'Centre d\'Aide Zarazarao')}
        </h1>
        <p className="text-sm text-gray-600">
          {t('help.subtitle', 'Tout ce que vous devez savoir pour donner et récupérer des objets sereinement à Madagascar.')}
        </p>
      </div>

      {/* Accordion */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="border-b border-gray-100 pb-3 last:border-none last:pb-0">
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full text-left py-3 flex items-center justify-between gap-4 font-bold text-sm text-gray-900 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                <span>{t(faq.qKey)}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-emerald-700" /> : <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.p 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-xs sm:text-sm text-gray-600 pb-3 leading-relaxed overflow-hidden"
                  >
                    {t(faq.aKey)}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Contact box with vibrant gradient */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-700 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <h3 className="font-black text-white text-base">{t('help.contactQuestion', 'Vous avez une question spécifique ?')}</h3>
          <p className="text-xs text-emerald-100 mt-1">{t('help.contactDesc', 'Notre équipe communautaire basée à Antananarivo vous répond sous 24h.')}</p>
        </div>
        <a
          href="mailto:contact@zarazarao.mg"
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-2"
        >
          <Mail className="w-4 h-4 text-emerald-950" />
          <span>{t('help.contactBtn', 'Écrire au support')}</span>
        </a>
      </motion.div>

    </motion.div>
  );
};
