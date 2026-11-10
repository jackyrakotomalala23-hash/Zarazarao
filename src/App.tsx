import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import { HomePage } from '@/pages/HomePage';
import { ExploreDonationsPage } from '@/pages/ExploreDonationsPage';
import { DonationDetailPage } from '@/pages/DonationDetailPage';
import { PublishDonationPage } from '@/pages/PublishDonationPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { SharingMapPage } from '@/pages/SharingMapPage';
import { HowItWorksPage } from '@/pages/HowItWorksPage';
import { CommunityRulesPage } from '@/pages/CommunityRulesPage';
import { HelpCenterPage } from '@/pages/HelpCenterPage';
import { LegalPage } from '@/pages/LegalPage';
import { CGUPage } from '@/pages/CGUPage';
import { DataPrivacyPage } from '@/pages/DataPrivacyPage';
import { DataDeletionRightsPage } from '@/pages/DataDeletionRightsPage';
import { CookieConsentModal } from '@/components/common/CookieConsentModal';
import { UserDashboardPage } from '@/pages/UserDashboardPage';
import { MessagingPage } from '@/pages/MessagingPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { ProfileManagementPage } from '@/pages/ProfileManagementPage';
import { ContactPage } from '@/pages/ContactPage';
import { checkAndSeedInitialData } from '@/services/seedService';
import { ZaraBotChatbot } from '@/components/chat/ZaraBotChatbot';
import { CursorGlowFollower } from '@/components/common/CursorGlowFollower';
import { FloatingParticles } from '@/components/common/FloatingParticles';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ZaraLoader } from '@/components/common/ZaraLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { fcmService } from '@/services/fcmService';
import { PWAInstallBanner } from '@/components/common/PWAInstallBanner';

