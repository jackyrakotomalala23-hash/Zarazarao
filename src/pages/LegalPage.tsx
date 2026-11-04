import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Lock } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

export const LegalPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-gray-700"
    >
      
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100 px-3 py-1 rounded-full inline-block">
          {t('legal.badge', 'Cadre réglementaire & Confidentialité')}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
          {t('legal.title', 'Mentions Légales & Politique de Confidentialité')}
        </h1>
        <p className="text-xs text-gray-500">
          {t('legal.subtitle', 'Conformité avec la législation malgache (Loi n° 2014-038) sur la protection des données personnelles.')}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" />
            {t('legal.sec1Title', '1. Nature du service et Charte de gratuité')}
          </h2>
          <p>
            {t('legal.sec1Text', 'Zarazarao est une plateforme communautaire à vocation sociale et solidaire permettant le don d\'objets inutilisés à Madagascar. Le service est strictement gratuit : aucune rémunération, contrepartie financière ou commission n\'est prélevée entre membres.')}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-700" />
            {t('legal.sec2Title', '2. Protection des données personnelles (Loi n° 2014-038)')}
          </h2>
          <p>
            {t('legal.sec2Text', 'Conformément à la législation malgache régissant la protection des données à caractère personnel, les informations collectées (nom, téléphone, ville, fokontany) sont traitées loyalement et licitement afin de permettre la mise en relation entre donateurs et bénéficiaires.')}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-700" />
            {t('legal.sec3Title', '3. Vos droits')}
          </h2>
          <p>
            {t('legal.sec3Text', 'Tout utilisateur dispose d\'un droit d\'accès, de rectification et de suppression de ses données personnelles. Vous pouvez à tout moment demander la clôture et la suppression définitive de votre compte depuis vos paramètres.')}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <span>🍎</span>
            {t('legal.sec4Title', '4. Programme de fidélité et bons d\'achat')}
          </h2>
          <p>
            {t('legal.sec4Text', 'Les pommes virtuelles attribuées constituent un programme de fidélité et de remerciement (1000 Pommes = 1000 Ar). Elles ne constituent ni une monnaie légale ni une valeur remboursable en espèces.')}
          </p>
        </section>

      </div>

    </motion.div>
  );
};
