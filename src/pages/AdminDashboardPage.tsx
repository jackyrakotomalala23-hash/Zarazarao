import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Users, 
  Package, 
  Award, 
  Gift, 
  Store, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { donationService } from '@/services/donationService';
import { partnerService } from '@/services/partnerService';
import { checkAndSeedInitialData } from '@/services/seedService';
import { Donation, Partner } from '@/types';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [allDonations, allPartners] = await Promise.all([
        donationService.getDonations({ limitCount: 50 }),
        partnerService.getPartners()
      ]);
      setDonations(allDonations);
      setPartners(allPartners);

      // Audit logs
      try {
        const snap = await getDocs(query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(15)));
        setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.warn('Could not load audit logs:', err);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-red-50 text-red-700 flex items-center justify-center text-3xl">
          🛡️
        </div>
        <h2 className="text-xl font-bold text-gray-900">Accès Administrateur Réservé</h2>
        <p className="text-sm text-gray-500">
          Cette section est strictement réservée à l'équipe de gouvernance et de modération Zarazarao.
        </p>
      </div>
    );
  }

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const seeded = await checkAndSeedInitialData();
      await loadAdminData();
      setSeedMessage(seeded ? 'Données de démarrage et partenaires initialisés avec succès !' : 'La base contient déjà des annonces actives.');
    } catch (err: any) {
      setSeedMessage(`Erreur : ${err?.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (!window.confirm('Voulez-vous supprimer définitivement cette annonce ?')) return;
    try {
      await donationService.deleteDonation(id);
      await loadAdminData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const totalRecovered = donations.filter(d => d.status === 'RECUPERE').length;
  const totalReserved = donations.filter(d => d.status === 'RESERVE').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
            <Shield className="w-3.5 h-3.5 text-purple-700" />
            Administration & Modération Centrale
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mt-1">
            Tableau de Bord Administrateur
          </h1>
          <p className="text-xs text-gray-500">
            Supervisez les annonces, la sécurité communautaire, les partenaires et les flux de fidélité.
          </p>
        </div>

        {/* Demo Seed Button */}
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Initialisation...' : 'Initialiser / Recharger données démo'}</span>
        </button>
      </div>

      {seedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Annonces totales</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{donations.length}</div>
          <div className="text-[11px] text-gray-400 mt-1">Catalogue complet</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Dons récupérés</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{totalRecovered}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {donations.length > 0 ? Math.round((totalRecovered / donations.length) * 100) : 0}% de succès
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Réservations actives</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{totalReserved}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Remises en cours</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Enseignes partenaires</div>
          <div className="text-2xl font-black text-purple-900 mt-1">{partners.length}</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">Réseau d'acceptation</div>
        </div>
      </div>

      {/* Moderation of Donations Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-black text-gray-900">
            Gestion & Modération des Publications
          </h3>
          <span className="text-xs text-gray-400">{donations.length} éléments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px]">
              <tr>
                <th className="p-3">Annonce</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Ville</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Donateur</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="p-3 flex items-center gap-2">
                    <img
                      src={d.primaryImageUrl || d.imageUrls[0]}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <span className="font-bold text-gray-900 truncate max-w-xs">{d.title}</span>
                  </td>
                  <td className="p-3 text-gray-600">{d.category}</td>
                  <td className="p-3 text-gray-600">{d.city}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{d.ownerDisplayName}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteDonation(d.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer la publication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partners List */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-black text-gray-900">
          Points relais et partenaires solidaires de la communauté
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {partners.map((p) => (
            <div key={p.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-2">
              <div className="font-bold text-xs text-gray-900">{p.name}</div>
              <div className="text-[11px] text-gray-500">{p.city} • {p.phone}</div>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Partenaire actif
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
