import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation, Language } from '@/contexts/TranslationContext';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'mg', label: 'Malagasy', flag: '🇲🇬' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 bg-white/80 hover:bg-white text-xs font-bold text-gray-800 shadow-2xs transition-all cursor-pointer shrink-0"
        aria-label="Changer de langue"
      >
        <span className="text-sm shrink-0">{currentLangObj.flag}</span>
        <span className="hidden sm:inline">{currentLangObj.label}</span>
        <Globe className="w-3.5 h-3.5 text-emerald-700 ml-0.5 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/10 sm:bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-44 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in duration-150">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                language === lang.code
                  ? 'bg-emerald-50 text-emerald-900 font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {language === lang.code && <Check className="w-3.5 h-3.5 text-emerald-700" />}
            </button>
          ))}
        </div>
        </>
      )}
    </div>
  );
};
