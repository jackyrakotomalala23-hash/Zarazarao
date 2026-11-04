import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Store, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Camera, 
  Barcode, 
  Lock,
  RefreshCw,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { partnerService, CouponVerificationResult } from '@/services/partnerService';
import { loyaltyService } from '@/services/loyaltyService';
import { Coupon } from '@/types';
import { useTranslation } from '@/contexts/TranslationContext';

export const StorePartnerVerificationPage: React.FC = () => {
  const { currentUser, userProfile, isPartner, isAdmin } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'scan' | 'pending'>('scan');
  const [mode, setMode] = useState<'manual' | 'camera'>('manual');
  const [code, setCode] = useState('');
  const [storeName, setStoreName] = useState('Supermarché Score Ivandry');
  const [verifying, setVerifying] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [result, setResult] = useState<CouponVerificationResult | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<Coupon | null>(null);

  // Pending coupons state
  const [pendingCoupons, setPendingCoupons] = useState<Coupon[]>([]);
  const [validatingCoupon, setValidatingCoupon] = useState<Coupon | null>(null);
  const [validityDays, setValidityDays] = useState<number>(90);
  const [terms, setTerms] = useState<string>('Valable dans tous les rayons de l’enseigne hors promotions en cours.');
  const [validatingAction, setValidatingAction] = useState(false);

  // Camera scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasStoreAccess = isPartner || isAdmin || userProfile?.role === 'admin' || userProfile?.role === 'partner';

  const loadPendingCoupons = async () => {
    try {
      const list = await loyaltyService.getPendingCouponsForPartner(storeName);
      setPendingCoupons(list);
    } catch (err) {
      console.warn('Error loading pending coupons:', err);
    }
  };

  useEffect(() => {
    if (hasStoreAccess) {
      loadPendingCoupons();
    }
  }, [hasStoreAccess, storeName]);

  // Start camera stream when camera mode is active
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (mode === 'camera' && hasStoreAccess) {
      setCameraActive(true);
      setCameraError(null);
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera permission denied or unavailable:', err);
          setCameraError(t('store.camError', 'Impossible d\'accéder à la caméra. Vérifiez les autorisations de votre navigateur ou utilisez la saisie manuelle.'));
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode, hasStoreAccess]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setResult(null);
    setRedeemSuccess(null);

    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length !== 8) {
      setResult({
        valid: false,
        message: t('store.errLength', 'Le code du coupon doit contenir exactement 8 chiffres.')
      });
      return;
    }

    setVerifying(true);
    try {
      const res = await partnerService.verifyCouponCode(cleanCode);
      setResult(res);
    } catch (err: any) {
      console.error('Verification error:', err);
      setResult({
        valid: false,
        message: t('store.errVerify', 'Erreur lors de la vérification du code en base de données.')
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleRedeem = async () => {
    if (!result?.coupon || !currentUser) return;
    setRedeeming(true);
    try {
      const { coupon } = await partnerService.redeemCouponInStore(
        result.coupon.id,
        currentUser.uid,
        storeName
      );
      setRedeemSuccess(coupon);
      setResult(null);
      setCode('');
    } catch (err: any) {
      console.error('Redeem error:', err);
      alert(err?.message || t('store.errRedeem', 'Erreur lors de l\'encaissement du coupon.'));
    } finally {
      setRedeeming(false);
    }
  };

  const handleValidateCoupon = async () => {
    if (!validatingCoupon || !currentUser) return;
    setValidatingAction(true);
    try {
      await loyaltyService.validateCouponByPartner(
        validatingCoupon.id,
        currentUser.uid,
        storeName,
        validityDays,
        terms
      );
      setValidatingCoupon(null);
      await loadPendingCoupons();
      alert(`🎉 Coupon de ${validatingCoupon.faceValueAr.toLocaleString('fr-FR')} Ar validé avec succès pour ${validatingCoupon.ownerName} !`);
    } catch (err: any) {
      console.error('Validation error:', err);
      alert(err?.message || 'Erreur lors de la validation du coupon par le magasin.');
    } finally {
      setValidatingAction(false);
    }
  };

  // Simulate scanning a code via camera (for demo & testing)
  const simulateScanCode = () => {
    const sampleCodes = ['48291054', '91823746', '33491022', '77219088'];
    const randomCode = sampleCodes[Math.floor(Math.random() * sampleCodes.length)];
    setCode(randomCode);
    setMode('manual');
    setTimeout(() => {
      handleVerify();
    }, 200);
  };

  if (!hasStoreAccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6"
      >
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center text-4xl shadow-md border border-amber-200">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900">
            {t('store.restrictedTitle', 'Espace Réservé aux Magasins Partenaires')}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
            {t('store.restrictedDesc', 'Cette page de scan et de validation de coupons de caisse est strictly réservée aux comptes partenaires agréés.')}
          </p>
        </div>

        <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-200 text-left space-y-3 max-w-md mx-auto">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            {t('store.adminCreateNote', 'Comment devenir magasin partenaire ?')}
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            {t('store.adminCreateSub', 'Contactez l\'équipe de direction Zarazarao Madagascar à partenariats@zarazarao.mg ou demandez à un administrateur de générer vos accès caisse.')}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold shadow-2xs">
          <Store className="w-3.5 h-3.5 text-emerald-700" />
          {t('store.badge', 'Terminal Partenaire & Caisse Magasin')}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
          {t('store.title', 'Vérification et validation de coupons Zarazarao')}
        </h1>
        <p className="text-sm text-gray-600">
          {t('store.subtitle', 'Module sécurisé de scan caméra ou saisie manuelle pour les caissiers et responsables des enseignes partenaires.')}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
        
        {/* Store Identifier selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
          <div>
            <span className="text-gray-500 font-medium">{t('store.cashierPoint', 'Point de vente / Caisse actif :')}</span>
            <div className="font-bold text-gray-900 text-sm">{storeName}</div>
          </div>
          <select
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Supermarché Score Ivandry">Supermarché Score Ivandry (Tana)</option>
            <option value="Jumbo Score Ankorondrano">Jumbo Score Ankorondrano (Tana)</option>
            <option value="Supermaki Analakely">Supermaki Analakely (Tana)</option>
            <option value="Supermaki Tamatave Bazar Be">Supermaki Tamatave Bazar Be</option>
            <option value="Librairie Solidaire Analakely">Librairie Solidaire Analakely</option>
            <option value="BricoTech Quincaillerie Tamatave">BricoTech Tamatave</option>
          </select>
        </div>

        {/* Top Mode Navigation Tabs */}
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'scan'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Barcode className="w-4 h-4 text-emerald-700" />
            <span>Scan & Encaissement Caisse</span>
          </button>
          <button
            onClick={() => { setActiveTab('pending'); loadPendingCoupons(); }}
            className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
              activeTab === 'pending'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-emerald-700" />
            <span>Demandes en attente de validation</span>
            {pendingCoupons.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black animate-pulse">
                {pendingCoupons.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: SCAN & ENCAISSEMENT CAISSE */}
        {activeTab === 'scan' && (
          <>
            {/* Mode Selector Tabs (Scan Camera vs Manual Code) */}
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'manual'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Barcode className="w-4 h-4 text-emerald-700" />
                <span>{t('store.modeManual', 'Saisie manuelle (8 chiffres)')}</span>
              </button>
              <button
                onClick={() => setMode('camera')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'camera'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>{t('store.modeCamera', 'Scanner avec la Caméra')}</span>
              </button>
            </div>

            {/* OPTION A: CAMERA SCANNER */}
            {mode === 'camera' && (
              <div className="space-y-4 p-4 bg-gray-900 rounded-3xl text-white text-center relative overflow-hidden">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t('store.camActive', 'Caméra de scan active')}
                  </span>
                  <button
                    onClick={() => setMode('manual')}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative w-full h-64 sm:h-72 bg-black rounded-2xl overflow-hidden border-2 border-emerald-500/50 flex items-center justify-center">
                  {cameraError ? (
                    <div className="p-6 space-y-3 text-red-300 text-xs">
                      <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
                      <p>{cameraError}</p>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-bounce" />
                      <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-24 border-2 border-dashed border-emerald-400/80 rounded-xl" />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-gray-400">
                    {t('store.camHint', 'Pointez la caméra du téléphone ou de la caisse vers le code-barres du client.')}
                  </p>
                  <button
                    onClick={simulateScanCode}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {t('store.simulateScan', 'Simuler un scan réussi')}
                  </button>
                </div>
              </div>
            )}

            {/* OPTION B: MANUAL INPUT */}
            {mode === 'manual' && (
              <form onSubmit={handleVerify} className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  {t('store.inputLabel', 'Saisir le code à 8 chiffres indiqué sous le coupon :')}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Barcode className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      required
                      maxLength={8}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder={t('store.placeholder', 'Ex: 48291054')}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-lg font-mono font-bold tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={verifying || code.length !== 8}
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-black text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {verifying ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>{t('store.verifyBtn', 'Vérifier le coupon')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Verification Result Card */}
            {result && (
              <div
                className={`p-6 rounded-3xl border-2 space-y-4 animate-in fade-in duration-200 ${
                  result.valid
                    ? 'bg-emerald-50/70 border-emerald-400'
                    : 'bg-red-50/70 border-red-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {result.valid ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-red-600 shrink-0" />
                    )}
                    <div>
                      <h3 className={`text-base font-black ${result.valid ? 'text-emerald-950' : 'text-red-900'}`}>
                        {result.valid ? t('store.validTitle', 'Coupon Authentique & Valide') : t('store.invalidTitle', 'Coupon Refusé')}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">{result.message}</p>
                    </div>
                  </div>

                  {result.coupon && (
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-950">
                        {result.coupon.faceValueAr.toLocaleString('fr-FR')} Ar
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                        {t('store.faceValue', 'Valeur de réduction')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Coupon Information Preview */}
                {result.valid && result.coupon && (
                  <div className="space-y-4 pt-3 border-t border-emerald-200">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-gray-400 block text-[10px]">{t('store.ownerLabel', 'Titulaire :')}</span>
                        <strong className="text-gray-900">{result.coupon.ownerName}</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-gray-400 block text-[10px]">{t('store.codeLabel', 'Code vérifié :')}</span>
                        <strong className="text-gray-900 font-mono">{result.coupon.eightDigitCode}</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-gray-400 block text-[10px]">{t('store.statusLabel', 'Statut :')}</span>
                        <strong className="text-emerald-800 font-bold">{t('store.readyLabel', 'Prêt pour encaissement')}</strong>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleRedeem}
                        disabled={redeeming}
                        className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        {redeeming ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-amber-300" />
                            <span>{t('store.applyRedeem', 'Valider et appliquer la réduction en caisse')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Redemption Success Badge */}
            {redeemSuccess && (
              <div className="p-6 bg-emerald-900 text-white rounded-3xl space-y-3 text-center animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-12 h-12 text-amber-300 mx-auto" />
                <h3 className="text-xl font-black">{t('store.successTitle', 'Réduction validée avec succès !')}</h3>
                <p className="text-xs text-emerald-100 max-w-md mx-auto">
                  {t('store.successDesc', 'Le coupon a été marqué comme utilisé et archivé de façon irréversible.')}
                </p>
                <div className="text-[11px] font-mono text-emerald-300">
                  Réf : {redeemSuccess.eightDigitCode} • Caissier : {currentUser?.email || 'Partenaire Zarazarao'}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: PENDING COUPONS FOR STORE VALIDATION */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">Demandes de coupons en attente pour {storeName}</h3>
                <p className="text-xs text-gray-500">
                  Fixez le délai de validité et les conditions d'utilisation, puis validez les coupons générés par vos clients.
                </p>
              </div>

              <button
                onClick={loadPendingCoupons}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualiser</span>
              </button>
            </div>

            {pendingCoupons.length === 0 ? (
              <div className="p-10 text-center bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-gray-800">Aucune demande en attente pour ce magasin</h4>
                <p className="text-xs text-gray-500">
                  Dès qu'un membre Zarazarao convertit ses pommes pour votre enseigne, sa demande apparaîtra ici.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 font-black text-xl flex items-center justify-center shrink-0 shadow-xs">
                        🎟️
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-gray-900">
                          {coupon.faceValueAr.toLocaleString('fr-FR')} Ariary
                        </div>
                        <div className="text-xs text-gray-600">
                          Client : <strong className="text-gray-900">{coupon.ownerName}</strong> • Code : <code className="font-mono bg-white px-1.5 py-0.5 rounded border font-bold">{coupon.eightDigitCode}</code>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Demandé le {new Date(coupon.createdAt).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setValidatingCoupon(coupon)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>Fixer délai & Valider le coupon</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* STORE VALIDATION MODAL */}
      {validatingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-gray-900">
                  Validation du Coupon {validatingCoupon.faceValueAr.toLocaleString('fr-FR')} Ar
                </h3>
              </div>
              <button
                onClick={() => setValidatingCoupon(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl text-xs space-y-1 border border-emerald-200">
              <div>Client : <strong>{validatingCoupon.ownerName}</strong></div>
              <div>Code d'identification : <strong className="font-mono">{validatingCoupon.eightDigitCode}</strong></div>
              <div>Enseigne : <strong>{storeName}</strong></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  1. Durée de validité du bon d'achat :
                </label>
                <select
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={30}>30 jours (1 mois)</option>
                  <option value={60}>60 jours (2 mois)</option>
                  <option value={90}>90 jours (3 mois - Recommandé)</option>
                  <option value={180}>180 jours (6 mois)</option>
                  <option value={365}>365 jours (1 an)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  2. Modalités et conditions d'utilisation du magasin :
                </label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Ex: Valable sur tous les rayons alimentation et hygiène hors promotions."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setValidatingCoupon(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleValidateCoupon}
                disabled={validatingAction}
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {validatingAction ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>Valider et émettre le bon au client</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};
