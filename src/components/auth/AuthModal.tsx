import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Send,
  Sparkles,
  Key
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MADAGASCAR_CITIES } from '@/config/constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot' | 'reset_confirm';
  oobCode?: string;
}

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset_sent' | 'reset_confirm' | 'reset_complete';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  oobCode: initialOobCode = ''
}) => {
  const { 
    signInWithGoogle, 
    signUpWithEmail, 
    signInWithEmail, 
    resetPassword,
    confirmResetPassword 
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [oobCode, setOobCode] = useState<string>(initialOobCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccessEmail, setResetSuccessEmail] = useState<string>('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+261 ');
  const [city, setCity] = useState('Antananarivo');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Sync initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      if (initialOobCode) {
        setOobCode(initialOobCode);
      }
    }
  }, [isOpen, initialMode, initialOobCode]);

  if (!isOpen) return null;

  // Realtime password criteria checks for active password field
  const targetPassword = mode === 'reset_confirm' ? newPassword : password;
  const hasMinLength = targetPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(targetPassword);
  const hasLowercase = /[a-z]/.test(targetPassword);
  const hasNumber = /[0-9]/.test(targetPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(targetPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  // Calculate strength score 0-5
  const strengthScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  const getFirebaseErrorMessage = (err: any): string => {
    const code = err?.code || '';
    const message = err?.message || '';

    if (code === 'auth/email-already-in-use') {
      return 'Cet e-mail est déjà associé à un compte existant. Connectez-vous plutôt.';
    }
    if (code === 'auth/invalid-email') {
      return 'L’adresse e-mail saisie n’est pas valide.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'L’authentification par e-mail/mot de passe n’est pas activée sur ce projet Firebase.';
    }
    if (code === 'auth/weak-password') {
      return 'Le mot de passe est trop faible (8 caractères minimum requis avec majuscule, chiffre et symbole).';
    }
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'E-mail ou mot de passe incorrect. Veuillez vérifier vos identifiants.';
    }
    if (code === 'auth/invalid-action-code' || code === 'auth/expired-action-code') {
      return 'Le lien de réinitialisation est expiré ou invalide. Veuillez demander un nouveau lien.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Trop de tentatives échouées. Veuillez patienter un instant avant de réessayer.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Domaine non autorisé par Firebase sur Vercel (zarazarao.vercel.app). Solution : Rendez-vous dans la console Firebase > Authentication > Paramètres > Domaines autorisés, et ajoutez "zarazarao.vercel.app". Vous pouvez également utiliser la connexion par e-mail / mot de passe.';
    }
    if (message.includes('permission-denied') || message.includes('Missing or insufficient permissions')) {
      return 'Erreur de permissions lors de l’accès à la base de données.';
    }
    return message || 'Une erreur est survenue lors de l’opération.';
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Veuillez renseigner votre adresse e-mail.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setResetSuccessEmail(email.trim());
      setMode('reset_sent');
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        setError('Aucun compte Zarazarao n’est associé à cet e-mail.');
      } else {
        setResetSuccessEmail(email.trim());
        setMode('reset_sent');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (oobCode) {
        await confirmResetPassword(oobCode, newPassword);
      }
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (cErr) {
        console.warn('Confetti error:', cErr);
      }

      setMode('reset_complete');
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Veuillez renseigner votre prénom et nom.');
        return;
      }
      if (!isPasswordValid) {
        setError('Le mot de passe ne respecte pas tous les critères de sécurité requis.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Les deux mots de passe ne correspondent pas.');
        return;
      }
      if (!acceptedTerms) {
        setError('Vous devez accepter les conditions d’utilisation et la charte de partage gratuit.');
        return;
      }

      setLoading(true);
      try {
        await signUpWithEmail(email, password, name.trim(), city, phone.trim());
        onClose();
      } catch (err: any) {
        setError(getFirebaseErrorMessage(err));
      } finally {
        setLoading(false);
      }
    } else if (mode === 'signin') {
      setLoading(true);
      try {
        await signInWithEmail(email, password);
        onClose();
      } catch (err: any) {
        setError(getFirebaseErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Background soft glowing ambient highlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/95 backdrop-blur-2xl rounded-[32px] max-w-md w-full shadow-[0_25px_70px_-15px_rgba(0,0,0,0.38),0_0_30px_rgba(16,185,129,0.15)] border border-white/80 overflow-hidden relative max-h-[92vh] flex flex-col z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with 3D gradient and glowing Zarazarao branding */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 relative shrink-0 shadow-md">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-center gap-2 mb-2">
                {mode === 'signup' && (
                  <span className="bg-amber-400/20 border border-amber-300/40 text-amber-200 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1 shadow-inner">
                    🤝 100% Gratuit & Solidaire à Madagascar
                  </span>
                )}
                {mode === 'signin' && (
                  <span className="bg-white/15 border border-white/20 text-emerald-100 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1 shadow-inner">
                    👋 Bienvenue sur Zarazarao
                  </span>
                )}
                {(mode === 'forgot' || mode === 'reset_sent') && (
                  <span className="bg-amber-400/20 border border-amber-300/40 text-amber-200 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1 shadow-inner">
                    🔑 Sécurité & Récupération
                  </span>
                )}
                {(mode === 'reset_confirm' || mode === 'reset_complete') && (
                  <span className="bg-emerald-400/25 border border-emerald-300/40 text-emerald-200 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-inner">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />ouveau Mot de Passe Zarazarao
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2" translate="no">
                {mode === 'signup' && 'Créer mon compte'}
                {mode === 'signin' && 'Se connecter'}
                {mode === 'forgot' && 'Mot de passe oublié'}
                {mode === 'reset_sent' && 'Vérifiez votre boîte mail'}
                {mode === 'reset_confirm' && 'Nouveau mot de passe'}
                {mode === 'reset_complete' && 'Accès sécurisé !'}
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1 font-medium leading-relaxed">
                {mode === 'signup' && 'Rejoignez la communauté de partage 100% gratuit à Madagascar'}
                {mode === 'signin' && 'Accédez à vos dons, réservations et conversations'}
                {mode === 'forgot' && 'Saisissez votre e-mail pour recevoir le lien de réinitialisation'}
                {mode === 'reset_sent' && `Un e-mail de réinitialisation a été envoyé à ${resetSuccessEmail}`}
                {mode === 'reset_confirm' && 'Définissez votre nouveau mot de passe sécurisé pour votre compte'}
                {mode === 'reset_complete' && 'Votre mot de passe a été mis à jour avec succès'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 grow">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-rose-50/90 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5 shadow-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {mode === 'reset_confirm' ? (
              /* New Password Confirmation Form */
              <motion.form
                key="reset_confirm"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleConfirmResetPassword}
                className="space-y-4"
              >
                <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 mb-0.5">Sécurisation du compte</h4>
                    <p className="leading-relaxed text-[11px] text-emerald-800">
                      Entrez votre nouveau mot de passe ci-dessous. Veillez à utiliser un mot de passe fort combinant majuscules, chiffres et symboles.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 focus:shadow-[0_4px_16px_rgba(16,185,129,0.12)] transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      title={showPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2.5 space-y-1.5 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px]"
                    >
                      <div className="flex items-center justify-between text-slate-600 mb-1">
                        <span>Robustesse :</span>
                        <span className="font-bold text-slate-800">
                          {strengthScore <= 2 ? '⚠️ Faible' : strengthScore <= 4 ? '👍 Bon' : '🛡️ Excellent'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`h-full flex-1 transition-all duration-300 ${
                              strengthScore >= lvl
                                ? strengthScore <= 2
                                  ? 'bg-amber-500'
                                  : strengthScore <= 4
                                  ? 'bg-emerald-500'
                                  : 'bg-teal-600'
                                : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-1 text-slate-600">
                        <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-semibold' : ''}`}>
                          <Check className={`w-3 h-3 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} /> Min. 8 caractères
                        </span>
                        <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-700 font-semibold' : ''}`}>
                          <Check className={`w-3 h-3 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} /> 1 Majuscule
                        </span>
                        <span className={`flex items-center gap-1 ${hasLowercase ? 'text-emerald-700 font-semibold' : ''}`}>
                          <Check className={`w-3 h-3 ${hasLowercase ? 'text-emerald-600' : 'text-slate-300'}`} /> 1 Minuscule
                        </span>
                        <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-semibold' : ''}`}>
                          <Check className={`w-3 h-3 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} /> 1 Chiffre
                        </span>
                        <span className={`flex items-center gap-1 col-span-2 ${hasSpecial ? 'text-emerald-700 font-semibold' : ''}`}>
                          <Check className={`w-3 h-3 ${hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} /> 1 Caractère spécial (@, #, !, ...)
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl text-sm font-extrabold shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_28px_-4px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all cursor-pointer border border-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Enregistrer mon nouveau mot de passe</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : mode === 'reset_complete' ? (
              /* Reset Complete Celebration View */
              <motion.div
                key="reset_complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="text-center space-y-5 py-3"
              >
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-lg animate-ping" />
                  <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full flex items-center justify-center relative shadow-lg">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">Mot de passe mis à jour ! 🤝</h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                    Votre mot de passe Zarazarao a été modifié avec succès. Vous pouvez maintenant vous connecter en toute sécurité avec vos nouveaux identifiants.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white rounded-2xl text-sm font-extrabold shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Se connecter maintenant</span>
                </button>
              </motion.div>
            ) : mode === 'forgot' ? (
              /* Forgot Password View */
              <motion.form 
                key="forgot"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleForgotPassword} 
                className="space-y-4"
              >
                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-3 shadow-xs">
                  <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Entrez l'adresse e-mail associée à votre compte Zarazarao. Nous vous enverrons immédiatement un lien direct pour réinitialiser votre mot de passe en toute sécurité.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@exemple.mg"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 focus:shadow-[0_4px_16px_rgba(16,185,129,0.12)] transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl text-sm font-extrabold shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_28px_-4px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all cursor-pointer border border-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Envoyer le lien de réinitialisation</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Retour à la connexion</span>
                  </button>
                </div>
              </motion.form>
            ) : mode === 'reset_sent' ? (
              /* Reset Sent View */
              <motion.div 
                key="reset_sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-center space-y-4 py-2"
              >
                <div className="w-16 h-16 bg-emerald-100 border-4 border-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900">E-mail envoyé !</h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                    Un lien sécurisé de réinitialisation de mot de passe a été envoyé à <strong className="text-emerald-800">{resetSuccessEmail}</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-500 text-left space-y-1">
                  <p className="font-semibold text-slate-700">💡 Remarques importantes :</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Vérifiez également votre dossier courrier indésirable / SPAM.</li>
                    <li>Le lien reste valide pendant 1 heure.</li>
                    <li>Cliquez sur le lien reçu pour définir votre nouveau mot de passe.</li>
                  </ul>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retourner à la page de connexion</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Normal Sign In / Sign Up View */
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Fast Google Auth */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-b from-white to-slate-50 hover:to-slate-100 border border-slate-200/90 text-slate-800 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] active:scale-[0.99] disabled:opacity-50"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuer avec Google</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="grow border-t border-slate-200"></div>
                  <span className="shrink mx-3 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                    ou par e-mail
                  </span>
                  <div className="grow border-t border-slate-200"></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {mode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Prénom et Nom complet
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Mialy Rakotomalala"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 focus:shadow-[0_4px_16px_rgba(16,185,129,0.12)] transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Ville de résidence
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <select
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full pl-9 pr-2 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                            >
                              {MADAGASCAR_CITIES.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Téléphone mobile
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+261 34 00 000 00"
                              className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Adresse e-mail
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre.email@exemple.mg"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 focus:shadow-[0_4px_16px_rgba(16,185,129,0.12)] transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Mot de passe
                      </label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot');
                            setError(null);
                          }}
                          className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer transition-colors"
                        >
                          Mot de passe oublié ?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 focus:shadow-[0_4px_16px_rgba(16,185,129,0.12)] transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title={showPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password criteria checklist for Signup */}
                    {mode === 'signup' && password.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 space-y-1.5 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px]"
                      >
                        <div className="flex items-center justify-between text-slate-600 mb-1">
                          <span>Robustesse du mot de passe :</span>
                          <span className="font-bold text-slate-800">
                            {strengthScore <= 2 ? '⚠️ Faible' : strengthScore <= 4 ? '👍 Bon' : '🛡️ Excellent'}
                          </span>
                        </div>
                        {/* Strength Bar */}
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-1">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`h-full flex-1 transition-all duration-300 ${
                                strengthScore >= lvl
                                  ? strengthScore <= 2
                                    ? 'bg-amber-500'
                                    : strengthScore <= 4
                                    ? 'bg-emerald-500'
                                    : 'bg-teal-600'
                                  : 'bg-transparent'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-1 pt-1.5 text-slate-600">
                          <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-semibold' : ''}`}>
                            <Check className={`w-3 h-3 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} /> Min. 8 caractères
                          </span>
                          <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-700 font-semibold' : ''}`}>
                            <Check className={`w-3 h-3 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} /> 1 Majuscule
                          </span>
                          <span className={`flex items-center gap-1 ${hasLowercase ? 'text-emerald-700 font-semibold' : ''}`}>
                            <Check className={`w-3 h-3 ${hasLowercase ? 'text-emerald-600' : 'text-slate-300'}`} /> 1 Minuscule
                          </span>
                          <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-semibold' : ''}`}>
                            <Check className={`w-3 h-3 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} /> 1 Chiffre
                          </span>
                          <span className={`flex items-center gap-1 col-span-2 ${hasSpecial ? 'text-emerald-700 font-semibold' : ''}`}>
                            <Check className={`w-3 h-3 ${hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} /> 1 Caractère spécial (@, #, !, ...)
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirmer le mot de passe
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                        />
                      </div>
                    </div>
                  )}

                  {mode === 'signup' && (
                    <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-0.5 rounded-md text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer shrink-0"
                      />
                      <span className="leading-tight">
                        J'accepte formellement les{' '}
                        <a 
                          href="#cgu" 
                          onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('navigate-app', { detail: 'cgu' })); }}
                          className="font-bold text-emerald-800 underline hover:text-emerald-950"
                        >
                          CGU
                        </a>, la{' '}
                        <span className="font-bold text-emerald-800">charte Fihavanana</span> et la{' '}
                        <a 
                          href="#privacy" 
                          onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('navigate-app', { detail: 'data-privacy' })); }}
                          className="font-bold text-emerald-800 underline hover:text-emerald-950"
                        >
                          politique de confidentialité
                        </a>.
                      </span>
                    </label>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl text-sm font-extrabold shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_28px_-4px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all cursor-pointer border border-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span translate="no">{mode === 'signup' ? 'Créer mon compte gratuit' : 'Se connecter'}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Switch between Sign In & Sign Up */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'signup' ? 'signin' : 'signup');
                      setError(null);
                    }}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-bold hover:underline cursor-pointer transition-colors"
                  >
                    {mode === 'signup'
                      ? 'Vous possédez déjà un compte ? Connectez-vous'
                      : 'Pas encore de compte ? Inscrivez-vous gratuitement'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
