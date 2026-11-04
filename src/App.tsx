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
import { UserDashboardPage } from '@/pages/UserDashboardPage';
import { MessagingPage } from '@/pages/MessagingPage';
import { StorePartnerVerificationPage } from '@/pages/StorePartnerVerificationPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { ProfileManagementPage } from '@/pages/ProfileManagementPage';
import { checkAndSeedInitialData } from '@/services/seedService';
import { ZaraBotChatbot } from '@/components/chat/ZaraBotChatbot';
import { CursorGlowFollower } from '@/components/common/CursorGlowFollower';
import { FloatingParticles } from '@/components/common/FloatingParticles';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ZaraLoader } from '@/components/common/ZaraLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { fcmService } from '@/services/fcmService';

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
      const searchParams = new URLSearchParams(window.location.search);
      let modeParam = searchParams.get('mode');
      let oobCodeParam = searchParams.get('oobCode');

      // Also parse hash or full URL in case Firebase passes parameters in fragment
      if (!oobCodeParam && window.location.href.includes('oobCode=')) {
        const match = window.location.href.match(/oobCode=([^&]+)/);
        if (match && match[1]) {
          oobCodeParam = decodeURIComponent(match[1]);
        }
      }
      if (!modeParam && window.location.href.includes('mode=')) {
        const matchMode = window.location.href.match(/mode=([^&]+)/);
        if (matchMode && matchMode[1]) {
          modeParam = decodeURIComponent(matchMode[1]);
        }
      }

      if (modeParam === 'resetPassword' || oobCodeParam || window.location.href.includes('resetPassword')) {
        if (oobCodeParam) {
          setResetOobCode(oobCodeParam);
        }
        setAuthModalMode('reset_confirm');
        setAuthModalOpen(true);
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

        {currentPage === 'store-verify' && (
          <StorePartnerVerificationPage />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage />
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
