import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult, 
  GoogleAuthProvider, 
  signOut as fbSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { UserProfile, UserRole } from '@/types';
import { loyaltyService } from '@/services/loyaltyService';
import { sanitizeForFirestore } from '@/services/donationService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  signInWithGoogle: () => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile from Firestore
  const syncProfile = async (user: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setUserProfile(data);
      } else {
        // Initialize new user with 10 welcome apples!
        const isBootstrapAdmin = user.email === 'jacky.rakotomalala23@gmail.com';
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Membre Zarazarao',
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || 'ZZ'}`,
          city: 'Antananarivo',
          role: isBootstrapAdmin ? 'admin' : 'user',
          applesCount: 10,
          profileCompletionStatus: false,
          signupBonusAwarded: true,
          firstDonationBonusAwarded: false,
          createdAt: new Date().toISOString()
        };

        try {
          await setDoc(userRef, newProfile);
        } catch (setErr) {
          console.warn('Could not save user profile doc:', setErr);
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
      setUserProfile({
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Membre Zarazarao',
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=ZZ`,
        city: 'Antananarivo',
        role: user.email === 'jacky.rakotomalala23@gmail.com' ? 'admin' : 'user',
        applesCount: 10,
        profileCompletionStatus: false,
        signupBonusAwarded: true,
        firstDonationBonusAwarded: false,
        createdAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    // Handle redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('Redirect sign-in successful');
        }
      })
      .catch((error) => {
        console.error('Redirect sign-in error:', error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, city: string, phone: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    try {
      await updateProfile(cred.user, { displayName: name });
    } catch (e) {
      console.warn('Could not update auth profile display name:', e);
    }
    
    const isBootstrapAdmin = email === 'jacky.rakotomalala23@gmail.com';
    const profile: UserProfile = {
      uid: cred.user.uid,
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      city,
      role: isBootstrapAdmin ? 'admin' : 'user',
      applesCount: 10,
      profileCompletionStatus: false,
      signupBonusAwarded: true,
      firstDonationBonusAwarded: false,
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
        email,
        phoneNumber: phone,
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
    await signInWithEmailAndPassword(auth, email, pass);
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
      // If not logged in, prompt sign in or sign in with test credentials
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
        signInWithGoogle,
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
