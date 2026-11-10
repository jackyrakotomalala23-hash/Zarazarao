import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, UserCheck, HardDrive, Bell, Phone, Mail, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

interface DataPrivacyPageProps {
  onNavigate?: (page: string) => void;
}

export const DataPrivacyPage: React.FC<DataPrivacyPageProps> = ({ onNavigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden space-y-3">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 inline-flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-300" />
          Transparence & Protection des Données • Madagascar
        </span>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Politique de Confidentialité & Utilisation des Données Collectées
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
          Chez Zarazarao, la protection de votre vie privée et de vos informations personnelles est sacrée. Ce document détaille de façon exhaustive les types de données récoltées, leurs finalités précises et vos droits de contrôle.
        </p>
        <div className="text-[11px] text-emerald-200/80 pt-1">
          Dernière révision : 9 Novembre 2026 • Zarazarao Madagascar
        </div>
      </div>

      {/* Main Multi-Paragraph Privacy Document (15+ Paragraphs) */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-10 shadow-xs space-y-8 text-gray-800 leading-relaxed text-sm">

        {/* Paragraph 1 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            1. Engagement Général de Confidentialité
          </h2>
          <p>
            La plateforme communautaire Zarazarao s'engage formellement à respecter la confidentialité de l'ensemble des données personnelles transmises par ses utilisateurs à Madagascar. Notre démarche est guidée par la transparence, l'éthique solidaire du Fihavanana et le respect de la législation malgache et internationale sur la protection des données numériques.
          </p>
        </section>

        {/* Paragraph 2 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            2. Identité du Responsable de Traitement
          </h2>
          <p>
            Les données à caractère personnel collectées sur l'application et le site web Zarazarao sont traitées sous la responsabilité de l'équipe de gestion Zarazarao Madagascar. Pour toute question ou demande concernant vos données, notre délégué à la protection des données est joignable directement par téléphone au <strong>+261 37 53 336 29</strong> ou par courrier électronique à l'adresse <strong>zarazaraomada@gmail.com</strong>.
          </p>
        </section>

        {/* Paragraph 3 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            3. Catégories de Données Collectées lors de l'Inscription
          </h2>
          <p>
            Lorsque vous créez un compte sur Zarazarao (via e-mail/mot de passe ou via le bouton Google Sign-In), nous collectons votre nom, prénom, adresse e-mail, ville de résidence (ex: Antananarivo, Toamasina, Antsirabe, Mahajanga), fokontany de rattachement ainsi que votre numéro de téléphone portable. Ces données sont indispensables pour vérifier la présence réelle des utilisateurs et prévenir les faux comptes.
          </p>
        </section>

        {/* Paragraph 4 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            4. Données Relatives aux Annonces de Dons Publiées
          </h2>
          <p>
            Pour chaque don créé par un utilisateur, la plateforme enregistre le titre de l'objet, sa description détaillée, sa catégorie (Vêtements, Électronique, Mobilier, Écoles, etc.), son score d'état, les photographies téléversées, le mode de remise privilégié ainsi que les instructions de récupération spécifiées par le donateur.
          </p>
        </section>

        {/* Paragraph 5 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            5. Données de Géolocalisation et Cartographie Interactive
          </h2>
          <p>
            Pour permettre l'affichage des dons sur la carte interactive Google Maps de Madagascar, nous enregistrons les coordonnées approximatives liées à votre ville et fokontany. Nous privilégions une géolocalisation par quartier/fokontany plutôt qu'une adresse exacte exacte au mètre près, préservant ainsi la tranquillité et l'intimité de votre domicile familial.
          </p>
        </section>

        {/* Paragraph 6 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            6. Données de Messagerie Privée et Échanges en Temps Réel
          </h2>
          <p>
            Les messages échangés entre les donateurs et les bénéficiaires sont conservés de manière hautement sécurisée dans notre base de données Firestore. Ces conversations permettent d'organiser la remise des objets, de convenir des rendez-vous et de conserver l'historique des réservations. L'administration ne consulte jamais vos conversations privées sauf en cas de signalement pour fraude ou propos injurieux.
          </p>
        </section>

        {/* Paragraph 7 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            7. Intégration de la Fonction d'Appel Direct WhatsApp
          </h2>
          <p>
            Lorsque deux utilisateurs initient un appel depuis la messagerie Zarazarao, l'application vérifie la présence du numéro de téléphone enregistré dans le profil de l'interlocuteur et redirige l'appel vers l'application WhatsApp. Seul un horodatage et une note du journal d'appel sont consignés dans la discussion pour formaliser le suivi des échanges.
          </p>
        </section>

        {/* Paragraph 8 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            8. Finalités Principales du Traitement des Données
          </h2>
          <p>
            La collecte de vos données répond exclusivement aux finalités suivantes : assurer le fonctionnement de la plateforme de dons, mettre en relation directe les citoyens malgaches, vérifier l'attribution équitable des dons réservés, alimenter le système d'avis communautaires et calculer vos points de fidélité « Points Fihavanana ».
          </p>
        </section>

        {/* Paragraph 9 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            9. Absence Totale de Vente ou de Commercialisation de Vos Données
          </h2>
          <p>
            Zarazarao s'interdit formellement et catégoriquement de vendre, louer, céder ou commercialiser vos données personnelles, adresses e-mail ou numéros de téléphone à des entreprises tierces, régies publicitaires ou courtiers en données. Vos informations personnelles ne sont utilisées que dans le cadre strict de l'utilisation solidaire de la plateforme.
          </p>
        </section>

        {/* Paragraph 10 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            10. Gestion des Cookies et Caches du Navigateur
          </h2>
          <p>
            Nous utilisons des cookies essentiels ainsi que le stockage local (`localStorage`) de votre navigateur pour maintenir votre session de connexion active, conserver le choix de votre thème visuel (Émeraude, Coral, Ocean, etc.) et enregistrer vos préférences de consentement. Un pop-up interactif vous permet de personnaliser ou de refuser les cookies non essentiels à tout moment.
          </p>
        </section>

        {/* Paragraph 11 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            11. Sécurité et Chiffrement des Informations
          </h2>
          <p>
            L'ensemble des transferts de données entre votre appareil (téléphone, ordinateur ou tablette) et nos serveurs s'effectue via le protocole sécurisé et chiffré HTTPS (SSL/TLS). Vos mots de passe sont hashés par Google Firebase Authentication et ne sont jamais enregistrés en texte clair.
          </p>
        </section>

        {/* Paragraph 12 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            12. Durée de Conservation des Données
          </h2>
          <p>
            Vos données de profil sont conservées tant que votre compte reste actif. En cas de suppression de compte sollicitée par l'utilisateur, toutes vos informations personnelles, photos téléversées et avis émis sont définitivement purgés sous 30 jours, à l'exception des données anonymisées archivées à des fins légales ou statistiques.
          </p>
        </section>

        {/* Paragraph 13 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            13. Vos Droits d'Accès, de Rectification et de Suppression
          </h2>
          <p>
            Conformément aux principes du droit du numérique, vous disposez d'un droit d'accès complet à vos informations, de rectification en temps réel depuis l'onglet « Mon Profil », ainsi que d'un droit à l'oubli et à la suppression intégrale de vos données personnelles sur simple demande par e-mail ou téléphone.
          </p>
          {onNavigate && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2">
              <span className="text-xs text-rose-900 font-semibold">
                Consultez le document dédié détaillant la procédure complète de suppression et vos droits d'effacement (16 articles) :
              </span>
              <button
                onClick={() => onNavigate('data-deletion')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
              >
                Page Droits de Suppression →
              </button>
            </div>
          )}
        </section>

        {/* Paragraph 14 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            14. Notifications Push et Préférences de Contact
          </h2>
          <p>
            Si vous activez les notifications Push ou alerts SMS, Zarazarao peut vous informer instantanément lorsqu'un nouveau don correspond à vos catégories favorites ou lorsque le donateur valide votre réservation. Vous conservez la possibilité de désactiver ces alertes à tout moment dans les paramètres de votre compte.
          </p>
        </section>

        {/* Paragraph 15 */}
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900 text-emerald-800 uppercase tracking-wide">
            15. Mise à Jour de la Politique & Contacts Utiles
          </h2>
          <p>
            Zarazarao se réserve le droit de modifier la présente politique de confidentialité afin de refléter l'évolution des fonctionnalités ou des lois en vigueur à Madagascar. Toute mise à jour majeure vous sera notifiée par pop-up ou par e-mail. Pour toute préoccupation relative à vos données personnelles, veuillez contacter :
          </p>
          <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-xs text-indigo-950 space-y-1.5 mt-2">
            <div className="flex items-center gap-2 font-bold">
              <Phone className="w-4 h-4 text-indigo-700" />
              <span>Téléphone Support : +261 37 53 336 29</span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <Mail className="w-4 h-4 text-indigo-700" />
              <span>Courriel Officiel : zarazaraomada@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-700" />
              <span>Antananarivo 101, Madagascar</span>
            </div>
          </div>
        </section>

      </div>
    </motion.div>
  );
};
