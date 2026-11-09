import React from 'react';
import { 
  Home, 
  Search, 
  MapPin, 
  Plus, 
  MessageSquare, 
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MobileBottomNavProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuthModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
  onOpenAuthModal
}) => {
  const { currentUser, userProfile } = useAuth();

  const navItems = [
    { 
      id: 'home', 
      icon: Home, 
      label: 'Accueil'
    },
    { 
      id: 'explore', 
      icon: Search, 
      label: 'Dons'
    },
    { 
      id: 'map', 
      icon: MapPin, 
      label: 'Carte'
    },
    { 
      id: 'publish', 
      icon: Plus, 
      label: 'Publier',
      isCta: true
    },
    { 
      id: 'messages', 
      icon: MessageSquare, 
      label: 'Messages',
      authRequired: true
    },
    { 
      id: 'profile', 
      icon: User, 
      label: 'Profil',
      authRequired: true
    }
  ];

  const handleTabClick = (itemId: string, authRequired?: boolean) => {
    if (authRequired && !currentUser) {
      onOpenAuthModal();
    } else {
      onNavigate(itemId);
    }
  };

  return (
    <nav 
      className="fixed bottom-3 left-3 right-3 z-50 backdrop-blur-xl border shadow-2xl rounded-full sm:hidden px-3 py-1.5 transition-all duration-300"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-card) 78%, transparent)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)'
      }}
    >
      <div className="flex items-center justify-between max-w-sm mx-auto relative px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          if (item.isCta) {
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id, item.authRequired)}
                className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full shadow-lg active:scale-90 transition-all cursor-pointer flex items-center justify-center shrink-0 border border-white/20"
                title={item.label}
                aria-label={item.label}
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          const userAvatar = userProfile?.photoURL || currentUser?.photoURL;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id, item.authRequired)}
              className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-emerald-950 dark:text-emerald-100 bg-emerald-500/20 scale-105 font-bold shadow-2xs' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:bg-black/5 dark:hover:bg-white/10'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              {item.id === 'profile' && currentUser ? (
                <div className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all shrink-0 ${isActive ? 'border-emerald-700 dark:border-emerald-300 scale-110' : 'border-gray-300 dark:border-slate-600'}`}>
                  <img
                    src={userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.displayName || 'ZZ'}`}
                    alt={userProfile?.displayName || 'Profil'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-emerald-800 dark:text-emerald-300' : 'stroke-[1.75]'}`} />
              )}
              
              {/* Active Dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
