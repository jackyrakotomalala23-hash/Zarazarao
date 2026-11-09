import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, FileText, CheckCircle2, AlertTriangle, Scale, Lock, Mail, Phone, MapPin } from 'lucide-react';

interface CGUPageProps {
  onNavigate?: (page: string) => void;
}

export const CGUPage: React.FC<CGUPageProps> = ({ onNavigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden space-y-3">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          Document Juridique Officiel • Zarazarao Madagascar
        </span>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Conditions Générales d'Utilisation (CGU) & Charte Fihavanana
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
          En accédant et en utilisant la plateforme communautaire Zarazarao, vous acceptez sans réserve les présentes conditions régissant le don gratuit, l'entraide citoyenne et la sécurité des échanges à Madagascar.
        </p>
        <div className="text-[11px] text-emerald-200/80 pt-1">
          Dernière mise à jour : 9 Novembre 2026 • Version 2.4 (Conforme aux lois malgaches)
        </div>
      </div>

      {/* Content Section Cards */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-10 shadow-xs space-y-8 text-gray-800 leading-relaxed text-sm">
        
        {/* Article 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">1</span>
            Objet et Philosophie de la Plateforme
          </h2>
          <p>
            Zarazarao est une plateforme communautaire 100% gratuite dédiée à la solidarité, au réemploi et au soutien des foyers à Madagascar. Elle repose sur la valeur fondamentale malgache du <strong>Fihavanana</strong>. L'objectif premier est de favoriser le don d'objets, vêtements, matériels scolaires, meubles et équipements d'occasion sans aucune transaction financière ou contrepartie monétaire.
          </p>
        </section>

        {/* Article 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">2</span>
            Principe Strict de Gratuité (Absence Totale de Vente)
          </h2>
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-950 font-medium text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              Interdiction Stricte de Commercialisation ou Revente :
            </p>
            <p>
              Tout don publié sur Zarazarao doit être offert à titre purement gratuit. Il est formellement interdit de réclamer une somme d'argent, des frais de réservation, des recharges téléphoniques ou des contreparties financières sous quelque prétexte que ce soit. Tout utilisateur coupable d'une telle tentative sera immédiatement et définitivement banni.
            </p>
          </div>
        </section>

        {/* Article 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">3</span>
            Inscription, Profil et Authenticité des Informations
          </h2>
          <p>
            Pour s'inscrire sur Zarazarao, l'utilisateur s'engage à fournir des informations exactes (Nom, Prénom, Ville de résidence, Fokontany et Numéro de téléphone fonctionnel). La création de comptes multiples dans le but d'accaparer artificiellement des dons est strictement prohibée. L'utilisateur est responsable de la confidentialité de son mot de passe et de son accès au compte.
          </p>
        </section>

        {/* Article 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">4</span>
            Objets Prohibés et Conformes à la Réglementation
          </h2>
          <p>
            Les utilisateurs s'interdisent de publier ou de donner sur la plateforme :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-700">
            <li>Des médicaments, prescriptions médicales, substances illicites ou produits dangereux.</li>
            <li>Des armes, objets contrefaits, ou volés.</li>
            <li>Des aliments périmés ou impropres à la consommation.</li>
            <li>Des objets portant atteinte aux bonnes mœurs ou à la dignité d'autrui.</li>
          </ul>
        </section>

        {/* Article 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">5</span>
            Processus de Suivi, Réservation et Confirmation de Remise
          </h2>
          <p>
            La réservation d'un objet s'effectue via le système de suivi sécurisé en 4 étapes horodatées dans la messagerie :
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-xs text-gray-700">
            <li><strong>Réservation par le Donateur :</strong> Le donateur sélectionne le bénéficiaire de son choix.</li>
            <li><strong>Acceptation par le Bénéficiaire :</strong> Le destinataire confirme son intérêt et accepte la réservation.</li>
            <li><strong>Marquage en Livré :</strong> Le donateur confirme la remise physique de l'objet.</li>
            <li><strong>Confirmation de Réception :</strong> Le bénéficiaire valide la réception effective. Chaque étape demeure révocable en cas de désaccord avant validation finale.</li>
          </ol>
        </section>

        {/* Article 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">6</span>
            Évaluation et Avis Communautaires
          </h2>
          <p>
            À la suite d'une livraison réussie, le bénéficiaire est invité à évaluer le donateur (note sur 5 étoiles et commentaire). Les évaluations sont rendues publiques sur le profil pour encourager la confiance et valoriser la générosité des membres.
          </p>
        </section>

        {/* Article 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">7</span>
            Contact et Support Officiel
          </h2>
          <p>
            Pour toute question ou demande d'assistance juridique concernant les présent CGU, veuillez contacter l'administration de Zarazarao :
          </p>
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>Téléphone : +261 37 53 336 29</span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <Mail className="w-4 h-4 text-emerald-700" />
              <span>E-mail : zarazaraomada@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Siège communautaire : Analakely, Antananarivo 101, Madagascar</span>
            </div>
          </div>
        </section>

      </div>
    </motion.div>
  );
};
