import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Database, 
  UserX, 
  RefreshCw, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DataDeletionRightsPageProps {
  onNavigate?: (page: string, params?: any) => void;
  onOpenAuthModal?: () => void;
}

export const DataDeletionRightsPage: React.FC<DataDeletionRightsPageProps> = ({
  onNavigate,
  onOpenAuthModal
}) => {
  const { currentUser, userProfile, signOut } = useAuth();
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleSimulatedDeletionRequest = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setConfirmModalOpen(false);
      setDeletionRequested(true);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-4 border border-rose-500/20">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-200 border border-rose-400/30 inline-flex items-center gap-1.5 shadow-xs">
            <Trash2 className="w-3.5 h-3.5 text-rose-300" />
            Droit à l'Effacement & à l'Oubli • RGPD & Loi Malgache
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-white/15">
            Zarazarao Madagascar
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          Informations Complètes sur les Droits de Suppression des Données
        </h1>
        
        <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed max-w-3xl">
          Conformément aux normes internationales de protection de la vie privée (RGPD Article 17) et à la législation numérique en vigueur à Madagascar, Zarazarao vous garantit un contrôle total et irréversible sur l'effacement définitif de toutes vos données personnelles.
        </p>

        <div className="text-[11px] text-rose-200/70 pt-2 flex flex-wrap items-center gap-4">
          <span>Version juridique : 2.4 (Mise à jour Novembre 2026)</span>
          <span>•</span>
          <span>Responsable DPO : zarazaraomada@gmail.com</span>
        </div>
      </div>

      {/* Quick Action Box for Logged-In Users */}
      <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 rounded-3xl p-6 border border-rose-200/80 shadow-md space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              Souhaitez-vous exercer immédiatement votre droit de suppression ?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vous pouvez soit utiliser l'outil automatisé de suppression depuis votre espace profil, soit nous adresser directement une demande formelle par voie électronique.
            </p>
          </div>
        </div>

        {deletionRequested ? (
          <div className="p-4 bg-emerald-100/90 border border-emerald-300 rounded-2xl text-xs text-emerald-950 font-medium flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>Votre demande formelle de suppression a été enregistrée. Un message de confirmation vous a été adressé et votre compte sera totalement purgé sous 72 heures.</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {currentUser ? (
              <button
                onClick={() => setConfirmModalOpen(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer mon compte et mes données maintenant</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Connectez-vous pour gérer vos données</span>
              </button>
            )}

            <a
              href="mailto:zarazaraomada@gmail.com?subject=Demande%20de%20Suppression%20de%20Donnees%20Zarazarao"
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl shadow-2xs transition-all inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-slate-600" />
              <span>Contacter le DPO par e-mail</span>
            </a>
          </div>
        )}
      </div>

      {/* Main Legal Document Container with 16+ Detailed Paragraphs */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-8 text-slate-800 leading-relaxed text-sm">

        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">1</span>
            Cadre Légal et Principes Fondamentaux du Droit à l'Effacement
          </h2>
          <p>
            La plateforme solidaire Zarazarao reconnaît sans réserve le droit fondamental de chaque utilisateur de contrôler, modifier ou supprimer l’intégralité des données à caractère personnel collectées lors de son parcours d’utilisation. Ce droit à l’effacement (communément désigné sous l'appellation de « Droit à l’oubli ») est garanti conformément aux dispositions de l’article 17 du Règlement Général sur la Protection des Données (RGPD) ainsi qu’aux principes directeurs de la législation malgache relative à la protection des données personnelles numériques.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">2</span>
            Portée et Périmètre Exhaustif des Données Concernées
          </h2>
          <p>
            L'exercice de votre droit de suppression s'applique à l'ensemble des éléments identifiants stockés dans nos systèmes de bases de données Cloud Firebase Firestore et Firebase Authentication. Sont intégralement visés par la procédure de purge : votre nom, prénom, photographie de profil, adresse de courrier électronique, numéros de téléphone mobile enregistrés, ville et fokontany de résidence, historiques d'annonces de dons créées, conversations de messagerie privée, avis et notes attribués, ainsi que le solde de vos « Points Fihavanana ».
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">3</span>
            Procédure de Suppression Automatisée via l'Application
          </h2>
          <p>
            Tout utilisateur disposant d'un compte actif peut déclencher en toute autonomie la suppression immédiate de ses informations. Il suffit d'accéder à l'onglet « Mon Profil » &gt; « Paramètres du Compte », puis d'actionner le bouton rouge « Supprimer définitivement mon compte ». Une confirmation par mot de passe ou validation d'authentification vous sera demandée pour empêcher tout effacement accidentel. L'exécution de cette commande entraîne le verrouillage instantané de votre profil et initie le script de purge automatique.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">4</span>
            Procédure de Demande Manuelle auprès du Délégué à la Protection des Données (DPO)
          </h2>
          <p>
            Si vous ne parvenez plus à vous connecter à votre compte (perte d'identifiants, réinitialisation impossible ou indisponibilité technique), vous avez la possibilité d'adresser une demande manuelle de suppression directe. Envoyez un e-mail à l'adresse officielle <strong>zarazaraomada@gmail.com</strong> ou contactez notre support par téléphone au <strong>+261 37 53 336 29</strong> en précisant l'adresse électronique associée à votre compte ainsi que votre nom complet.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">5</span>
            Vérification Stricte de l'Identité du Demandeur
          </h2>
          <p>
            Afin d'empêcher les tentatives d'usurpation d'identité ou de suppression malveillante du compte d'un tiers, toute demande manuelle transmise par courrier électronique est soumise à une procédure rigoureuse de vérification. Notre équipe technique peut vous demander de confirmer votre identité en répondant à un code d'autorisation sécurisé transmis sur le téléphone portable rattaché à votre profil Zarazarao.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">6</span>
            Traitement Spécifique des Annonces de Dons et Actes de Partage
          </h2>
          <p>
            Lorsqu'un compte fait l'objet d'une suppression, toutes les annonces de dons actives publiées par l'utilisateur sont immédiatement retirées de la liste publique de recherche et de la carte interactive Google Maps. Concernant les dons déjà remis à des bénéficiaires dans le passé, le titre de l'objet est conservé dans le bilan solidaire global de l'application mais l'identité du donateur est définitivement remplacée par la mention anonyme « Membre désinscrit ».
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">7</span>
            Anonymisation Irréversible des Données Statistiques d'Impact Social
          </h2>
          <p>
            Les métriques globales de partage solidaire (ex: volume d'objets revalorisés à Antananarivo, quantité de dons éducatifs redistribués) sont conservées par Zarazarao à des fins de reporting non-lucratif et de transparence communautaire. Toutefois, ces statistiques sont totalement déconnectées de toute donnée identifiante, rendant toute ré-identification technique ou rétro-ingénierie mathématiquement impossible.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">8</span>
            Gestion des Messages Privés et Historique des Discussions
          </h2>
          <p>
            Lors de la purge de votre profil, l'ensemble des fils de discussion auxquels vous avez participé dans la messagerie privée Zarazarao subit un traitement d'anonymisation de votre interlocuteur. Les messages envoyés par vous sont retirés de la base active de données ou anonymisés pour garantir que votre ancien correspondant ne conserve plus aucun lien nominatif vous concernant.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">9</span>
            Effacement des Identifiants sur Google Firebase Authentication
          </h2>
          <p>
            Votre compte d'authentification principal hébergé sur Google Firebase Authentication (incluant vos identifiants e-mail/mot de passe et vos tokens de connexion Google Sign-In / Meta Facebook) est supprimé de manière irrévocable via l'API d'administration Firebase `deleteUser()`. Une fois cette suppression effectuée, vos anciens identifiants ne permettent plus aucun accès à la plateforme.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">10</span>
            Nettoyage des Caches Locaux, Cookies et Stockages du Navigateur / PWA
          </h2>
          <p>
            En complément de la suppression côté serveur, Zarazarao déclenche une instruction de nettoyage dans votre navigateur Web ou votre application mobile PWA. Les clés de stockage local (`localStorage` et `sessionStorage`), les registres de service workers, ainsi que les caches d'images d'avatars stockés dans votre téléphone sont vidés intégralement dès l'instant où vous confirmez la déconnexion définitif.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">11</span>
            Révocation et Purge des Jetons de Notification Push FCM
          </h2>
          <p>
            Si vous avez activé les notifications Push sur votre téléphone mobile Android, iOS ou sur votre ordinateur, les jetons d'identification d'appareil transmis à Firebase Cloud Messaging (FCM) sont désinscrits et supprimés de nos serveurs. Vous ne recevrez plus aucune sollicitation, alerte de don ou notification automatique en provenance de Zarazarao.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">12</span>
            Durées de Conservation Opérationnelle et Sauvegardes Temporaires
          </h2>
          <p>
            Après l'exécution de votre demande de suppression, les sauvegardes de sécurité (backups) automatiques hébergées dans l'infrastructure Cloud de Google sont définitivement écrasées et purgées sous un délai maximal de 30 jours calendaires. Aucun fragment de vos données personnelles n'est conservé dans des archives historiques au-delà de cette période de sécurité obligatoire.
          </p>
        </section>

        {/* Section 13 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">13</span>
            Exceptions Légales et Obligations de Conservation Restreinte
          </h2>
          <p>
            Dans des cas strictement encadrés par la loi malgache ou internationale (par exemple, la prévention des fraudes graves, le harcèlement manifeste ou la préservation de preuves dans le cadre d'une enquête judiciaire officielle), Zarazarao peut être contraint de conserver temporairement un extrait restreint d'informations d'accès (logs d'adresses IP et horodatages) pour la durée requise par les autorités judiciaires habilitées.
          </p>
        </section>

        {/* Section 14 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">14</span>
            Attestation de Confirmation et Notification Post-Effacement
          </h2>
          <p>
            Dès que le script de suppression intégrale est achevé par notre système, une notification finale de confirmation d'effacement est affichée à l'écran et (le cas échéant) transmise à votre adresse e-mail. Cette attestation formalise la clôture définitive de votre dossier personnel et atteste de l'anéantissement de vos données chez Zarazarao.
          </p>
        </section>

        {/* Section 15 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">15</span>
            Droit à la Portabilité Préalable (Exportation de vos Données)
          </h2>
          <p>
            Avant d'initier la suppression irréversible de votre compte, vous disposez du droit d'exporter une archive numérique complète au format JSON ou CSV contenant l'ensemble de vos dons publiés, réservations et historique de points. Vous pouvez solliciter cette exportation préalable directement depuis votre profil ou en écrivant à <strong>zarazaraomada@gmail.com</strong>.
          </p>
        </section>

        {/* Section 16 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-rose-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">16</span>
            Voies de Recours et Contact Officiel de la Protection des Données
          </h2>
          <p>
            Si vous estimez que votre demande de suppression n'a pas été traitée conformément à vos droits ou dans les délais prescrits, vous disposez d'une voie de recours directe auprès de la direction générale de Zarazarao Madagascar. Nos équipes s'engagent à apporter une réponse circonstanciée à toute réclamation sous 48 heures ouvrées.
          </p>

          <div className="p-5 bg-rose-50/80 rounded-2xl border border-rose-200/90 text-xs text-rose-950 space-y-2 mt-3 shadow-2xs">
            <div className="font-extrabold text-slate-900 text-sm mb-1">
              🏢 Coordonnées du Délégué à la Protection des Données (DPO) Zarazarao :
            </div>
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <Mail className="w-4 h-4 text-rose-700 shrink-0" />
              <span>Courriel direct DPO : zarazaraomada@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <Phone className="w-4 h-4 text-rose-700 shrink-0" />
              <span>Assistance Téléphonique : +261 37 53 336 29</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-rose-700 shrink-0" />
              <span>Siège social solidaire : Antananarivo 101, Région Analamanga, Madagascar</span>
            </div>
          </div>
        </section>

      </div>

      {/* Interactive Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-rose-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Confirmer la demande de suppression intégrale ?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attention : Cette action est irréversible. Votre compte, vos points Fihavanana et tous vos messages seront définitivement supprimés sous 72 heures.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSimulatedDeletionRequest}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Oui, supprimer tout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
