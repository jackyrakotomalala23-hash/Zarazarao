import { CategoryInfo, Partner } from '@/types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'vetements',
    name: 'Vêtements et chaussures',
    iconName: 'Shirt',
    description: 'Pantalons, robes, vestes, t-shirts, chaussures adultes et enfants'
  },
  {
    id: 'mobilier',
    name: 'Mobilier',
    iconName: 'Armchair',
    description: 'Tables, chaises, armoires, lits, canapés et rangements'
  },
  {
    id: 'electromenager',
    name: 'Électroménager',
    iconName: 'Tv',
    description: 'Réfrigérateurs, cuisinières, fers à repasser, ventilateurs, machines à laver'
  },
  {
    id: 'informatique',
    name: 'Informatique et téléphonie',
    iconName: 'Smartphone',
    description: 'Smartphones, téléphones, ordinateurs portables, écrans, câbles, accessoires'
  },
  {
    id: 'livres',
    name: 'Livres et fournitures',
    iconName: 'BookOpen',
    description: 'Manuels scolaires, romans, cahiers, dictionnaires, fournitures de bureau'
  },
  {
    id: 'jouets',
    name: 'Jouets et jeux',
    iconName: 'Gamepad2',
    description: 'Jeux de société, peluches, figurines, puzzles, jouets éducatifs'
  },
  {
    id: 'bebes',
    name: 'Articles pour bébés',
    iconName: 'Baby',
    description: 'Poussettes, vêtements nourrissons, biberons, berceaux, sièges auto'
  },
  {
    id: 'cuisine',
    name: 'Cuisine et maison',
    iconName: 'Utensils',
    description: 'Vaisselle, marmites, casseroles, ustensiles, petits robots, linge de maison'
  },
  {
    id: 'decoration',
    name: 'Décoration',
    iconName: 'Sparkles',
    description: 'Tableaux, miroirs, luminaires, rideaux, vases, artisanat'
  },
  {
    id: 'sport',
    name: 'Sport et loisirs',
    iconName: 'Bike',
    description: 'Vélos, ballons, matériel de fitness, instruments de musique, tentes'
  },
  {
    id: 'bricolage',
    name: 'Matériaux et bricolage',
    iconName: 'Hammer',
    description: 'Outils à main, perceuses, restes de peinture, vis, planches, quincaillerie'
  },
  {
    id: 'jardinage',
    name: 'Jardinage',
    iconName: 'Sprout',
    description: 'Pots de fleurs, plantes, graines, outils de jardin, arrosoirs'
  },
  {
    id: 'accessoires',
    name: 'Accessoires',
    iconName: 'ShoppingBag',
    description: 'Sacs, valises, montres, ceintures, bijoux fantaisie, parapluies'
  },
  {
    id: 'autres',
    name: 'Autres',
    iconName: 'Package',
    description: 'Tous les autres objets utiles qui méritent une seconde vie'
  }
];

export const MADAGASCAR_CITIES = [
  { name: 'Antananarivo', region: 'Analamanga', fokontanys: ['Analakely', 'Ankorondrano', 'Isoraka', 'Mahamasina', 'Andohalo', 'Ambohimanarina', 'Ankatso', 'Tanjombato', 'Itaosy', 'Sabotsy Namehana'] },
  { name: 'Toamasina', region: 'Atsinanana', fokontanys: ['Bazar Be', 'Mangarivotra', 'Tanambao V', 'Salazamay', 'Ankirihiry'] },
  { name: 'Antsirabe', region: 'Vakinankaratra', fokontanys: ['Vichy', 'Mahazoarivo', 'Antsenakely', 'Ambilankely'] },
  { name: 'Mahajanga', region: 'Boeny', fokontanys: ['Majunga Be', 'Manga', 'Tsaramandroso', 'Aranta'] },
  { name: 'Fianarantsoa', region: 'Haute Matsiatra', fokontanys: ['Ambalapaiso', 'Ampitakely', 'Tsianolondroa', 'Kianjasoa'] },
  { name: 'Toliara', region: 'Atsimo-Andrefana', fokontanys: ['Besakoa', 'Sanfily', 'Tsimenatse', 'Anketa'] },
  { name: 'Antsiranana (Diego)', region: 'Diana', fokontanys: ['Scama', 'Grand Pavois', 'Ambalavola', 'Morafeno'] },
  { name: 'Moramanga', region: 'Alaotra-Mangoro', fokontanys: ['Camp des Mariés', 'Moramanga Ville'] },
  { name: 'Sambava', region: 'Sava', fokontanys: ['Sambava Centre', 'Antaimby'] },
  { name: 'Taolagnaro (Fort-Dauphin)', region: 'Anosy', fokontanys: ['Bazar Be', 'Tanambao', 'Ampasikabo'] }
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'partner-score-tana',
    name: 'Supermarché Score & Jumbo Score Madagascar',
    logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=160&q=80',
    city: 'Antananarivo',
    address: 'Centre Commercial La City Ivandry & Ankorondrano',
    phone: '+261 20 22 200 01',
    status: 'ACTIF',
    terms: 'Valable sur l’ensemble du rayon alimentation et produits ménagers. Non remboursable en espèces. Seuil minimum 10 000 Ar.',
    minCouponValueAr: 10000,
    createdAt: new Date().toISOString()
  },
  {
    id: 'partner-supermaki',
    name: 'Supermaki Proximité',
    logoUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=160&q=80',
    city: 'Antananarivo & Provinces',
    address: 'Réseau national de supérettes de quartier',
    phone: '+261 20 22 305 12',
    status: 'ACTIF',
    terms: 'Applicable en caisse sur présentation du coupon 8 chiffres et code-barres Zarazarao.',
    minCouponValueAr: 10000,
    createdAt: new Date().toISOString()
  },
  {
    id: 'partner-librairie-mixte',
    name: 'Librairie & Papeterie Solidaire de Tana',
    logoUrl: 'https://images.unsplash.com/photo-1507842229452-9b2f6ef8540c?auto=format&fit=crop&w=160&q=80',
    city: 'Antananarivo',
    address: 'Avenue de l’Indépendance, Analakely',
    phone: '+261 20 22 225 50',
    status: 'ACTIF',
    terms: 'Valable sur tous les livres scolaires, romans, fournitures et papeterie.',
    minCouponValueAr: 10000,
    createdAt: new Date().toISOString()
  },
  {
    id: 'partner-bricotech-mada',
    name: 'BricoTech Quincaillerie & Matériaux',
    logoUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=160&q=80',
    city: 'Toamasina',
    address: 'Boulevard Joffre, Tamatave',
    phone: '+261 20 53 320 80',
    status: 'ACTIF',
    terms: 'Valable sur l’outillage, les peintures et le matériel d’entretien.',
    minCouponValueAr: 10000,
    createdAt: new Date().toISOString()
  }
];
