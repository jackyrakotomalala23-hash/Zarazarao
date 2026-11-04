import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { TranslationProvider } from './contexts/TranslationContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <TranslationProvider>
      <App />
    </TranslationProvider>
  </ThemeProvider>
);
