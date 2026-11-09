import React, { useState } from 'react';
import { Palette, Check, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes: { id: ThemeMode; label: string; colorClass: string; icon: string }[] = [
    { id: 'emerald', label: 'Émeraude Malagasy', colorClass: 'bg-emerald-600', icon: '🌿' },
    { id: 'coral', label: 'Sunset Coral', colorClass: 'bg-rose-600', icon: '🌅' },
    { id: 'amethyst', label: 'Royal Amethyst', colorClass: 'bg-purple-600', icon: '💜' },
    { id: 'ocean', label: 'Ocean Breeze', colorClass: 'bg-sky-500', icon: '🌊' },
    { id: 'midnight', label: 'Midnight Obsidian', colorClass: 'bg-slate-900', icon: '🌙' },
    { id: 'system', label: 'Automatique (Système)', colorClass: 'bg-gradient-to-r from-emerald-500 to-sky-500', icon: '💻' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 sm:p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-slate-800/80 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
        title="Choisir le thème et l'apparence"
      >
        <Palette className="w-4 h-4 text-emerald-600 dark:text-sky-400 shrink-0" />
        <span className="hidden md:inline text-xs font-semibold">Thème</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9998]" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Dialog Container */}
          <div className="fixed sm:absolute inset-x-4 sm:inset-auto top-20 sm:top-full sm:right-0 sm:mt-2 z-[9999] max-w-sm sm:w-64 bg-white dark:bg-slate-900 rounded-3xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:py-3 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto mx-auto sm:mx-0">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Personnalisation & Thèmes
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Choisissez une palette d'apparence
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 sm:hidden text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-1 pt-2 space-y-1">
              {themes.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full ${t.colorClass} flex items-center justify-center text-xs shadow-xs`}>
                        {t.icon}
                      </span>
                      <span className="text-xs font-semibold">{t.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
