import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

export const CommunityRulesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      <div className="space-y-2 text-center md:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block">
          {t('rules.badge', 'Charte d\'éthique et de confiance')}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
          {t('rules.title', 'Règles de la Communauté Zarazarao')}
        </h1>
        <p className="text-sm text-gray-600">
          {t('rules.subtitle', 'Pour préserver l\'esprit d\'entraide, de respect et de sécurité à Madagascar.')}
        </p>
      </div>

      {/* The 4 Non-Negotiable Pillars with vibrant multi-color gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-3xl border border-emerald-200/80 shadow-xs space-y-2"
        >
          <div className="flex items-center gap-2 font-black text-base text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {t('rules.p1Title', '1. Gratuité absolue')}
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            {t('rules.p1Desc', 'Tout ce qui est publié sur Zarazarao est 100% gratuit. Aucun prix de vente, compensation financière ou frais déguisé ne peut être exigé.')}
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-white rounded-3xl border border-purple-200/80 shadow-xs space-y-2"
        >
          <div className="flex items-center gap-2 font-black text-base text-purple-950">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
            {t('rules.p2Title', '2. Honnêteté et photos réelles')}
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            {t('rules.p2Desc', 'Les photos doivent impérativement montrer l\'objet réel dans son état actuel. Les photos d\'illustration tirées d\'Internet sont interdites.')}
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-white rounded-3xl border border-amber-200/80 shadow-xs space-y-2"
        >
          <div className="flex items-center gap-2 font-black text-base text-amber-950">
            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
            {t('rules.p3Title', '3. Respect et ponctualité')}
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            {t('rules.p3Desc', 'Honorez vos rendez-vous de remise. Si vous avez un empêchement, prévenez immédiatement via la messagerie Zarazarao.')}
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-cyan-50 via-blue-50 to-white rounded-3xl border border-cyan-200/80 shadow-xs space-y-2"
        >
          <div className="flex items-center gap-2 font-black text-base text-cyan-950">
            <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0" />
            {t('rules.p4Title', '4. Sécurité lors des rencontres')}
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            {t('rules.p4Desc', 'Privilégiez les remises en journée dans des lieux publics faciles d\'accès si vous ne connaissez pas l\'autre personne.')}
          </p>
        </motion.div>

      </div>

      {/* Prohibited items */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 rounded-3xl p-6 sm:p-8 border border-red-200 space-y-4 shadow-xs"
      >
        <div className="flex items-center gap-2 text-red-950 font-black text-base">
          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          {t('rules.prohibitedHeader', 'Objets formellement interdits au don sur Zarazarao')}
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-red-900">
          <li>{t('rules.item1', '❌ Médicaments, produits de santé sur ordonnance')}</li>
          <li>{t('rules.item2', '❌ Armes, munitions, couteaux et feux d\'artifice')}</li>
          <li>{t('rules.item3', '❌ Animaux vivants (sauvages ou domestiques)')}</li>
          <li>{t('rules.item4', '❌ Produits périssables ou aliments entamés')}</li>
          <li>{t('rules.item5', '❌ Contrefaçons et produits illicites')}</li>
          <li>{t('rules.item6', '❌ Produits chimiques dangereux ou inflammables')}</li>
        </ul>
      </motion.div>

    </motion.div>
  );
};
