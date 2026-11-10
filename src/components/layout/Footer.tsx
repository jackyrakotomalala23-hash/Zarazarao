import React from 'react';
import { Heart, ShieldCheck, Gift, MapPin, Mail } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-emerald-950 text-emerald-100/90 pt-16 pb-12 border-t border-emerald-900 mt-20 rounded-t-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Mission Banner */}
        <div className="bg-emerald-900/60 rounded-3xl p-6 sm:p-8 mb-12 border border-emerald-800/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300">
              {t('footer.philosophy')}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {t('footer.quote')}
            </h3>
            <p className="text-sm text-emerald-200">
              {t('footer.desc')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800/80 border border-emerald-700 text-xs font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {t('footer.badgeFree')}
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800/80 border border-emerald-700 text-xs font-semibold text-emerald-200">
              <Heart className="w-4 h-4 text-rose-400" />
              100% Solidaire & Fihavanana
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-emerald-900/80 text-sm">
          
          <div className="space-y-3">
            <h4 className="font-bold text-white text-base">{t('footer.platform')}</h4>
            <ul className="space-y-2 text-emerald-300/80 text-xs sm:text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-white transition-colors">
                  {t('nav.explore')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-white transition-colors">
                  {t('nav.categories')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('map')} className="hover:text-white transition-colors">
                  {t('nav.map')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('leaderboard')} className="hover:text-white transition-colors">
                  {t('nav.leaderboard')}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-base">Esprit de Partage</h4>
            <ul className="space-y-2 text-emerald-300/80 text-xs sm:text-sm">
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-white transition-colors">
                  {t('nav.howItWorks')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('rules')} className="hover:text-white transition-colors">
                  {t('footer.charter')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('publish')} className="hover:text-white transition-colors">
                  Offrir un don gratuit
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">
                  {t('nav.dashboard')}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-base">{t('footer.rules')}</h4>
            <ul className="space-y-2 text-emerald-300/80 text-xs sm:text-sm">
              <li>
                <button onClick={() => onNavigate('rules')} className="hover:text-white transition-colors">
                  {t('footer.charter')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('rules')} className="hover:text-white transition-colors">
                  {t('footer.prohibited')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('help')} className="hover:text-white transition-colors">
                  {t('footer.faq')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  {t('footer.dataProtection')}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-base">{t('footer.contact')}</h4>
            <p className="text-xs text-emerald-300/80 leading-relaxed">
              {t('footer.projectDesc')}
            </p>
            <div className="text-xs text-emerald-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {t('footer.location')}
            </div>
            <div className="text-xs text-emerald-200 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              zarazaraomada@gmail.com
            </div>
            <div className="text-xs text-emerald-200 font-bold flex items-center gap-1.5">
              <span>📞 +261 37 53 336 29</span>
            </div>
            <div>
              <button 
                onClick={() => onNavigate('contact')}
                className="mt-2 px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl border border-emerald-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                Formulaire de contact
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Legal links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400/70 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
              <img 
                src="/assets/aistudio/image_2d91093c.png" 
                alt="Zarazarao Logo" 
                className="w-full h-full object-cover mix-blend-multiply dark:invert dark:mix-blend-screen"
              />
            </div>
            <span>© {new Date().getFullYear()} ZARAZARAO • {t('footer.tagline')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold">
            <button onClick={() => onNavigate('cgu')} className="hover:text-white transition-colors cursor-pointer">
              CGU & Charte
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('data-privacy')} className="hover:text-white transition-colors cursor-pointer">
              Données Personnelles
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('data-deletion')} className="hover:text-rose-300 text-rose-200/90 transition-colors cursor-pointer font-bold">
              🗑️ Droit de Suppression
            </button>
            <span>•</span>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('reopen-cookie-consent'))} 
              className="hover:text-amber-300 text-emerald-200 transition-colors cursor-pointer"
            >
              🍪 Gestion des Cookies
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
