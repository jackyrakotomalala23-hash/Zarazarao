import { collection, doc, getDocs, setDoc, limit, query } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Donation } from '@/types';
import { partnerService } from './partnerService';

export const SEED_DONATIONS: Omit<Donation, 'id' | 'viewsCount' | 'uniqueInterestsCount' | 'conversationsCount' | 'createdAt'>[] = [
  // --- 1. Mobilier Antananarivo ---
  {
    ownerUid: 'donor_mialy_tana',
    ownerDisplayName: 'Mialy Rakotoarisoa',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    title: 'Grande table en palissandre massif et 4 chaises artisanales',
    description: 'Suite à un déménagement, je donne une magnifique table à manger en bois noble de palissandre ciré avec ses 4 chaises robustes sculptées à la main. Très bon état général, bois sain et traité. Quelques micro-rayures d’usage sur le plateau qui disparaîtront avec un coup de cire. À récupérer sur place à Ankorondrano.',
    category: 'Mobilier',
    conditionScore: 9,
    imageUrls: [
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
    city: 'Antananarivo',
    fokontany: 'Ankorondrano',
    handoverMode: 'pickup',
    specialInstructions: 'Meuble lourd, prévoir un véhicule adapté (pickup ou camionnette) et 2 personnes pour le portage.',
    status: 'DISPONIBLE'
  },
  // --- 2. Informatique Toamasina ---
  {
    ownerUid: 'donor_andry_tamatave',
    ownerDisplayName: 'Andry Randriamanantena',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    title: 'Ordinateur portable HP 15 pouces révisé pour lycéen ou étudiant',
    description: 'PC portable HP écran HD 15.6 pouces, processeur Intel Core i3, 8 Go de mémoire vive et disque SSD 256 Go très rapide. La batterie tient environ 2 heures d’autonomie. Parfait pour les devoirs scolaires, la bureautique LibreOffice, la recherche sur le web et les cours à distance. Vendu avec son chargeur d’origine.',
    category: 'Informatique et téléphonie',
    conditionScore: 8,
    imageUrls: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    city: 'Toamasina',
    fokontany: 'Bazar Be',
    handoverMode: 'pickup',
    specialInstructions: 'Je privilégie un étudiant ou un lycéen méritant qui en a besoin pour ses examens officiels.',
    status: 'DISPONIBLE'
  },
  // --- 3. Livres Antsirabe ---
  {
    ownerUid: 'donor_soa_antsirabe',
    ownerDisplayName: 'Soa Raharisoa',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    title: 'Lot complet manuels scolaires Terminale et Première (S & L) avec annales',
    description: 'Ensemble de manuels scolaires conformes au programme : Mathématiques, Sciences Physiques-Chimie, SVT, Philosophie, Français et Anglais. Tous les tomes sont complets, pages intactes, avec fascicules de sujets et corrigés du Baccalauréat malgache des 5 dernières années.',
    category: 'Livres et fournitures',
    conditionScore: 10,
    imageUrls: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    city: 'Antsirabe',
    fokontany: 'Mahazoarivo',
    handoverMode: 'pickup',
    specialInstructions: 'Remise possible près de la gare ou au carrefour Antsenakely en fin d’après-midi.',
    status: 'DISPONIBLE'
  },
  // --- 4. Articles Bébés Mahajanga ---
  {
    ownerUid: 'donor_faly_majunga',
    ownerDisplayName: 'Faly Rajaonarivelo',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    title: 'Poussette combinée tout-terrain et lit parapluie voyage pliable',
    description: 'Poussette robuste avec capote pare-soleil réglable, harnais de sécurité 5 points et grand panier inférieur. Fournie avec un lit pliable de voyage compact pour bébé de 0 à 3 ans avec son sac de transport. Matériel entièrement déhoussé et lavé à chaud, prêt pour une jeune maman.',
    category: 'Articles pour bébés',
    conditionScore: 8,
    imageUrls: [
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    city: 'Mahajanga',
    fokontany: 'Majunga Be',
    handoverMode: 'discuss',
    specialInstructions: 'Possibilité de déposer devant le grand Baobab ou la Mairie si vous êtes à pied.',
    status: 'DISPONIBLE'
  },
  // --- 5. Électroménager Antananarivo ---
  {
    ownerUid: 'donor_hasina_tana',
    ownerDisplayName: 'Hasina Andrianaivo',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    title: 'Machine à coudre mécanique traditionnelle Singer avec meuble en fonte',
    description: 'Véritable machine à coudre mécanique avec pédale en fonte fonctionnant à merveille sans électricité ! Idéale pour couturière indépendante ou retouches à la maison. Mécanisme entièrement huilé, aiguilles de rechange et canettes fournies.',
    category: 'Électroménager',
    conditionScore: 9,
    imageUrls: [
      'https://images.unsplash.com/photo-1528458876885-5b6eeb83d3d1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1528458876885-5b6eeb83d3d1?auto=format&fit=crop&w=800&q=80',
    city: 'Antananarivo',
    fokontany: 'Mahamasina',
    handoverMode: 'pickup',
    specialInstructions: 'Remise à Mahamasina près du stade. Objet en fonte assez lourd.',
    status: 'DISPONIBLE'
  },
  // --- 6. Sport Fianarantsoa ---
  {
    ownerUid: 'donor_nirina_fianar',
    ownerDisplayName: 'Nirina Rabe',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    title: 'Vélo VTT 26 pouces cadre aluminium 18 vitesses avec pompe et antivol',
    description: 'VTT tout terrain équipé de pneus récents anti-crevaison, freins V-brake neufs et dérailleur Shimano 18 vitesses. Selle rembourrée confortable, garde-boues avant et arrière. Idéal pour circuler dans les montées de Fianarantsoa.',
    category: 'Sport et loisirs',
    conditionScore: 8,
    imageUrls: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    city: 'Fianarantsoa',
    fokontany: 'Ampitakely',
    handoverMode: 'pickup',
    specialInstructions: 'Remise directe en mains propres près de la gare FCE.',
    status: 'DISPONIBLE'
  },
  // --- 7. Vêtements Antananarivo ---
  {
    ownerUid: 'donor_voahirana_tana',
    ownerDisplayName: 'Voahirana Razafy',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    title: 'Lot de vêtements d’hiver et pulls chauds en laine pour enfants (6-10 ans)',
    description: 'Grand carton contenant 14 pièces propres et lavées : 4 pulls en laine tricotés, 2 anoraks chauds à capuche, 5 pantalons en velours et 3 gilets polaires. Idéal pour les hivers froids sur les hautes terres d’Antananarivo.',
    category: 'Vêtements et chaussures',
    conditionScore: 9,
    imageUrls: [
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    city: 'Antananarivo',
    fokontany: 'Analakely',
    handoverMode: 'pickup',
    specialInstructions: 'Rendez-vous possible sur l’esplanade d’Analakely vers 12h ou 17h.',
    status: 'DISPONIBLE'
  },
  // --- 8. Cuisine Toamasina ---
  {
    ownerUid: 'donor_tahina_tamatave',
    ownerDisplayName: 'Tahina Ranaivo',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    title: 'Batterie de cuisine complète en inox et marmite à riz malgache',
    description: 'Ensemble de 4 casseroles avec couvercles en verre trempé, 2 poêles antiadhésives et une marmite traditionnelle robuste en fonte d’aluminium. Idéal pour jeune couple ou famille s’installant.',
    category: 'Cuisine et maison',
    conditionScore: 8,
    imageUrls: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    city: 'Toamasina',
    fokontany: 'Salazamay',
    handoverMode: 'pickup',
    specialInstructions: 'À récupérer sur Salazamay, prévoir un cabas ou un sac résistant.',
    status: 'DISPONIBLE'
  },
  // --- 9. Bricolage Antananarivo ---
  {
    ownerUid: 'donor_lanto_tana',
    ownerDisplayName: 'Lanto Ramanantoanina',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    title: 'Caisse à outils de menuiserie complète : scies, rabot, marteaux et serre-joints',
    description: 'Je donne ma boîte à outils en métal comprenant une scie égoïne, un rabot manuel, deux marteaux de coffreur, des tournevis isolés, des tenailles, un niveau à bulle et une boîte de vis et chevilles diverses. Matériel de bonne qualité.',
    category: 'Matériaux et bricolage',
    conditionScore: 9,
    imageUrls: [
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
    city: 'Antananarivo',
    fokontany: 'Tanjombato',
    handoverMode: 'pickup',
    specialInstructions: 'À venir chercher près du pont de Tanjombato en journée.',
    status: 'DISPONIBLE'
  },
  // --- 10. Jouets & Jeux Antsirabe ---
  {
    ownerUid: 'donor_hanitra_antsirabe',
    ownerDisplayName: 'Hanitra Rakotoniaina',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    title: 'Grand coffre de briques de construction Lego et jeux de société familiaux',
    description: 'Plus de 400 pièces de briques compatibles avec plaques de base, plus 3 jeux complets (Scrabble en français, Monopoly et jeu de dames en bois). Mes enfants ont grandi et souhaitent faire le bonheur d’autres enfants.',
    category: 'Jouets et jeux',
    conditionScore: 9,
    imageUrls: [
      'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618842676087-c1d4715f1f9e?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80',
    city: 'Antsirabe',
    fokontany: 'Antsenakely',
    handoverMode: 'pickup',
    specialInstructions: 'À donner en priorité à un foyer, orphelinat ou famille nombreuse.',
    status: 'DISPONIBLE'
  },
  // --- 11. Jardinage Antananarivo ---
  {
    ownerUid: 'donor_faniry_itaosy',
    ownerDisplayName: 'Faniry Randrianasolo',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    title: 'Lots de pots en terre cuite artisanale malgache et boutures de plantes d’intérieur',
    description: '8 pots en argile cuite de différentes tailles, avec soucoupes étanches, accompagnés de belles boutures de Monstera, Sansevieria et Pothos bien enracinées prêtes à rempoter. Pour verdir votre intérieur !',
    category: 'Jardinage',
    conditionScore: 10,
    imageUrls: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    city: 'Antananarivo',
    fokontany: 'Itaosy',
    handoverMode: 'pickup',
    specialInstructions: 'À récupérer sur la route d’Itaosy le week-end.',
    status: 'DISPONIBLE'
  },
  // --- 12. Décoration Mahajanga ---
  {
    ownerUid: 'donor_arivony_majunga',
    ownerDisplayName: 'Arivony Razanajatovo',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    title: 'Tableau artisanal en marqueterie de bois précieux de Madagascar (Scène de vie)',
    description: 'Superbe tableau encadré mesurant 60x40 cm, réalisé entièrement en marqueterie fine malgache représentant les rizières et les zébus. Bois de rose, palissandre et ébène. Travail d’artisan d’art remarquable.',
    category: 'Décoration',
    conditionScore: 10,
    imageUrls: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    city: 'Mahajanga',
    fokontany: 'Tsaramandroso',
    handoverMode: 'discuss',
    specialInstructions: 'Objet délicat avec verre, remise en main propre recommandée.',
    status: 'DISPONIBLE'
  },
  // --- 13. Informatique Antananarivo ---
  {
    ownerUid: 'donor_haja_isoraka',
    ownerDisplayName: 'Haja Andriamihaja',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    title: 'Écran d’ordinateur Dell 24 pouces Full HD avec câbles HDMI et alimentation',
    description: 'Moniteur informatique IPS 24 pouces (1920x1080), pied inclinable et réglable en hauteur. Très belle colorimétrie, idéal pour télétravail, bureautique ou programmation. Zéro pixel mort. Câble HDMI et câble secteur inclus.',
    category: 'Informatique et téléphonie',
    conditionScore: 9,
    imageUrls: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    city: 'Antananarivo',
    fokontany: 'Isoraka',
    handoverMode: 'pickup',
    specialInstructions: 'Remise possible à Isoraka en face de l’Hôtel Colbert entre 12h et 14h.',
    status: 'DISPONIBLE'
  },
  // --- 14. Accessoires Toliara ---
  {
    ownerUid: 'donor_tovo_toliara',
    ownerDisplayName: 'Tovo Rakotobe',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    title: 'Grande valise rigide de voyage à 4 roulettes pivotantes avec cadenas TSA',
    description: 'Valise grand format (75 cm) en polycarbonate ultra résistant, coloris bleu nuit. Fermeture éclair sécurisée, 4 roulettes multidirectionnelles silencieuses. Très propre à l’intérieur avec sangles et séparateur zippé.',
    category: 'Accessoires',
    conditionScore: 8,
    imageUrls: [
      'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=800&q=80',
    city: 'Toliara',
    fokontany: 'Besakoa',
    handoverMode: 'pickup',
    specialInstructions: 'Remise en mains propres à Besakoa Toliara.',
    status: 'DISPONIBLE'
  },
  // --- 15. Électroménager Antsirabe ---
  {
    ownerUid: 'donor_onja_antsirabe',
    ownerDisplayName: 'Onja Rabarijaona',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    title: 'Fer à repasser à vapeur Calor et sa table à repasser pliable avec housse neuve',
    description: 'Fer à vapeur 2000W avec semelle céramique anti-calcaire, défroissage vertical. Vendu avec une table à repasser réglable en hauteur munie d’un repose-fer sécurisé et d’une housse molletonnée neuve.',
    category: 'Électroménager',
    conditionScore: 9,
    imageUrls: [
      'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'
    ],
    primaryImageUrl: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80',
    city: 'Antsirabe',
    fokontany: 'Vichy',
    handoverMode: 'pickup',
    specialInstructions: 'À récupérer près du parc de l’Hôtel des Thermes.',
    status: 'DISPONIBLE'
  }
];

export async function checkAndSeedInitialData(): Promise<boolean> {
  try {
    const q = query(collection(db, 'donations'), limit(1));
    const snap = await getDocs(q);

    // Initialize partner stores
    await partnerService.getPartners();

    if (snap.empty) {
      console.log('🌱 Seeding initial Zarazarao Madagascar donations...');
      for (const item of SEED_DONATIONS) {
        const id = `don-seed-${Math.random().toString(36).substring(2, 9)}`;
        const donation: Donation = {
          ...item,
          id,
          viewsCount: Math.floor(Math.random() * 65) + 12,
          uniqueInterestsCount: Math.floor(Math.random() * 18) + 3,
          conversationsCount: Math.floor(Math.random() * 5),
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)).toISOString()
        };
        await setDoc(doc(db, 'donations', id), donation);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Seed operation error:', error);
    return false;
  }
}

export async function forceSeedMoreSampleDonations(): Promise<number> {
  try {
    let count = 0;
    for (const item of SEED_DONATIONS) {
      const id = `don-seed-${Math.random().toString(36).substring(2, 9)}`;
      const donation: Donation = {
        ...item,
        id,
        viewsCount: Math.floor(Math.random() * 85) + 15,
        uniqueInterestsCount: Math.floor(Math.random() * 25) + 4,
        conversationsCount: Math.floor(Math.random() * 6),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 4 * 86400000)).toISOString()
      };
      await setDoc(doc(db, 'donations', id), donation);
      count++;
    }
    return count;
  } catch (error) {
    console.error('Force seed failed:', error);
    throw error;
  }
}
