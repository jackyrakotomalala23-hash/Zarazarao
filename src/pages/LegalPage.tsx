import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Lock, Scale, Award, AlertCircle } from 'lucide-react';
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
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100 px-3.5 py-1 rounded-full inline-block">
          Cadre Réglementaire & Politique Officielle (Version Intégrale)
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
          Mentions Légales, CGU & Politique de Confidentialité
        </h1>
        <p className="text-xs text-gray-500">
          Conformité stricte avec la législation malgache en vigueur (Loi n° 2014-038 sur la protection des données personnelles et commerce électronique).
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-12 border border-gray-200/80 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed">
        
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-950 font-medium text-xs">
          <strong>Note Préliminaire :</strong> Zarazarao est une plateforme citoyenne et solidaire à but non lucratif favorisant l'économie circulaire, le réemploi d'objets et l'esprit de partage malgache (« Fihavanana »).
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            Article 1 — Objet et Champ d'Application
          </h2>
          <p>
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès, l'inscription et l'utilisation de la plateforme web et mobile Zarazarao, éditée pour la mise en relation gratuite entre particuliers désireux de donner des objets dont ils n'ont plus l'utilité à Madagascar.
          </p>
          <p>
            L'utilisation de la plateforme implique l'acceptation entière et sans réserve de la présente charte par l'utilisateur (ci-après « Membre »).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            Article 2 — Charte de Gratuité Absolue & Interdiction de Vente
          </h2>
          <p>
            Zarazarao repose sur un principe fondateur et inviolable : <strong>la gratuité totale de tous les objets partagés</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
            <li>Aucun prix de vente, frais de scolarité, commission ou contrepartie financière ne peut être exigé pour un objet publié.</li>
            <li>Il est formellement interdit de détourner les annonces gratuites pour proposer des ventes déguisées, des trocs payants ou des services marchands.</li>
            <li>Tout contrevenant fera l'objet d'un bannissement définitif et immédiat de la plateforme.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-700" />
            Article 3 — Protection des Données Personnelles (Loi n° 2014-038)
          </h2>
          <p>
            Conformément à la Loi n° 2014-038 relative à la protection des données à caractère personnel à Madagascar, les informations nominatives recueillies lors de l'inscription (nom, prénom, numéro de téléphone, ville, fokontany) font l'objet d'un traitement informatique sécurisé strictement destiné à la mise en relation entre donateurs et bénéficiaires.
          </p>
          <p>
            <strong>Confidentialité de l'adresse exacte :</strong> L'adresse exacte du domicile des membres n'est jamais divulguée publiquement. Seuls la ville et le fokontany sont visibles. Les coordonnées de contact ne s'échangent que via la messagerie sécurisée interne.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-700" />
            Article 4 — Engagements et Responsabilités du Donateur
          </h2>
          <p>
            Le membre publiant un don garantit :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
            <li>Qu'il est légitimement propriétaire de l'objet offert et que celui-ci est libre de tout gage ou interdiction.</li>
            <li>Que les photographies publiées correspondent fidèlement à l'état réel de l'objet au moment de l'annonce.</li>
            <li>Que l'objet respecte la liste des objets autorisés (exclusion formelle de produits dangereux, contrefaçons, médicaments ou denrées périssables).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Article 5 — Engagements du Bénéficiaire et Ponctualité
          </h2>
          <p>
            Le bénéficiaire sélectionné s'engage à honorer ses rendez-vous de remise aux date, heure et lieu fixés de concert avec le donateur. En cas d'empêchement majeur, il s'engage à prévenir via la messagerie avec un préavis raisonnable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Article 6 — Sécurité lors des Remises Physiques
          </h2>
          <p>
            Zarazarao agit en qualité d'intermédiaire technique de mise en relation. Les rencontres physiques pour la remise des objets s'effectuent sous la seule responsabilité des utilisateurs. Il est fortement recommandé de privilégier les lieux publics fréquentés en journée (marchés, parvis d'églises, centres communautaires).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            Article 7 — Droits d'Accès, de Rectification et de Suppression
          </h2>
          <p>
            Tout utilisateur dispose à tout moment d'un droit total d'accès, de rectification et de suppression des données le concernant. La clôture définitive du compte peut s'effectuer directement depuis les paramètres de profil ou par simple demande écrite au support technique.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-700" />
            Article 8 — Propriété Intellectuelle
          </h2>
          <p>
            L'ensemble des éléments graphiques, logiciels, bases de données, chartes visuelles et textes de la plateforme Zarazarao sont protégés par les lois internationales et nationales relatives à la propriété intellectuelle. Toute reproduction non autorisée est passible de poursuites.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-gray-800" />
            Article 9 — Loi Applicable et Juridiction Compétente
          </h2>
          <p>
            Les présentes conditions sont régies, interprétées et appliquées conformément au droit malgache. En cas de litige persistant né de l'interprétation ou de l'exécution des présentes CGU, compétence expresse est attribuée aux tribunaux compétents d'Antananarivo.
          </p>
        </section>

      </div>

    </motion.div>
  );
};
