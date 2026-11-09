import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cookie, Settings, Check, X, Sparkles, Lock, MapPin, Eye } from 'lucide-react';

interface CookieConsentModalProps {
  onNavigate?: (page: string) => void;
}

export interface CookiePreferences {
  essential: boolean;
  performanceTheme: boolean;
  analyticsLocation: boolean;
  timestamp: string;
}

export const CookieConsentModal: React.FC<CookieConsentModalProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  
  // Custom toggles
  const [performanceTheme, setPerformanceTheme] = useState(true);
  const [analyticsLocation, setAnalyticsLocation] = useState(true);

  useEffect(() => {
    // Check local storage for consent
    const stored = localStorage.getItem('zarazarao_cookie_consent');
    if (!stored) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Expose global window listener so user can re-open from footer
  useEffect(() => {
    const handleReopen = () => {
      setShowCustom(true);
      setIsOpen(true);
    };
    window.addEventListener('reopen-cookie-consent', handleReopen);
    return () => window.removeEventListener('reopen-cookie-consent', handleReopen);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('zarazarao_cookie_consent', JSON.stringify(prefs));
    setIsOpen(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      performanceTheme: true,
      analyticsLocation: true,
      timestamp: new Date().toISOString()
    });
  };

  const handleEssentialOnly = () => {
    savePreferences({
      essential: true,
      performanceTheme: false,
      analyticsLocation: false,
      timestamp: new Date().toISOString()
    });
  };

  const handleRefuseAll = () => {
    savePreferences({
      essential: true, // Essential authentication session cannot be disabled for security
      performanceTheme: false,
      analyticsLocation: false,
      timestamp: new Date().toISOString()
    });
  };

  const handleSaveCustom = () => {
    savePreferences({
      essential: true,
      performanceTheme,
      analyticsLocation,
      timestamp: new Date().toISOString()
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99990] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-slate-900 rounded-[30px] max-w-xl w-full shadow-2xl border border-emerald-100 dark:border-slate-800 overflow-hidden text-gray-900 dark:text-white"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
                🍪
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">
                  Gestion des Cookies & de votre Vie Privée
                </h3>
                <p className="text-xs text-emerald-100/90">
                  Zarazarao Madagascar • Transparence et sécurité Fihavanana
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
            {!showCustom ? (
              <>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Nous utilisons des cookies et le stockage local pour optimiser votre expérience sur la plateforme solidaire Zarazarao. Ces fichiers nous permettent de maintenir votre connexion active, de retenir la personnalisation de votre thème et d'adapter l'affichage des dons à votre ville et fokontany à Madagascar.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Vous pouvez accepter l'ensemble des cookies, vous limiter aux cookies strictement essentiels ou personnaliser vos préférences à tout moment.
                </p>
              </>
            ) : (
              /* Customization View */
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      1. Cookies Essentiels & Sécurité (Obligatoires)
                    </span>
                    <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-extrabold px-2 py-0.5 rounded-full">
                      Toujours Actif
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">
                    Nécessaires pour l'authentification Firebase, la gestion des sessions sécurisées, la protection contre les attaques CSRF et la messagerie privée entre utilisateurs.
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      2. Thème & Préférences Visuelles (Recommandé)
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={performanceTheme}
                        onChange={(e) => setPerformanceTheme(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">
                    Sauvegarde la palette de couleurs choisie (Émeraude, Sunset Coral, Royal Amethyst, Mode Sombre, etc.) pour une navigation fluide lors de vos prochaines visites.
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-sky-500" />
                      3. Localisation & Filtres Régionaux (Optionnel)
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={analyticsLocation}
                        onChange={(e) => setAnalyticsLocation(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">
                    Retient vos filtres de recherche fréquents (villes et fokontanys de Madagascar) pour afficher prioritairement les dons à proximité de votre domicile.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer Buttons */}
          <div className="p-5 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            {!showCustom ? (
              <>
                <button
                  onClick={() => setShowCustom(true)}
                  className="px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 underline cursor-pointer flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Personnaliser mon choix</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleEssentialOnly}
                    className="px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Essentiels uniquement
                  </button>

                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Tout accepter</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowCustom(false)}
                  className="px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 cursor-pointer"
                >
                  ← Retour
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefuseAll}
                    className="px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Refuser tout
                  </button>

                  <button
                    onClick={handleSaveCustom}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Enregistrer mes choix</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
