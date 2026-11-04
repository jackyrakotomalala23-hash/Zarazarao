import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  X, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Gift, 
  Building2, 
  Check, 
  Clock, 
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { loyaltyService } from '@/services/loyaltyService';
import { Partner, Coupon } from '@/types';

interface ApplesConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  onConversionSuccess: (coupon: Coupon) => void;
}

export const ApplesConversionModal: React.FC<ApplesConversionModalProps> = ({
  isOpen,
  onClose,
  partners,
  onConversionSuccess
}) => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState<number>(10000);
  const [customAmountStr, setCustomAmountStr] = useState<string>('10000');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(partners[0] || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCoupon, setGeneratedCoupon] = useState<Coupon | null>(null);

  if (!isOpen || !currentUser || !userProfile) return null;

  const currentBalance = userProfile.applesCount || 0;
  const isBalanceEnough = currentBalance >= 10000;

  const handleCustomAmountChange = (val: string) => {
    setCustomAmountStr(val);
    const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed)) {
      setAmount(parsed);
    } else {
      setAmount(0);
    }
  };

  const handleStep1Next = () => {
    setError(null);
    if (amount < 10000) {
      setError('Le montant minimum de conversion est de 10 000 pommes.');
      return;
    }
    if (amount > currentBalance) {
      setError(`Solde insuffisant. Vous disposez actuellement de ${currentBalance.toLocaleString('fr-FR')} pommes.`);
      return;
    }
    setStep(2);
  };

  const handleConfirmConversion = async () => {
    if (!selectedPartner) {
      setError('Veuillez choisir une enseigne partenaire.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const coupon = await loyaltyService.convertApplesToCouponWithPartner(
        currentUser.uid,
        userProfile.displayName || 'Membre Zarazarao',
        amount,
        selectedPartner.id,
        selectedPartner.name
      );

      setGeneratedCoupon(coupon);
      setStep(3);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch (cErr) {
        console.warn('Confetti error:', cErr);
      }

      await refreshProfile();
      onConversionSuccess(coupon);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la conversion des pommes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        className="bg-white/95 backdrop-blur-2xl rounded-[32px] max-w-lg w-full shadow-[0_25px_70px_-15px_rgba(0,0,0,0.38)] border border-white/80 overflow-hidden relative max-h-[92vh] flex flex-col z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 relative shrink-0 shadow-md">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-all cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-400/20 border border-amber-300/40 text-amber-200 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              1 000 Pommes = 1 000 Ariary
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Convertir mes Pommes en Bon d'Achat
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 font-medium">
            Seuil minimum de conversion : <strong className="text-amber-300">10 000 pommes (10 000 Ar)</strong>
          </p>

          {/* Stepper Progress Bar */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
            <div className={`flex-1 flex items-center gap-1.5 font-bold ${step >= 1 ? 'text-amber-300' : 'text-white/40'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 1 ? 'bg-amber-400 text-emerald-950' : 'bg-white/20 text-white'}`}>1</span>
              <span>Montant</span>
            </div>
            <div className="w-4 border-t border-white/20" />
            <div className={`flex-1 flex items-center gap-1.5 font-bold ${step >= 2 ? 'text-amber-300' : 'text-white/40'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 2 ? 'bg-amber-400 text-emerald-950' : 'bg-white/20 text-white'}`}>2</span>
              <span>Magasin</span>
            </div>
            <div className="w-4 border-t border-white/20" />
            <div className={`flex-1 flex items-center gap-1.5 font-bold ${step >= 3 ? 'text-amber-300' : 'text-white/40'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 3 ? 'bg-amber-400 text-emerald-950' : 'bg-white/20 text-white'}`}>3</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 grow">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          )}

          {/* STEP 1: CHOOSE AMOUNT */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              {/* Balance card */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🍎</span>
                  <div>
                    <div className="text-xs text-emerald-800 font-semibold">Votre solde disponible :</div>
                    <div className="text-xl font-black text-emerald-950">
                      {currentBalance.toLocaleString('fr-FR')} pommes
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 font-medium">Équivalent :</div>
                  <div className="text-sm font-bold text-emerald-900">
                    {currentBalance.toLocaleString('fr-FR')} Ar
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Choisissez ou saisissez le montant de pommes à convertir :
                </label>

                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  {[10000, 20000, 50000, 100000].map((amt) => {
                    const isSelected = amount === amt;
                    const canAfford = currentBalance >= amt;

                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setAmount(amt);
                          setCustomAmountStr(amt.toString());
                        }}
                        disabled={!canAfford}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-800 text-white border-emerald-800 font-bold shadow-md'
                            : canAfford
                            ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-xs font-bold">{amt.toLocaleString('fr-FR')} pommes</div>
                        <div className="text-sm font-black mt-0.5">{amt.toLocaleString('fr-FR')} Ariary</div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Ou saisissez un nombre de pommes personnalisé (≥ 10 000) :
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customAmountStr}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      placeholder="10000"
                      className="w-full pl-4 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-extrabold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                    />
                    <span className="absolute right-4 top-3.5 text-xs font-bold text-emerald-800">
                      = {amount.toLocaleString('fr-FR')} Ar
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={handleStep1Next}
                disabled={amount < 10000 || amount > currentBalance}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl text-sm font-extrabold shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Étape suivante : Choisir le magasin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: CHOOSE STORE */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <span className="font-semibold">Montant retenu : </span>
                  <strong className="font-black text-amber-950 text-sm">{amount.toLocaleString('fr-FR')} Ar</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-emerald-800 font-bold hover:underline flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Modifier le montant</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Sélectionnez l'enseigne partenaire dans laquelle utiliser ce coupon :
                </label>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {partners.map((p) => {
                    const isSelected = selectedPartner?.id === p.id;

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPartner(p)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-lg">
                            🏪
                          </div>
                          <div>
                            <div className="font-extrabold text-xs text-slate-900">{p.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {p.city} • {p.address}
                            </div>
                            <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                              {p.terms || 'Valable sur l’ensemble des rayons'}
                            </div>
                          </div>
                        </div>

                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'}`}>
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl cursor-pointer"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleConfirmConversion}
                  disabled={loading || !selectedPartner}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Transmettre la demande au magasin</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CONFIRMATION & NOTIFICATION */}
          {step === 3 && generatedCoupon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-5 py-2"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-slate-900">Demande transmise avec succès ! 🍎</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Votre bon d'achat de <strong className="text-emerald-800">{generatedCoupon.faceValueAr.toLocaleString('fr-FR')} Ar</strong> pour <strong className="text-emerald-800">{selectedPartner?.name}</strong> a été envoyé au magasin.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs text-emerald-950 text-left space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Traitement & Délais Magasin :</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-900">
                  L'enseigne <strong>{selectedPartner?.name}</strong> recevra votre notification de coupon (Code : <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-bold">{generatedCoupon.eightDigitCode}</code>).
                </p>
                <p className="text-[11px] leading-relaxed text-emerald-900">
                  Une fois que le responsable magasin valide la durée d'utilisation et les modalités, le coupon deviendra actif et immédiatement téléchargeable/imprimable dans votre <strong>Coffre-fort de coupons</strong> !
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Accéder à mon Coffre-fort de coupons
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
