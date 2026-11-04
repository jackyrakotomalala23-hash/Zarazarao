import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'emerald' | 'coral' | 'amethyst' | 'ocean' | 'midnight' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'emerald' | 'coral' | 'amethyst' | 'ocean' | 'midnight';
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'emerald',
  setTheme: () => {},
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('zarazarao_theme');
    return (saved as ThemeMode) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'emerald' | 'coral' | 'amethyst' | 'ocean' | 'midnight'>('emerald');
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const dark = mediaQuery.matches;
        setIsDark(dark);
        setResolvedTheme(dark ? 'midnight' : 'emerald');
      } else {
        setIsDark(theme === 'midnight');
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    const handler = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setIsDark(e.matches);
        setResolvedTheme(e.matches ? 'midnight' : 'emerald');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('zarazarao_theme', newTheme);
    if (newTheme === 'system') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(dark);
      setResolvedTheme(dark ? 'midnight' : 'emerald');
    } else {
      setIsDark(newTheme === 'midnight');
      setResolvedTheme(newTheme);
    }
  };

  useEffect(() => {
    // Apply data-theme attribute to root document
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [resolvedTheme, isDark]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
