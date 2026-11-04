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

// Register Workbox Service Worker for offline access (donations list & user profile caching)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('Workbox ServiceWorker registered successfully:', registration.scope);
    }).catch((error) => {
      console.warn('Workbox ServiceWorker registration failed:', error);
    });
  });
}

