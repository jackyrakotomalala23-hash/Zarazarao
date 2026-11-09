import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, PlusSquare, CheckCircle2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isDismissed, install, dismissBanner } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Do not render banner if already running in standalone PWA mode or dismissed by user
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setInstallSuccess(true);
        setTimeout(() => {
          setInstallSuccess(false);
        }, 4000);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General instructions fallback modal if beforeinstallprompt is pending browser trigger
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="relative z-40 bg-gradient-to-r from-slate-950 via-emerald-950 to-teal-950 text-white border-b border-emerald-500/20 shadow-lg px-3 py-2.5 sm:px-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
            {/* App Icon + Text */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/40 p-1 flex items-center justify-center shrink-0 shadow-md">
                <img 
                  src="/icon-192.png" 
                  alt="Zarazarao App Icon" 
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback to emoji badge if icon fails to render
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-lg hidden font-bold text-amber-300">🇲🇬</span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white truncate tracking-tight">
                    Installer l'application Zarazarao
                  </h3>
                  <span className="bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full hidden sm:inline-flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> 100% Gratuit
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80 truncate">
                  Accès instantané & expérience fluide sur votre téléphone
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black text-xs rounded-full shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border border-emerald-300/50"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Installer</span>
              </button>

              <button
                type="button"
                onClick={() => dismissBanner(7)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Ignorer pendant 7 jours"
                aria-label="Fermer la bannière"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Safari or Fallback Installation Guide Modal */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowIOSModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-emerald-500/20 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-center mb-1">
              {isIOS ? "Installer sur iPhone / iPad" : "Installer l'application Zarazarao"}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 text-center mb-5">
              Suivez ces étapes simples pour ajouter Zarazarao directement sur votre écran d'accueil :
            </p>

            {isIOS ? (
              <div className="space-y-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div className="leading-tight pt-0.5">
                    Appuyez sur le bouton <strong>Partager</strong> <Share className="w-3.5 h-3.5 inline mx-0.5 text-emerald-700 dark:text-emerald-300" /> en bas de votre navigateur Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div className="leading-tight pt-0.5">
                    Faites défiler vers le bas et appuyez sur <strong className="text-emerald-900 dark:text-emerald-200">« Sur l'écran d'accueil »</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-700 dark:text-emerald-300" />.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <div className="leading-tight pt-0.5">
                    Validez en appuyant sur <strong>Ajouter</strong> en haut à droite.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="leading-relaxed">
                  Sur navigateur Android / Chrome / Edge :
                </p>
                <ol className="list-decimal pl-4 space-y-1.5">
                  <li>Ouvrez le menu du navigateur (3 points en haut à droite).</li>
                  <li>Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</li>
                  <li>Confirmez l'installation.</li>
                </ol>
              </div>
            )}

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              J'ai compris
            </button>
          </motion.div>
        </div>
      )}

      {/* Success Notification */}
      {installSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>Application Zarazarao installée avec succès !</span>
        </div>
      )}
    </>
  );
};
