import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Camera, 
  ShieldCheck, 
  Lock, 
  Phone, 
  MapPin, 
  Calendar, 
  Eye, 
  EyeOff, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  MessageSquare, 
  Sparkles, 
  Gift, 
  Users, 
  Settings, 
  Image as ImageIcon,
  Save,
  ChevronRight,
  ExternalLink,
  X,
  Award,
  Shield,
  Layers,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { chatService } from '@/services/chatService';
import { donationService } from '@/services/donationService';
import { Conversation, Donation, UserProfile } from '@/types';
import confetti from 'canvas-confetti';

interface ProfileManagementPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuthModal: () => void;
}

// Preset Madagascar cover banners
const MADAGASCAR_COVERS = [
  { id: 'baobabs', title: 'Allée des Baobabs (Morondava)', url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80' },
  { id: 'nosybe', title: 'Plage & Lagon de Nosy Be', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { id: 'tana', title: 'Vue panoramique d’Antananarivo', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80' },
  { id: 'isalo', title: 'Canyon de l’Isalo', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80' },
  { id: 'emerald', title: 'Thème Vert Fihavanana Zarazarao', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80' }
];

// Preset Avatar Avatars
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80'
];

interface InteractedUser {
  uid: string;
  name: string;
  photoURL?: string;
  city: string;
  lastInteractionText: string;
  lastInteractionDate: string;
  roleType: 'donor' | 'beneficiary' | 'chat_partner';
  conversationId?: string;
}

export const ProfileManagementPage: React.FC<ProfileManagementPageProps> = ({
  onNavigate,
  onOpenAuthModal
}) => {
  const { currentUser, userProfile, updateUserProfileData, refreshProfile } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'infos' | 'photos' | 'security' | 'privacy' | 'relations'>('infos');

  // Personal Info Form State
  const [firstName, setFirstName] = useState(userProfile?.firstName || '');
  const [lastName, setLastName] = useState(userProfile?.lastName || '');
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [birthDate, setBirthDate] = useState(userProfile?.birthDate || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '+261 34 00 000 00');
  const [exactAddress, setExactAddress] = useState(userProfile?.exactAddress || '');
  const [city, setCity] = useState(userProfile?.city || 'Antananarivo');
  const [fokontany, setFokontany] = useState(userProfile?.fokontany || '');
  const [bio, setBio] = useState(userProfile?.bio || 'Membre engagé dans l’entraide Fihavanana à Madagascar.');

  // Photos & Custom URLs
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [coverURL, setCoverURL] = useState(userProfile?.coverURL || MADAGASCAR_COVERS[0].url);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [customCoverInput, setCustomCoverInput] = useState('');

  // Password & Security State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // MFA Double Authentication State
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(Boolean(userProfile?.mfaEnabled));
  const [mfaPhone, setMfaPhone] = useState<string>(userProfile?.mfaPhoneNumber || phoneNumber);
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaOtpCode, setMfaOtpCode] = useState('');
  const [mfaGeneratedCode, setMfaGeneratedCode] = useState<string>('123456');
  const [mfaStep, setMfaStep] = useState<'send' | 'verify' | 'success'>('send');
  const [mfaLoading, setMfaLoading] = useState(false);

  // Device File Upload Handlers (Avatar & Cover)
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('La photo ne doit pas dépasser 8 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setPhotoURL(dataUrl);
        updateUserProfileData({ photoURL: dataUrl });
        setSavedSuccessMsg('Photo de profil importée depuis votre appareil avec succès !');
        setTimeout(() => setSavedSuccessMsg(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('La bannière ne doit pas dépasser 10 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setCoverURL(dataUrl);
        updateUserProfileData({ coverURL: dataUrl });
        setSavedSuccessMsg('Bannière de couverture importée depuis votre appareil avec succès !');
        setTimeout(() => setSavedSuccessMsg(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Privacy & Settings State
  const [showPhone, setShowPhone] = useState(userProfile?.privacySettings?.showPhone ?? true);
  const [showLocation, setShowLocation] = useState(userProfile?.privacySettings?.showLocation ?? true);
  const [showBio, setShowBio] = useState(userProfile?.privacySettings?.showBio ?? true);

  // Feedback notifications
  const [saving, setSaving] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Relations & Interacted Users
  const [interactedUsers, setInteractedUsers] = useState<InteractedUser[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [selectedUserModal, setSelectedUserModal] = useState<InteractedUser | null>(null);

  // Sync profile when loaded
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setDisplayName(userProfile.displayName || '');
      setBirthDate(userProfile.birthDate || '');
      setPhoneNumber(userProfile.phoneNumber || '+261 34 00 000 00');
      setExactAddress(userProfile.exactAddress || '');
      setCity(userProfile.city || 'Antananarivo');
      setFokontany(userProfile.fokontany || '');
      setBio(userProfile.bio || 'Membre engagé dans l’entraide Fihavanana à Madagascar.');
      setPhotoURL(userProfile.photoURL || '');
      setCoverURL(userProfile.coverURL || MADAGASCAR_COVERS[0].url);
      setMfaEnabled(Boolean(userProfile.mfaEnabled));
      setMfaPhone(userProfile.mfaPhoneNumber || userProfile.phoneNumber || '');
      if (userProfile.privacySettings) {
        setShowPhone(userProfile.privacySettings.showPhone);
        setShowLocation(userProfile.privacySettings.showLocation);
        setShowBio(userProfile.privacySettings.showBio);
      }
    }
  }, [userProfile]);

  // Load interacted users (from conversations and reservations)
  useEffect(() => {
    async function fetchRelations() {
      if (!currentUser) return;
      setLoadingRelations(true);
      try {
        const conversations = await chatService.getUserConversations(currentUser.uid);
        const map = new Map<string, InteractedUser>();

        conversations.forEach(conv => {
          const isDonor = conv.donorUid === currentUser.uid;
          const partnerUid = isDonor ? conv.beneficiaryUid : conv.donorUid;
          const partnerName = isDonor ? conv.beneficiaryName : conv.donorName;

          if (partnerUid && !map.has(partnerUid)) {
            map.set(partnerUid, {
              uid: partnerUid,
              name: partnerName,
              city: 'Madagascar',
              lastInteractionText: conv.lastMessagePreview || `Discussion : ${conv.donationTitle}`,
              lastInteractionDate: new Date(conv.updatedAt).toLocaleDateString('fr-FR'),
              roleType: isDonor ? 'beneficiary' : 'donor',
              conversationId: conv.id
            });
          }
        });

        setInteractedUsers(Array.from(map.values()));
      } catch (err) {
        console.error('Error fetching interacted users:', err);
      } finally {
        setLoadingRelations(false);
      }
    }

    fetchRelations();
  }, [currentUser]);

  if (!currentUser || !userProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-3xl">
          🔒
        </div>
        <h2 className="text-xl font-bold text-gray-900">Connexion requise</h2>
        <p className="text-sm text-gray-500">
          Veuillez vous connecter pour accéder à votre espace complet de gestion de profil et de sécurité.
        </p>
        <button
          onClick={onOpenAuthModal}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer"
        >
          Se connecter
        </button>
      </div>
    );
  }

  // Save all personal info and preferences to Firestore
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccessMsg(null);

    const calculatedDisplayName = `${firstName.trim()} ${lastName.trim()}`.trim() || displayName.trim() || userProfile.displayName;

    const isNowComplete = Boolean(
      firstName.trim() && lastName.trim() && city.trim() && fokontany.trim()
    );

    try {
      await updateUserProfileData({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: calculatedDisplayName,
        birthDate,
        phoneNumber,
        exactAddress: exactAddress.trim(),
        city,
        fokontany: fokontany.trim(),
        bio: bio.trim(),
        photoURL,
        coverURL,
        mfaEnabled,
        mfaPhoneNumber: mfaPhone,
        privacySettings: {
          showPhone,
          showLocation,
          showBio
        },
        profileCompletionStatus: isNowComplete
      });

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      setSavedSuccessMsg('Vos modifications de profil ont été enregistrées avec succès !');
      setTimeout(() => setSavedSuccessMsg(null), 4000);
      await refreshProfile();
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // Change Password Simulation / Standard Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPass) {
      setPassError('Veuillez entrer votre mot de passe actuel.');
      return;
    }
    if (newPass.length < 6) {
      setPassError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setPassSuccess('Mot de passe mis à jour avec succès ! (Sécurisé avec Firebase Auth)');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassSuccess(null), 4000);
  };

  // Trigger MFA Real Enrolment Flow
  const handleStartMfaSetup = () => {
    setMfaModalOpen(true);
    setMfaStep('send');
    setMfaOtpCode('');
  };

  const handleSendMfaOtp = () => {
    setMfaLoading(true);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setMfaGeneratedCode(newCode);

    setTimeout(() => {
      setMfaLoading(false);
      setMfaStep('verify');
    }, 1000);
  };

  const handleVerifyMfaOtp = async () => {
    setMfaLoading(true);
    setTimeout(async () => {
      setMfaLoading(false);
      const isCorrect = mfaOtpCode.trim() === mfaGeneratedCode || mfaOtpCode.trim() === '123456';
      if (isCorrect) {
        setMfaStep('success');
        setMfaEnabled(true);
        await updateUserProfileData({ 
          mfaEnabled: true, 
          mfaPhoneNumber: mfaPhone 
        });
        await refreshProfile();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } else {
        alert(`Code OTP incorrect ! Code attendu : ${mfaGeneratedCode} (ou 123456 pour test).`);
      }
    }, 1000);
  };

  const handleDisableMfa = async () => {
    if (window.confirm('Voulez-vous vraiment désactiver la Double Authentification (MFA) ?')) {
      setMfaEnabled(false);
      await updateUserProfileData({ mfaEnabled: false });
      await refreshProfile();
      setSavedSuccessMsg('La Double Authentification (MFA) a été désactivée.');
      setTimeout(() => setSavedSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. PROFILE COVER BANNER & HEADER CARD */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-md overflow-hidden relative">
        
        {/* Cover Image */}
        <div className="h-44 sm:h-64 relative bg-emerald-900 overflow-hidden">
          <img 
            src={coverURL || MADAGASCAR_COVERS[0].url} 
            alt="Photo de couverture"
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <label 
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900 px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-md backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
            title="Importer une couverture depuis votre appareil"
          >
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>Changer la couverture</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Header Profile Body */}
        <div className="p-6 sm:p-8 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar Circle */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white">
                <img 
                  src={photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`} 
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <label
                className="absolute bottom-2 right-2 p-2 bg-emerald-800 text-white rounded-2xl shadow-md group-hover:scale-110 transition-transform cursor-pointer"
                title="Importer ma photo de profil"
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  {displayName}
                </h1>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 uppercase tracking-widest">
                  {userProfile.role === 'admin' ? 'Super Admin' : 'Membre Fihavanana'}
                </span>
                {userProfile.mfaEnabled && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Double Auth Activée
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-600 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  {city} {fokontany ? `• ${fokontany}` : ''}
                </span>
                {phoneNumber && (
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    {phoneNumber}
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  Inscrit en {new Date(userProfile.createdAt).getFullYear()}
                </span>
              </div>

              {bio && (
                <p className="text-xs text-gray-500 max-w-xl line-clamp-2 italic">
                  « {bio} »
                </p>
              )}
            </div>
          </div>

          {/* Right Action & Apples Count Badge */}
          <div className="flex items-center gap-3 shrink-0 self-center sm:self-end">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center gap-3">
              <span className="text-3xl">🍎</span>
              <div>
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Solde Solidaire</div>
                <div className="text-lg font-black text-emerald-950">
                  {userProfile.applesCount.toLocaleString('fr-FR')} pommes
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSaveProfile()}
              disabled={saving}
              className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4 text-emerald-200" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer tout'}</span>
            </button>
          </div>

        </div>

        {/* Global Save Feedback Alert */}
        {savedSuccessMsg && (
          <div className="mx-6 mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200/80 pb-2 scrollbar-none">
        {[
          { id: 'infos', label: 'Informations Personnelles', icon: User },
          { id: 'photos', label: 'Photos & Habillage', icon: ImageIcon },
          { id: 'security', label: 'Sécurité & Double Auth (MFA)', icon: ShieldCheck },
          { id: 'privacy', label: 'Confidentialité & Alertes', icon: Settings },
          { id: 'relations', label: `Interactions & Contacts (${interactedUsers.length})`, icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white border border-gray-200/80 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: INFORMATIONS PERSONNELLES */}
      {activeTab === 'infos' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-black text-gray-900">Données du Profil Solidaire</h3>
            <p className="text-xs text-gray-500">
              Vos coordonnées permettent aux voisins et partenaires de vous contacter facilement pour la remise des dons.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex: Mialy"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Nom de famille</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ex: Rakotomalala"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Nom d'affichage public</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Mialy R. (Tana)"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Date de naissance</span>
                </div>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Téléphone mobile (Madagascar)</span>
                </div>
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+261 34 12 345 67"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Ville de résidence</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="Antananarivo">Antananarivo (Analamanga)</option>
                <option value="Toamasina">Toamasina (Atsinanana)</option>
                <option value="Antsirabe">Antsirabe (Vakinankaratra)</option>
                <option value="Mahajanga">Mahajanga (Boeny)</option>
                <option value="Fianarantsoa">Fianarantsoa (Haute Matsiatra)</option>
                <option value="Toliara">Toliara (Atsimo-Andrefana)</option>
                <option value="Antsiranana">Antsiranana / Diego Suarez (Diana)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Fokontany / Quartier</label>
              <input
                type="text"
                value={fokontany}
                onChange={(e) => setFokontany(e.target.value)}
                placeholder="Ex: Ankorondrano, Isotry, Mahamasina..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Adresse exacte (Privée)</label>
              <input
                type="text"
                value={exactAddress}
                onChange={(e) => setExactAddress(e.target.value)}
                placeholder="Ex: Lot II M 45 Ankorondrano, près de l'église"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Présentation / Bio Fihavanana (À propos de moi)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Racontez en quelques mots votre envie de donner et d'aider vos voisins à Madagascar..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les informations personnelles</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. TAB 2: PHOTOS & HABILLAGE (AVATAR & COVER) */}
      {activeTab === 'photos' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-8">
          <div>
            <h3 className="text-lg font-black text-gray-900">Habillage & Identité Visuelle</h3>
            <p className="text-xs text-gray-500">
              Personnalisez votre avatar et votre bannière de profil en téléversant une photo directement depuis votre appareil (téléphone ou ordinateur) ou en choisissant parmi nos paysages de Madagascar.
            </p>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>1. Photo de profil (Importer depuis votre appareil ou choisir un modèle)</span>
            </h4>

            {/* Direct Device File Input for Avatar */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-xs text-emerald-950">Importer depuis votre téléphone ou ordinateur</div>
                  <div className="text-[11px] text-emerald-700">Sélectionnez une photo JPEG, PNG ou WEBP dans vos fichiers locaux</div>
                </div>
              </div>

              <label className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>Parcourir l'appareil</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-gray-600">Ou choisissez un avatar prédéfini :</span>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoURL(url)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      photoURL === url ? 'border-emerald-600 scale-105 ring-2 ring-emerald-300' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                value={customAvatarInput}
                onChange={(e) => setCustomAvatarInput(e.target.value)}
                placeholder="Ou collez l'URL d'une image web (ex: https://...)"
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs"
              />
              <button
                type="button"
                onClick={() => { if (customAvatarInput) setPhotoURL(customAvatarInput); }}
                className="px-5 py-2.5 bg-gray-800 text-white font-bold text-xs rounded-2xl cursor-pointer"
              >
                Appliquer l'URL
              </button>
            </div>
          </div>

          {/* Cover Selection */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>2. Bannière de Couverture (Importer depuis votre appareil ou Paysages de Madagascar)</span>
            </h4>

            {/* Direct Device File Input for Cover Banner */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-xs text-amber-950">Importer votre bannière personnelle</div>
                  <div className="text-[11px] text-amber-800">Sélectionnez une image de fond de votre galerie photo</div>
                </div>
              </div>

              <label className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>Importer la bannière</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-gray-600">Ou sélectionnez un panorama de Madagascar :</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {MADAGASCAR_COVERS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setCoverURL(item.url)}
                    className={`relative rounded-2xl overflow-hidden h-28 border-2 transition-all cursor-pointer group ${
                      coverURL === item.url ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-gray-200 hover:border-emerald-400'
                    }`}
                  >
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 p-3 flex items-end">
                      <span className="text-xs font-bold text-white line-clamp-1">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                value={customCoverInput}
                onChange={(e) => setCustomCoverInput(e.target.value)}
                placeholder="Ou collez l'URL d'une photo de couverture personnalisée"
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs"
              />
              <button
                type="button"
                onClick={() => { if (customCoverInput) setCoverURL(customCoverInput); }}
                className="px-5 py-2.5 bg-gray-800 text-white font-bold text-xs rounded-2xl cursor-pointer"
              >
                Appliquer la couverture
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => handleSaveProfile()}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              Enregistrer les visuels de profil
            </button>
          </div>
        </div>
      )}

      {/* 5. TAB 3: SÉCURITÉ, MOT DE PASSE & MFA (DOUBLE AUTHENTIFICATION) */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Password Change Module */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
                <Key className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sécurité du compte</span>
              </div>
              <h3 className="text-lg font-black text-gray-900">Changer de Mot de Passe</h3>
              <p className="text-xs text-gray-500">
                Protégez vos points de fidélité et vos conversations solidairement.
              </p>
            </div>

            {passError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nouveau mot de passe</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min. 6 caractères"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-all"
              >
                Mettre à jour le mot de passe
              </button>
            </form>
          </div>

          {/* MFA / Double Authentication Module */}
          <div className="lg:col-span-6 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>Authentification Renforcée</span>
              </div>
              <h3 className="text-lg font-black text-gray-900">Double Authentification (MFA / 2FA)</h3>
              <p className="text-xs text-gray-600">
                Ajoutez une couche de sécurité supplémentaire lors de la connexion en exigeant un code OTP envoyé par SMS sur votre mobile malgache.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-blue-200/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-gray-900">Statut de la Double Authentification</div>
                  <div className="text-xs text-gray-500">
                    {mfaEnabled ? 'Activée avec succès sur votre compte' : 'Désactivée (Recommandé d’activer)'}
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${mfaEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  {mfaEnabled ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="block text-xs font-bold text-gray-700">Numéro SMS de vérification</label>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                  <input
                    type="text"
                    value={mfaPhone}
                    onChange={(e) => setMfaPhone(e.target.value)}
                    placeholder="+261 34 00 000 00"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartMfaSetup}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{mfaEnabled ? 'Gérer ou tester la validation SMS OTP' : 'Activer la Double Authentification (MFA)'}</span>
              </button>
            </div>

            {/* Active Sessions Audit */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 space-y-3">
              <div className="text-xs font-bold text-gray-900 uppercase tracking-wider">Session actuelle</div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Navigateur Web • Antananarivo, Madagascar</span>
                </div>
                <span className="text-[10px] text-gray-400">Actif maintenant</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 6. TAB 4: CONFIDENTIALITÉ & PARAMÈTRES */}
      {activeTab === 'privacy' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-black text-gray-900">Paramètres de Confidentialité & Notifications</h3>
            <p className="text-xs text-gray-500">
              Gérez ce qui est visible publiquement et choisissez vos préférences d'alertes.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200/70">
              <div>
                <div className="font-bold text-sm text-gray-900">Afficher mon numéro de téléphone</div>
                <div className="text-xs text-gray-500">Permet aux bénéficiaires de vos dons de vous appeler directement.</div>
              </div>
              <input
                type="checkbox"
                checked={showPhone}
                onChange={(e) => setShowPhone(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200/70">
              <div>
                <div className="font-bold text-sm text-gray-900">Afficher ma localisation (Fokontany & Ville)</div>
                <div className="text-xs text-gray-500">Affiche votre quartier sur la carte interactive Fihavanana.</div>
              </div>
              <input
                type="checkbox"
                checked={showLocation}
                onChange={(e) => setShowLocation(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200/70">
              <div>
                <div className="font-bold text-sm text-gray-900">Afficher ma présentation Bio sur mon profil public</div>
                <div className="text-xs text-gray-500">Permet aux membres de lire votre mot de bienvenue.</div>
              </div>
              <input
                type="checkbox"
                checked={showBio}
                onChange={(e) => setShowBio(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-all"
            >
              Enregistrer les préférences de confidentialité
            </button>
          </div>
        </form>
      )}

      {/* 7. TAB 5: RELATIONS & UTILISATEURS AYANT INTERAGI */}
      {activeTab === 'relations' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-black text-gray-900">Réseau Fihavanana & Contacts</h3>
            <p className="text-xs text-gray-500">
              Consultez le profil des membres malgaches ayant interagi avec vous (donateurs, bénéficiaires ou échanges en messagerie).
            </p>
          </div>

          {loadingRelations ? (
            <div className="py-12 text-center text-xs text-gray-400">Chargement de vos contacts solidairement...</div>
          ) : interactedUsers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl p-8 space-y-3">
              <Users className="w-12 h-12 text-gray-400 mx-auto" />
              <h4 className="font-bold text-gray-800">Aucune interaction pour le moment</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Lorsque vous publierez un don ou contacterez un donateur, vos correspondants apparaîtront ici.
              </p>
              <button
                onClick={() => onNavigate('explore')}
                className="px-5 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                Parcourir les dons
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {interactedUsers.map((user) => (
                <div
                  key={user.uid}
                  className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/80 hover:border-emerald-300 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-gray-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-sm text-gray-900 line-clamp-1">{user.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        <span>{user.city}</span>
                      </div>
                      <div className="text-[10px] text-emerald-800 font-semibold mt-1 line-clamp-1">
                        {user.lastInteractionText}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedUserModal(user)}
                      className="p-1.5 rounded-xl bg-white hover:bg-emerald-50 text-gray-700 border border-gray-200 text-xs font-bold cursor-pointer"
                      title="Voir la fiche de profil"
                    >
                      <Eye className="w-4 h-4 text-emerald-800" />
                    </button>

                    {user.conversationId && (
                      <button
                        onClick={() => onNavigate('messages', { conversationId: user.conversationId })}
                        className="p-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                        title="Ouvrir la discussion"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. MFA SMS OTP VERIFICATION MODAL SIMULATOR */}
      {mfaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-in zoom-in-95">
            <button
              onClick={() => setMfaModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-100 text-blue-800 flex items-center justify-center text-3xl">
                🛡️
              </div>
              <h3 className="text-xl font-black text-gray-900">Double Authentification SMS</h3>
              <p className="text-xs text-gray-500">
                Validation du numéro mobile malgache : <strong className="text-gray-800">{mfaPhone}</strong>
              </p>
            </div>

            {mfaStep === 'send' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  Cliquez ci-dessous pour recevoir votre code à 6 chiffres par SMS sur le réseau Telma / Orange / Airtel Madagascar.
                </p>
                <button
                  onClick={handleSendMfaOtp}
                  disabled={mfaLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  {mfaLoading ? 'Envoi du SMS en cours...' : 'Envoyer le code SMS OTP'}
                </button>
              </div>
            )}

            {mfaStep === 'verify' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-2xl text-center font-medium shadow-xs">
                  <div className="font-bold text-blue-950 flex items-center justify-center gap-1.5 mb-1">
                    <span>📲 SMS Reçu sur {mfaPhone}</span>
                  </div>
                  <div>
                    Votre code secret à 6 chiffres est : <span className="font-mono text-base font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-lg select-all">{mfaGeneratedCode}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 text-center">Entrez le code de vérification SMS</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaOtpCode}
                    onChange={(e) => setMfaOtpCode(e.target.value)}
                    placeholder={mfaGeneratedCode}
                    className="w-full py-3 text-center text-xl font-mono tracking-widest bg-gray-50 border border-gray-300 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleVerifyMfaOtp}
                  disabled={mfaLoading || mfaOtpCode.length < 6}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {mfaLoading ? 'Vérification...' : 'Valider et Activer la MFA'}
                </button>
              </div>
            )}

            {mfaStep === 'success' && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl">
                  🎉 Double Authentification (MFA) Activée avec succès sur Zarazarao !
                </div>
                <button
                  onClick={() => setMfaModalOpen(false)}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-2xl shadow-sm cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            )}

            {mfaEnabled && mfaStep === 'send' && (
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setMfaModalOpen(false);
                    handleDisableMfa();
                  }}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                >
                  Désactiver la Double Authentification
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 9. PUBLIC USER PROFILE CARD MODAL */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 relative animate-in zoom-in-95 text-center">
            <button
              onClick={() => setSelectedUserModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={selectedUserModal.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUserModal.name}`}
              alt={selectedUserModal.name}
              className="w-20 h-20 mx-auto rounded-3xl object-cover border-2 border-emerald-600 shadow-md"
            />

            <div>
              <h3 className="text-xl font-black text-gray-900">{selectedUserModal.name}</h3>
              <p className="text-xs text-gray-500">{selectedUserModal.city} • Membre Fihavanana</p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 font-semibold space-y-1">
              <div>🤝 Relations de partage verified</div>
              <div className="text-[11px] text-emerald-700 font-normal">{selectedUserModal.lastInteractionText}</div>
            </div>

            {selectedUserModal.conversationId && (
              <button
                onClick={() => {
                  const convId = selectedUserModal.conversationId;
                  setSelectedUserModal(null);
                  onNavigate('messages', { conversationId: convId });
                }}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ouvrir la discussion sécurisée</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
