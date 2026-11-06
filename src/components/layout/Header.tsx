import React, { useState } from 'react';
import { 
  PlusCircle, 
  MessageSquare, 
  User, 
  Menu, 
  X, 
  Shield, 
  Award, 
  LogOut, 
  Layers, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import { ThemeSelector } from '@/components/common/ThemeSelector';
import { LanguageSelector } from '@/components/common/LanguageSelector';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenAuthModal
}) => {
  const { currentUser, userProfile, isAdmin, isPartner, signOut, switchDemoRole } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoRoleOpen, setDemoRoleOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'explore', label: t('nav.explore') },
    { id: 'categories', label: t('nav.categories') },
    { id: 'map', label: t('nav.map') },
    { id: 'leaderboard', label: t('nav.leaderboard') },
    { id: 'how-it-works', label: t('nav.howItWorks') }
  ];

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-sm transition-colors duration-300"
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--bg-card) 78%, transparent)', 
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)'
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 py-1">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center cursor-pointer group shrink-0 select-none py-0.5"
            title="Zarazarao Madagascar - Accueil"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:scale-105 transition-transform overflow-hidden">
              <img 
                src="/assets/aistudio/image_2d91093c.png" 
                alt="Zarazarao Logo" 
                className="w-full h-full object-cover mix-blend-multiply dark:invert dark:mix-blend-screen"
              />
            </div>
            <div className="flex items-center gap-0.5 -mt-0.5">
              <span 
                className="font-black tracking-tighter" 
                style={{ 
                  color: 'var(--text-primary)',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '11px',
                  lineHeight: '13px'
                }}
              >
                ZARAZARAO
              </span>
              <span className="text-[7px] font-extrabold px-1 rounded-xs bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 uppercase tracking-widest leading-none sm:inline hidden">
                MG
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Compact & Responsive) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 mx-2 overflow-hidden">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-emerald-950 dark:text-emerald-100 bg-emerald-500/20 font-bold shadow-2xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster (Optimized Compact Mobile Fit) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Demo Quick Role Switcher Pill */}
            <div className="relative hidden xl:block">
              <button
                onClick={() => setDemoRoleOpen(!demoRoleOpen)}
                className="text-[11px] px-2 py-1 rounded-full border border-gray-300 hover:border-emerald-500 bg-gray-50 text-gray-700 flex items-center gap-1 font-medium transition-all cursor-pointer"
                title="Changer de rôle pour tester"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-900">{userProfile?.role === 'admin' ? 'Admin' : isPartner ? 'Partenaire' : 'Membre'}</span>
              </button>

              {demoRoleOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 text-xs">
                  <div className="px-3 py-1 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                    Simuler un profil de test
                  </div>
                  <button
                    onClick={() => { switchDemoRole('donor'); setDemoRoleOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-gray-800 cursor-pointer"
                  >
                    <span>🎁</span>
                    <div>
                      <div className="font-semibold">Donateur (Mialy - Tana)</div>
                      <div className="text-[10px] text-gray-500">Donateur régulier, esprit de partage</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { switchDemoRole('beneficiary'); setDemoRoleOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-gray-800 cursor-pointer"
                  >
                    <span>🤝</span>
                    <div>
                      <div className="font-semibold">Bénéficiaire (Fidy - Tamatave)</div>
                      <div className="text-[10px] text-gray-500">Demandes et réservations d'objets</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { switchDemoRole('admin'); setDemoRoleOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-gray-800 cursor-pointer"
                  >
                    <span>🛡️</span>
                    <div>
                      <div className="font-semibold">Super Admin Zarazarao</div>
                      <div className="text-[10px] text-gray-500">Modération, audits, communauté</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Theme & Language Selectors */}
            <ThemeSelector />
            <LanguageSelector />

            {/* Direct Messaging / Messages Icon Button */}
            {currentUser && (
              <button
                onClick={() => onNavigate('messages')}
                className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer border relative flex items-center justify-center shrink-0 ${
                  currentPage === 'messages'
                    ? 'bg-emerald-500/20 text-emerald-950 dark:text-emerald-100 border-emerald-400/50 shadow-2xs font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:bg-black/5 dark:hover:bg-white/10 border-transparent'
                }`}
                title={t('nav.messages') || 'Messagerie'}
                aria-label={t('nav.messages') || 'Messagerie'}
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="sr-only">{t('nav.messages') || 'Messagerie'}</span>
              </button>
            )}

            {/* Real-time Notifications Bell */}
            {currentUser && (
              <NotificationBellDropdown onNavigate={onNavigate} />
            )}

            {/* User Dropdown / Profile Avatar Icon Button (Prominently Highlighted on Mobile) */}
            {currentUser ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center p-0.5 rounded-full ring-2 ring-emerald-600/80 hover:ring-emerald-500 transition-all cursor-pointer shadow-2xs"
                  title="Ouvrir le menu de profil"
                >
                  <img
                    src={userProfile?.photoURL || currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.displayName || 'User'}`}
                    alt="Profil"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white"
                  />
                </button>

                {userDropdownOpen && (
                  <>
                    {/* Backdrop for easy mobile dismissal */}
                    <div 
                      className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent backdrop-blur-[1px] sm:backdrop-blur-none" 
                      onClick={() => setUserDropdownOpen(false)} 
                    />

                    {/* Pop-up dropdown adjusted for mobile viewport visibility */}
                    <div className="absolute right-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.22)] border border-gray-100 py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-100 max-h-[82vh] overflow-y-auto">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50/60 to-teal-50/40">
                        <p className="font-bold text-gray-900 truncate">
                          {userProfile?.displayName || currentUser.displayName || 'Membre Zarazarao'}
                        </p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          {userProfile?.city || 'Madagascar'}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => { onNavigate('profile'); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-emerald-950 font-bold flex items-center gap-2.5 border-b border-gray-100 cursor-pointer text-xs sm:text-sm"
                        >
                          <User className="w-4 h-4 text-emerald-700" />
                          Gestion du profil
                        </button>
                        <button
                          onClick={() => { onNavigate('dashboard', { tab: 'overview' }); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 cursor-pointer text-xs sm:text-sm"
                        >
                          <User className="w-4 h-4 text-gray-500" />
                          Mon tableau de bord
                        </button>
                        <button
                          onClick={() => { onNavigate('dashboard', { tab: 'donations' }); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 cursor-pointer text-xs sm:text-sm"
                        >
                          <Layers className="w-4 h-4 text-emerald-700" />
                          Mes publications
                        </button>
                        <button
                          onClick={() => { onNavigate('dashboard', { tab: 'reservations' }); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 cursor-pointer text-xs sm:text-sm"
                        >
                          <Award className="w-4 h-4 text-emerald-700" />
                          Mes réservations
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => { onNavigate('admin'); setUserDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-purple-50 text-purple-900 font-semibold flex items-center gap-2.5 border-t border-gray-100 cursor-pointer text-xs sm:text-sm"
                          >
                            <Shield className="w-4 h-4 text-purple-600" />
                            Administration Zarazarao
                          </button>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={() => { signOut(); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2.5 text-xs sm:text-sm font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="text-xs sm:text-sm font-bold px-2.5 py-1.5 rounded-xl text-emerald-900 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                Connexion
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl text-gray-600 hover:bg-gray-100 cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                className={`p-2.5 rounded-xl text-xs font-bold text-left cursor-pointer ${
                  currentPage === item.id
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'bg-gray-50 text-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => { onNavigate('rules'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 text-xs text-gray-600 py-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-700" />
              Règles de la communauté (100% gratuit)
            </button>
            <button
              onClick={() => { onNavigate('help'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 text-xs text-gray-600 py-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              Centre d'aide & FAQ
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
