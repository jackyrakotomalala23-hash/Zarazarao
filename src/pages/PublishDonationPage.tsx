import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Package, 
  HelpCircle,
  Truck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { donationService } from '@/services/donationService';
import { CATEGORIES, MADAGASCAR_CITIES } from '@/config/constants';
import { PhotoUploadGallery } from '@/components/common/PhotoUploadGallery';
import { HandoverMode } from '@/types';

interface PublishDonationPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuthModal: () => void;
}

export const PublishDonationPage: React.FC<PublishDonationPageProps> = ({
  onNavigate,
  onOpenAuthModal
}) => {
  const { currentUser, userProfile, refreshProfile } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [conditionScore, setConditionScore] = useState<number>(8);
  const [city, setCity] = useState(userProfile?.city || 'Antananarivo');
  const [fokontany, setFokontany] = useState('');
  const [handoverMode, setHandoverMode] = useState<HandoverMode>('pickup');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [confirmedTruthful, setConfirmedTruthful] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success Celebration Modal State
  const [successReward, setSuccessReward] = useState<{
    donationId: string;
    firstBonus: boolean;
    randomReward: number;
  } | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-3xl">
          🎁
        </div>
        <h2 className="text-2xl font-black text-gray-900">Connectez-vous pour publier un don</h2>
        <p className="text-sm text-gray-600">
          Rejoignez la communauté Zarazarao pour offrir un objet gratuit, recevoir des remerciements et gagner jusqu'à 1 000 pommes de fidélité !
        </p>
        <button
          onClick={onOpenAuthModal}
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
        >
          Se connecter ou créer un compte
        </button>
      </div>
    );
  }

  // Selected city fokontanys suggestions
  const cityData = MADAGASCAR_CITIES.find(c => c.name.toLowerCase() === city.toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (images.length === 0) {
      setErrorMessage('Veuillez ajouter au moins une photographie réelle de l’objet.');
      return;
    }

    if (!title.trim() || !description.trim() || !fokontany.trim()) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires marqués d’un astérisque.');
      return;
    }

    if (!confirmedTruthful) {
      setErrorMessage('Veuillez confirmer que ces photos représentent réellement l’objet dont vous faites don.');
      return;
    }

    setSubmitting(true);
    try {
      const { donation, reward } = await donationService.createDonation({
        ownerUid: currentUser.uid,
        ownerDisplayName: userProfile?.displayName || currentUser.displayName || 'Donateur',
        ownerPhotoURL: userProfile?.photoURL || currentUser.photoURL || undefined,
        title: title.trim(),
        description: description.trim(),
        category,
        conditionScore,
        imageUrls: images,
        primaryImageUrl: images[primaryIndex] || images[0],
        city,
        fokontany: fokontany.trim(),
        handoverMode,
        specialInstructions: specialInstructions.trim() || undefined
      });

      // Trigger Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      await refreshProfile();
      setSuccessReward({
        donationId: donation.id,
        firstBonus: reward.firstBonus,
        randomReward: reward.randomReward
      });
    } catch (err: any) {
      console.error('Donation publish error:', err);
      setErrorMessage(err?.message || 'Erreur lors de la publication du don.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title & Philosophy */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Générosité citoyenne
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
          Publier un don gratuit
        </h1>
        <p className="text-sm text-gray-600">
          Un objet dont vous ne vous servez plus peut apporter beaucoup de bonheur à une autre famille malgache.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8">
        
        {/* Step 1: Photos (up to 20 images) */}
        <div className="space-y-4">
          <PhotoUploadGallery
            images={images}
            primaryIndex={primaryIndex}
            onChange={(newImgs, newPrimary) => {
              setImages(newImgs);
              setPrimaryIndex(newPrimary);
            }}
            maxImages={20}
          />
        </div>

        {/* Step 2: Title and Category */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 border-t border-gray-100">
          
          <div className="md:col-span-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Titre du don <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Table basse en bois, Veste enfant 6 ans, Manuels de Français..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Step 3: Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Description détaillée <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez l'objet : dimensions, couleur, marque, fonctionnement, petits défauts éventuels. Plus votre description est honnête et précise, plus la remise sera rapide."
            className="w-full p-4 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden leading-relaxed"
          />
        </div>

        {/* Step 4: Condition Score 0-10 */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex justify-between items-center text-xs font-bold text-gray-800">
            <span>État de l'objet sur une échelle de 0 à 10 :</span>
            <span className="text-base text-emerald-800 font-black px-3 py-0.5 rounded-lg bg-emerald-100">
              {conditionScore} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={conditionScore}
            onChange={(e) => setConditionScore(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-700 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>1 - À bricoler / restaurer</span>
            <span>5 - Bon état d'usage</span>
            <span>10 - État neuf ou jamais servi</span>
          </div>
        </div>

        {/* Step 5: Location & Handover */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-gray-100">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Ville <span className="text-red-500">*</span>
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              {MADAGASCAR_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.region})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Fokontany / Quartier de remise <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm">
                Adresse privée protégée
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={fokontany}
                onChange={(e) => setFokontany(e.target.value)}
                placeholder="Sélectionnez ci-dessous ou saisissez votre fokontany (ex: Analakely, Bazar Be)..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                list="fokontany-suggestions"
              />
              {cityData && (
                <datalist id="fokontany-suggestions">
                  {cityData.fokontanys.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              )}
            </div>

            {/* Quick Fokontany Selection Chips for the chosen city */}
            {cityData && cityData.fokontanys.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-semibold">
                  Fokontanys fréquents à {cityData.name} :
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {cityData.fokontanys.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFokontany(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        fokontany === f
                          ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[11px] text-gray-500 italic">
              Conformément à nos règles de sécurité, le numéro de rue ou l’adresse exacte ne sont jamais divulgués. Le lieu précis de rendez-vous sera convenu par messagerie privée avec le bénéficiaire retenu.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Mode de remise <span className="text-red-500">*</span>
            </label>
            <select
              value={handoverMode}
              onChange={(e) => setHandoverMode(e.target.value as HandoverMode)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="pickup">À récupérer par le bénéficiaire</option>
              <option value="delivery">Livraison possible</option>
              <option value="discuss">À discuter avec le donateur</option>
            </select>
          </div>

        </div>

        {/* Step 6: Special Instructions (optional) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Précisions particulières (facultatif)
          </label>
          <input
            type="text"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Ex: Objet lourd, prévoir 2 personnes • Disponible uniquement le samedi matin • Sac fourni"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Step 7: Truthfulness confirmation */}
        <div className="pt-2">
          <label className="flex items-start gap-3 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl cursor-pointer">
            <input
              type="checkbox"
              required
              checked={confirmedTruthful}
              onChange={(e) => setConfirmedTruthful(e.target.checked)}
              className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4"
            />
            <span className="text-xs text-emerald-950 font-medium leading-relaxed">
              Je certifie sur l'honneur que ces photographies représentent réellement l'objet proposé, que ce don est <strong>100% gratuit</strong> sans aucune contrepartie financière, et que l'objet est conforme aux règles de la communauté Zarazarao.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Publier mon don & tenter de gagner jusqu'à 1 000 pommes</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Success Reward Celebration Modal */}
      {successReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl border border-amber-200 relative overflow-hidden">
            
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-4xl shadow-inner animate-bounce">
              🍎
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-800">
                Félicitations pour votre générosité !
              </span>
              <h2 className="text-2xl font-black text-gray-900">
                Don publié avec succès !
              </h2>
              <p className="text-xs text-gray-600">
                Votre annonce est désormais visible par tous les habitants de Madagascar.
              </p>
            </div>

            {/* Apple Rewards Won */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="text-xs text-amber-800 font-semibold">Récompenses de fidélité créditées :</div>
              
              <div className="text-2xl font-black text-emerald-950 flex items-center justify-center gap-2">
                <span>+{successReward.randomReward} Pommes</span>
                <span className="text-sm font-bold text-amber-700">(Tirage aléatoire)</span>
              </div>

              {successReward.firstBonus && (
                <div className="text-xs font-bold text-emerald-800 pt-1 border-t border-amber-200/60">
                  + 50 Pommes supplémentaires (Bonus 1ère publication validée !)
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-500">
              Rappel : 1 000 pommes équivalent à 1 000 Ar en bon d'achat utilisable chez nos enseignes partenaires.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('donation-detail', { id: successReward.donationId })}
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Voir mon annonce
              </button>
              <button
                onClick={() => onNavigate('dashboard', { tab: 'apples' })}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Mon solde fidélité
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