function AppContent() {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot' | 'reset_confirm'>('signin');
  const [resetOobCode, setResetOobCode] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize seed data on initial launch and check for reset password URL params
  useEffect(() => {
    checkAndSeedInitialData().catch(console.warn);

    try {
      const fullUrl = window.location.href;
      const searchParams = new URLSearchParams(window.location.search);
      let modeParam = searchParams.get('mode');
      let oobCodeParam = searchParams.get('oobCode');

      // Robust regex extraction for oobCode and mode across search and hash
      if (!oobCodeParam && fullUrl.includes('oobCode=')) {
        const match = fullUrl.match(/oobCode=([^&/#]+)/);
        if (match && match[1]) {
          oobCodeParam = decodeURIComponent(match[1]);
        }
      }
      if (!modeParam && fullUrl.includes('mode=')) {
        const matchMode = fullUrl.match(/mode=([^&/#]+)/);
        if (matchMode && matchMode[1]) {
          modeParam = decodeURIComponent(matchMode[1]);
        }
      }

      // If URL has oobCode or resetPassword, automatically display the in-app password reset modal!
      if (oobCodeParam || modeParam === 'resetPassword' || fullUrl.includes('resetPassword') || fullUrl.includes('oobCode')) {
        if (oobCodeParam) {
          setResetOobCode(oobCodeParam);
        }
        setAuthModalMode('reset_confirm');
        setAuthModalOpen(true);

        // Clean up parameters in address bar without page refresh
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (hErr) {
          console.warn('Could not replace history state:', hErr);
        }
      }
    } catch (e) {
      console.warn('URL param parsing error:', e);
    }
  }, []);

  // Initialize Firebase Cloud Messaging (FCM) when user is logged in
  useEffect(() => {
    if (currentUser) {
      fcmService.requestNotificationPermission(currentUser.uid).catch(console.warn);
      const unsubscribe = fcmService.onForegroundMessage((payload) => {
        console.log('Foreground notification received:', payload);
      });
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [currentUser]);

  const navigate = (page: string, params: any = {}) => {
    if (page !== currentPage) {
      setIsTransitioning(true);
      setCurrentPage(page);
      setPageParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        setIsTransitioning(false);
      }, 350);
    } else {
      setPageParams(params);
    }
  };

  // Global custom navigation listener for links inside auth modals or notifications
  useEffect(() => {
    const handleCustomNavigate = (e: any) => {
      if (e.detail) {
        navigate(e.detail);
      }
    };
    window.addEventListener('navigate-app', handleCustomNavigate);
    return () => window.removeEventListener('navigate-app', handleCustomNavigate);
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-500 relative overflow-x-hidden pb-16 sm:pb-0"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      {/* Interactive Cursor Glow Follower */}
      <CursorGlowFollower />
      {/* Peaceful Floating Particles */}
      <FloatingParticles />
      {/* Animated Background Gradients & Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[var(--primary-color)]/10 to-[var(--secondary-color)]/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[var(--accent-color)]/10 to-[var(--primary-color)]/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Z Snake Loader Overlay on Tab Defiling Transition */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-white/70 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-150">
          <ZaraLoader size="lg" text="Chargement Zarazarao..." />
        </div>
      )}

      {/* Top Mobile PWA Install Banner (A2HS) */}
      <PWAInstallBanner />

      {/* Sticky/Fixed Header */}
      <Header
        currentPage={currentPage}
        onNavigate={navigate}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Dynamic Main Page Content with Tab Sliding Animation */}
      <main className="flex-1 pt-16 sm:pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full"
          >
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigate}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentPage === 'explore' && (
          <ExploreDonationsPage
            onNavigate={navigate}
            initialFilters={{
              search: pageParams?.search,
              category: pageParams?.category,
              city: pageParams?.city
            }}
          />
        )}

        {currentPage === 'donation-detail' && (
          <DonationDetailPage
            donationId={pageParams?.id}
            onNavigate={navigate}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentPage === 'publish' && (
          <PublishDonationPage
            onNavigate={navigate}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentPage === 'categories' && (
          <CategoriesPage onNavigate={navigate} />
        )}

        {currentPage === 'map' && (
          <SharingMapPage onNavigate={navigate} />
        )}

        {currentPage === 'leaderboard' && (
          <LeaderboardPage onNavigate={navigate} />
        )}

        {currentPage === 'how-it-works' && (
          <HowItWorksPage onNavigate={navigate} />
        )}

        {currentPage === 'rules' && (
          <CommunityRulesPage />
        )}

        {currentPage === 'help' && (
          <HelpCenterPage />
        )}

        {currentPage === 'legal' && (
          <LegalPage />
        )}

        {currentPage === 'cgu' && (
          <CGUPage onNavigate={navigate} />
        )}

        {currentPage === 'data-privacy' && (
          <DataPrivacyPage onNavigate={navigate} />
        )}

        {(currentPage === 'data-deletion' || currentPage === 'deletion-rights') && (
          <DataDeletionRightsPage
            onNavigate={navigate}
            onOpenAuthModal={() => {
              setAuthModalMode('signin');
              setAuthModalOpen(true);
            }}
          />
        )}

        {currentPage === 'profile' && (
          <ProfileManagementPage
            onNavigate={navigate}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentPage === 'dashboard' && (
          <UserDashboardPage
            initialTab={pageParams?.tab || 'overview'}
            onNavigate={navigate}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentPage === 'messages' && (
          <MessagingPage
            initialConversationId={pageParams?.conversationId}
            onNavigate={navigate}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage />
        )}

        {currentPage === 'contact' && (
          <ContactPage onNavigate={navigate} />
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Mobile Fixed Icon Navigation Bar (sm:hidden) */}
      <MobileBottomNav
        currentPage={currentPage}
        onNavigate={navigate}
        onOpenAuthModal={() => {
          setAuthModalMode('signin');
          setAuthModalOpen(true);
        }}
      />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        oobCode={resetOobCode}
      />

      {/* Cookie Consent Modal */}
      <CookieConsentModal onNavigate={navigate} />

      {/* ZaraBot AI Guide & Google Maps Assistant */}
      <ZaraBotChatbot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
