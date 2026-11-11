import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signOut as fbSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { UserProfile, UserRole } from '@/types';
import { loyaltyService } from '@/services/loyaltyService';
import { sanitizeForFirestore } from '@/services/donationService';

const LOCAL_SESSION_PROFILE_KEY = 'zarazarao_active_session_profile';

const getStoredProfile = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage session read error:', e);
  }
  return null;
};

const saveStoredProfile = (profile: UserProfile | null) => {
  try {
    if (profile) {
      localStorage.setItem(LOCAL_SESSION_PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(LOCAL_SESSION_PROFILE_KEY);
    }
  } catch (e) {
    console.warn('LocalStorage session write error:', e);
  }
};

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  redirectAuthError: string | null;
  clearRedirectAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, city: string, phone: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (oobCode: string, newPassword: string) => Promise<void>;
  verifyResetCode: (oobCode: string) => Promise<string>;
  signOut: () => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  switchDemoRole: (role: 'donor' | 'beneficiary' | 'partner' | 'admin') => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(() => getStoredProfile());
  const [loading, setLoading] = useState(true);
  const [redirectAuthError, setRedirectAuthError] = useState<string | null>(null);

  const clearRedirectAuthError = () => setRedirectAuthError(null);

  const setUserProfile = (profile: UserProfile | null) => {
    setUserProfileState(profile);
    saveStoredProfile(profile);
  };

  // Sync profile from Firestore, importing all OAuth provider data (Google & Meta/Facebook)
  const syncProfile = async (user: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      // Extract provider details if available (Google / Meta Facebook)
      let providerPhoto = user.photoURL || '';
      let providerName = user.displayName || '';
      let providerEmail = user.email || '';
      let providerPhone = user.phoneNumber || '';

      if (user.providerData && Array.isArray(user.providerData)) {
        user.providerData.forEach((p) => {
          if (!providerPhoto && p.photoURL) providerPhoto = p.photoURL;
          if (!providerName && p.displayName) providerName = p.displayName;
          if (!providerEmail && p.email) providerEmail = p.email;
          if (!providerPhone && p.phoneNumber) providerPhone = p.phoneNumber;
        });
      }

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // Update photo or name if missing or placeholder
        const needsPhotoUpdate = (!data.photoURL || data.photoURL.includes('dicebear')) && Boolean(providerPhoto);
        const needsNameUpdate = !data.displayName && Boolean(providerName);
        
        if (needsPhotoUpdate || needsNameUpdate) {
          const updatedProfileData: Partial<UserProfile> = {
            ...(needsPhotoUpdate ? { photoURL: providerPhoto } : {}),
            ...(needsNameUpdate ? { displayName: providerName } : {}),
            updatedAt: new Date().toISOString()
          };
          await setDoc(userRef, updatedProfileData, { merge: true });
          setUserProfile({ ...data, ...updatedProfileData });
        } else {
          setUserProfile(data);
        }
      } else {
        // Initialize new user profile with 10 welcome points!
        const isBootstrapAdmin = providerEmail === 'jacky.rakotomalala23@gmail.com';
        const fallbackName = providerName || (providerEmail ? providerEmail.split('@')[0] : '') || 'Membre Zarazarao';
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: fallbackName,
          photoURL: providerPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${fallbackName}`,
          city: 'Antananarivo',
          role: isBootstrapAdmin ? 'admin' : 'user',
          applesCount: 10,
          profileCompletionStatus: false,
          signupBonusAwarded: true,
          firstDonationBonusAwarded: false,
          isVerified: false,
          createdAt: new Date().toISOString()
        };

        try {
          await setDoc(userRef, newProfile);
        } catch (setErr) {
          console.warn('Could not save user profile doc:', setErr);
        }

        try {
          // Private PII subcollection with email and phone from Facebook/Google
          await setDoc(doc(db, 'users', user.uid, 'private', 'info'), {
            email: providerEmail || '',
            phoneNumber: providerPhone || '',
            verifiedPhoneStatus: Boolean(providerPhone),
            verifiedEmailStatus: Boolean(providerEmail),
            address: 'Antananarivo'
          }, { merge: true });
        } catch (piiErr) {
          console.warn('Error saving private user info:', piiErr);
        }

        try {
          await loyaltyService.awardSignupBonus(user.uid);
        } catch (bonusErr) {
          console.warn('Could not award signup bonus transaction:', bonusErr);
        }
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Error syncing user profile:', err);
      // Fallback profile in memory
      const fallbackName = user.displayName || (user.email ? user.email.split('@')[0] : '') || 'Membre Zarazarao';
      setUserProfile({
        uid: user.uid,
        displayName: fallbackName,
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${fallbackName}`,
        city: 'Antananarivo',
        role: user.email === 'jacky.rakotomalala23@gmail.com' ? 'admin' : 'user',
        applesCount: 10,
        profileCompletionStatus: false,
        signupBonusAwarded: true,
        firstDonationBonusAwarded: false,
        isVerified: false,
        createdAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Immediately subscribe to onAuthStateChanged so session is instantly detected on mount
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      if (user) {
        setCurrentUser(user);
        try {
          await syncProfile(user);
        } catch (syncErr) {
          console.warn('Sync profile warning on auth change:', syncErr);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    // 2. Concurrently check redirect result from OAuth redirect flow
    getRedirectResult(auth)
      .then(async (redirectRes) => {
        if (!isMounted) return;
        if (redirectRes?.user) {
          console.log('Redirect sign-in success for user:', redirectRes.user.uid);
          setCurrentUser(redirectRes.user);
          await syncProfile(redirectRes.user);
          setLoading(false);
        }
      })
      .catch((redirectError: any) => {
        if (!isMounted) return;
        console.error('Redirect sign-in result error:', redirectError);
        const code = redirectError?.code;
        if (code === 'auth/account-exists-with-different-credential') {
          setRedirectAuthError(
            'Un compte Zarazarao existe déjà avec cette adresse e-mail. Pour des raisons de sécurité, connectez-vous avec Google ou votre mot de passe pour accéder à votre compte.'
          );
        } else if (code === 'auth/unauthorized-domain') {
          setRedirectAuthError(
            'Ce domaine d’application n’est pas encore autorisé dans votre console Firebase (Authentication > Paramètres > Domaines autorisés).'
          );
        } else if (code === 'auth/operation-not-allowed') {
          setRedirectAuthError(
            'La méthode de connexion sélectionnée n’est pas activée dans votre console Firebase (Authentication > Sign-in method).'
          );
        } else if (redirectError?.message) {
          setRedirectAuthError(redirectError.message);
        }
      });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    return isMobileUa || isStandalone || (isTouch && window.innerWidth < 768);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // On mobile devices and installed PWAs, window.opener is severed by Android OS across popup tabs
    // signInWithRedirect combined with our same-origin reverse proxy provides 100% reliable login
    if (isMobileDevice()) {
      await signInWithRedirect(auth, provider);
      return;
    }

    try {
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        setCurrentUser(res.user);
        await syncProfile(res.user);
      }
    } catch (err: any) {
      console.warn('Google popup auth error:', err);
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
      } else {
        throw err;
      }
    }
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');
    provider.setCustomParameters({ display: 'popup' });

    // On mobile devices and installed PWAs, window.opener is severed by Android OS across popup tabs
    if (isMobileDevice()) {
      await signInWithRedirect(auth, provider);
      return;
    }

    try {
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        setCurrentUser(res.user);
        await syncProfile(res.user);
      }
    } catch (err: any) {
      console.warn('Facebook popup auth error:', err);
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
      } else {
        throw err;
      }
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, city: string, phone: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass.trim());
    if (cred.user) {
      setCurrentUser(cred.user);
    }
    try {
      await updateProfile(cred.user, { displayName: cleanName });
    } catch (e) {
      console.warn('Could not update auth profile display name:', e);
    }
    
    const isBootstrapAdmin = cleanEmail === 'jacky.rakotomalala23@gmail.com';
    const profile: UserProfile = {
      uid: cred.user.uid,
      displayName: cleanName,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${cleanName}`,
      city,
      role: isBootstrapAdmin ? 'admin' : 'user',
      applesCount: 10,
      profileCompletionStatus: false,
      signupBonusAwarded: true,
      firstDonationBonusAwarded: false,
      isVerified: false,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', cred.user.uid), profile);
    } catch (dbErr) {
      console.error('Error creating user profile document in Firestore:', dbErr);
    }

    try {
      // Private PII subcollection
      await setDoc(doc(db, 'users', cred.user.uid, 'private', 'info'), {
        email: cleanEmail,
        phoneNumber: cleanPhone,
        verifiedPhoneStatus: true,
        verifiedEmailStatus: true,
        address: city
      });
    } catch (piiErr) {
      console.warn('Error saving private user info:', piiErr);
    }

    try {
      await loyaltyService.awardSignupBonus(cred.user.uid);
    } catch (bonusErr) {
      console.warn('Error awarding signup bonus:', bonusErr);
    }

    setUserProfile(profile);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass.trim());
    if (cred.user) {
      setCurrentUser(cred.user);
      // Immediately set profile fallback so UI updates without waiting for network roundtrip
      const fallbackName = cred.user.displayName || cleanEmail.split('@')[0] || 'Membre Zarazarao';
      setUserProfile({
        uid: cred.user.uid,
        displayName: fallbackName,
        photoURL: cred.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${fallbackName}`,
        city: 'Antananarivo',
        role: cleanEmail === 'jacky.rakotomalala23@gmail.com' ? 'admin' : 'user',
        applesCount: 10,
        profileCompletionStatus: false,
        signupBonusAwarded: true,
        firstDonationBonusAwarded: false,
        isVerified: false,
        createdAt: new Date().toISOString()
      });
      try {
        await syncProfile(cred.user);
      } catch (syncErr) {
        console.warn('Sync profile error on signin:', syncErr);
      }
    }
  };

  const resetPassword = async (emailToReset: string) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/?mode=resetPassword`,
      handleCodeInApp: true,
    };
    await sendPasswordResetEmail(auth, emailToReset, actionCodeSettings);
  };

  const confirmResetPassword = async (oobCode: string, newPassword: string) => {
    await confirmPasswordReset(auth, oobCode, newPassword);
  };

  const verifyResetCode = async (oobCode: string): Promise<string> => {
    return await verifyPasswordResetCode(auth, oobCode);
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const cleanedData = sanitizeForFirestore({
        ...data,
        updatedAt: new Date().toISOString()
      });

      // 1. Persist updated fields to Firestore with merge
      await setDoc(userRef, cleanedData, { merge: true });

      // 2. Keep Firebase Auth user profile in sync
      if (data.displayName || data.photoURL) {
        try {
          await updateProfile(currentUser, {
            displayName: data.displayName || currentUser.displayName,
            photoURL: data.photoURL || currentUser.photoURL
          });
        } catch (authErr) {
          console.warn('Could not update Firebase Auth profile:', authErr);
        }
      }

      // 3. FORCE REFRESH of Auth session state in memory
      try {
        await currentUser.reload();
      } catch (reloadErr) {
        console.warn('Auth user session reload warning:', reloadErr);
      }

      // 4. Force re-sync profile from Firestore to verify persistence
      await syncProfile(auth.currentUser || currentUser);
    } catch (err) {
      console.error('Failed to update user profile:', err);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await syncProfile(currentUser);
    }
  };

  // Quick switch role for testing all platform perspectives
  const switchDemoRole = async (targetRole: 'donor' | 'beneficiary' | 'partner' | 'admin') => {
    if (!currentUser) {
      return;
    }
    const roleMapping: Record<string, { role: UserRole; name: string; city: string; apples: number }> = {
      donor: { role: 'user', name: 'Mialy Donatrice (Tana)', city: 'Antananarivo', apples: 240 },
      beneficiary: { role: 'user', name: 'Fidy Bénéficiaire (Tamatave)', city: 'Toamasina', apples: 50 },
      partner: { role: 'partner', name: 'Caissier Supermarché Score', city: 'Antananarivo', apples: 0 },
      admin: { role: 'admin', name: 'Jacky Administrateur Zarazarao', city: 'Antananarivo', apples: 5000 }
    };

    const target = roleMapping[targetRole];
    if (target) {
      await updateUserProfileData({
        role: target.role,
        displayName: target.name,
        city: target.city,
        applesCount: (userProfile?.applesCount || 0) < target.apples ? target.apples : userProfile?.applesCount
      });
    }
  };

  const isAdmin = userProfile?.role === 'admin' || currentUser?.email === 'jacky.rakotomalala23@gmail.com';
  const isPartner = userProfile?.role === 'partner' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isPartner,
        redirectAuthError,
        clearRedirectAuthError,
        signInWithGoogle,
        signInWithFacebook,
        signUpWithEmail,
        signInWithEmail,
        resetPassword,
        confirmResetPassword,
        verifyResetCode,
        signOut,
        updateUserProfileData,
        switchDemoRole,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

