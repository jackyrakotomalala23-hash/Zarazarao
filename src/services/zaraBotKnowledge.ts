export interface KnowledgeItem {
  id: string;
  category: string;
  question: string;
  keywords: string[];
  answer: string;
}

export const ZARABOT_KNOWLEDGE_BASE: KnowledgeItem[] = [
  // --- 1. Principes fondamentaux & Gratuité ---
  {
    id: 'gratuit-1',
    category: 'Principes fondamentaux',
    question: "Est-ce que tout est vraiment gratuit sur Zarazarao ?",
    keywords: ['gratuit', 'payant', 'payer', 'prix', 'argent', 'cout', 'frais'],
    answer: "Oui, absolument 100% gratuit ! Sur Zarazarao, chaque don publié est offert sans aucune contrepartie financière. Aucun membre ne peut réclamer d'argent, de frais de dossier ou de compensation. Donner et recevoir sont des actes de pure solidarité guidés par le Fihavanana malgache."
  },
  {
    id: 'gratuit-2',
    category: 'Principes fondamentaux',
    question: "Puis-je vendre un objet sur Zarazarao ?",
    keywords: ['vendre', 'vente', 'monnayer', 'commerce', 'boutique', 'prix'],
    answer: "Non, formellement interdit. Zarazarao est une plateforme de dons et de réemploi solidaire. Toute tentative de vente, d'enchère ou d'exigence de paiement entraîne la suspension immédiate du compte et la suppression de l'annonce par nos modérateurs."
  },
  {
    id: 'gratuit-3',
    category: 'Principes fondamentaux',
    question: "Quelle est la devise et la philosophie de Zarazarao ?",
    keywords: ['philosophie', 'devise', 'mission', 'signification', 'zarazarao', 'fihavanana'],
    answer: "Notre devise est : « Un objet dont tu n'as plus besoin peut changer la vie de quelqu'un. Partageons plus, gaspillons moins, aidons-nous davantage. » En malgache, « Zarazarao » signifie « partagez » ou « distribuez », incarnant le Fihavanana et l'entraide communautaire."
  },
  {
    id: 'gratuit-4',
    category: 'Principes fondamentaux',
    question: "Puis-je demander de l'argent pour la livraison ?",
    keywords: ['frais de livraison', 'livraison payante', 'frais de transport', 'frais'],
    answer: "Non. Si le mode de remise choisi est 'Livraison possible', le donateur l'assure bénévolement ou s'accorde avec le bénéficiaire lors d'une rencontre en lieu public. Aucun paiement direct ne doit transiter entre utilisateurs via la plateforme."
  },

  // --- 2. Géographie, Villes & Fokontanys ---
  {
    id: 'geo-1',
    category: 'Fokontanys & Villes',
    question: "Quelles sont les villes couvertes par Zarazarao à Madagascar ?",
    keywords: ['villes', 'couvertes', 'regions', 'provinces', 'ou disponible', 'carte'],
    answer: "Zarazarao couvre l'ensemble des 23 régions de Madagascar, avec une forte activité à Antananarivo, Toamasina (Tamatave), Antsirabe, Mahajanga (Majunga), Fianarantsoa, Toliara, Antsiranana (Diego-Suarez), Moramanga, Sambava et Taolagnaro (Fort-Dauphin)."
  },
  {
    id: 'geo-2',
    category: 'Fokontanys & Villes',
    question: "Qu'est-ce qu'un fokontany et pourquoi est-il demandé ?",
    keywords: ['fokontany', 'quartier', 'secteur', 'pourquoi fokontany', 'localisation'],
    answer: "Le fokontany est la subdivision administrative de base à Madagascar (le quartier). Il permet aux bénéficiaires de trouver des dons à proximité immédiate de chez eux sans dévoiler l'adresse exacte du domicile pour préserver la vie privée."
  },
  {
    id: 'geo-3',
    category: 'Fokontanys & Villes',
    question: "Quels sont les principaux fokontanys d'Antananarivo ?",
    keywords: ['fokontany tana', 'quartiers antananarivo', 'analakely', 'ankorondrano', 'mahamasina', 'isoraka', 'itaosy', 'tanjombato'],
    answer: "À Antananarivo, vous pouvez filtrer vos recherches par fokontanys tels que : Analakely, Ankorondrano, Isoraka, Mahamasina, Andohalo, Ambohimanarina, Ankatso, Tanjombato, Itaosy, Sabotsy Namehana, et bien d'autres !"
  },
  {
    id: 'geo-4',
    category: 'Fokontanys & Villes',
    question: "Quels sont les fokontanys de Toamasina (Tamatave) ?",
    keywords: ['toamasina', 'tamatave', 'bazar be', 'salazamay', 'mangarivotra', 'tanambao'],
    answer: "À Toamasina, les principaux quartiers actifs sont : Bazar Be, Mangarivotra, Tanambao V, Salazamay, Ankirihiry et Boulevard Joffre."
  },
  {
    id: 'geo-5',
    category: 'Fokontanys & Villes',
    question: "Quels sont les fokontanys d'Antsirabe ?",
    keywords: ['antsirabe', 'vakinankaratra', 'mahazoarivo', 'antsenakely', 'vichy'],
    answer: "À Antsirabe, retrouvez des dons dans les fokontanys de Mahazoarivo, Antsenakely, Ambilankely et le secteur de l'Hôtel des Thermes / Vichy."
  },
  {
    id: 'geo-6',
    category: 'Fokontanys & Villes',
    question: "Comment filtrer les annonces par fokontany ?",
    keywords: ['filtrer fokontany', 'chercher par quartier', 'recherche fokontany'],
    answer: "Dans la page 'Explorer les dons' ou sur la 'Carte du Partage', sélectionnez d'abord votre ville (ex. Antananarivo), puis utilisez le menu déroulant 'Fokontany' pour n'afficher que les objets proposés dans votre quartier !"
  },
  {
    id: 'geo-7',
    category: 'Fokontanys & Villes',
    question: "Mon adresse exacte est-elle publiée sur le site ?",
    keywords: ['adresse', 'privee', 'domicile', 'geolocalisation', 'confidentialite', 'rue'],
    answer: "Jamais ! Pour des raisons strictes de sécurité et de respect de la vie privée, seule votre ville et votre fokontany apparaissent publiquement. Le lieu exact de rendez-vous est convenu de façon sécurisée via la messagerie privée entre vous et la personne choisie."
  },

  // --- 3. L'Esprit du Don & Fihavanana ---
  {
    id: 'fihavanana-1',
    category: 'Esprit de Partage & Fihavanana',
    question: "Pourquoi donner gratuitement sur Zarazarao ?",
    keywords: ['pourquoi donner', 'esprit de partage', 'fihavanana', 'interet', 'motivation'],
    answer: "Sur Zarazarao, donner est un geste pur de bienveillance et de citoyenneté. En offrant un objet que vous n'utilisez plus, vous désencombrez votre intérieur, faites le bonheur direct d'un voisin ou d'une famille malgache, et vous participez à bâtir un Madagascar solidaire."
  },
  {
    id: 'fihavanana-2',
    category: 'Esprit de Partage & Fihavanana',
    question: "Que signifie le Fihavanana dans le cadre de Zarazarao ?",
    keywords: ['fihavanana', 'valeur', 'culture', 'malagasy', 'entraide'],
    answer: "Le Fihavanana est la valeur fondamentale d'amitié, de parenté sociale et de solidarité mutuelle à Madagascar. Sur Zarazarao, chaque don renforce ce lien humain : donner avec générosité, recevoir avec gratitude, et se respecter mutuellement."
  },
  {
    id: 'fihavanana-3',
    category: 'Esprit de Partage & Fihavanana',
    question: "Comment remercier un donateur après la remise ?",
    keywords: ['remercier', 'avis', 'remerciement', 'apres remise', 'gratitude'],
    answer: "Un simple « Misaotra betsaka » chaleureux lors de la remise en main propre et un mot gentil dans la messagerie font toute la différence ! Vous confirmez ensuite la réception de l'objet sur la plateforme pour clore le don en beauté."
  },

  // --- 4. Réemploi, Écologie & Bonnes Pratiques ---
  {
    id: 'ecologie-1',
    category: 'Réemploi & Écologie',
    question: "Comment Zarazarao aide-t-il à protéger l'environnement à Madagascar ?",
    keywords: ['ecologie', 'environnement', 'dechets', 'anti gaspillage', 'seconde vie', 'reemploi'],
    answer: "Donner un objet au lieu de le jeter évite qu'il ne finisse dans les décharges ou dans la nature. Cela prolonge sa durée de vie, diminue la production de déchets et encourage une économie circulaire locale responsable à Madagascar."
  },
  {
    id: 'ecologie-2',
    category: 'Réemploi & Écologie',
    question: "Puis-je donner des objets qui ont des défauts d'usure ?",
    keywords: ['usure', 'defauts', 'etat', 'abime', 'occasion'],
    answer: "Oui, tant que l'objet reste fonctionnel ou réparable, et que vous décrivez honnêtement son état avec des photos réelles. Un vêtement un peu usé ou un meuble à repeindre peut être très utile pour quelqu'un d'autre !"
  },
  {
    id: 'ecologie-3',
    category: 'Réemploi & Écologie',
    question: "Combien de dons puis-je publier sur Zarazarao ?",
    keywords: ['limite de don', 'combien de dons', 'quota', 'nombre de publications'],
    answer: "Il n'y a aucune limite ! Vous pouvez publier autant de dons que vous le désirez : vêtements, livres, meubles, ustensiles de cuisine, matériel scolaire ou électronique. Chaque don compte pour la communauté."
  },

  // --- 5. Réservations & Récupération ---
  {
    id: 'resa-1',
    category: 'Réservations & Récupération',
    question: "Comment réserver un don qui m'intéresse ?",
    keywords: ['reserver', 'comment reserver', 'recuperer un don', 'demander un don'],
    answer: "Pour demander un don : 1. Cliquez sur 'Discuter avec le donateur' depuis l'annonce. 2. Échangez courtoisement par message pour convenir d'une rencontre. 3. Le donateur clique sur 'Réserver ce don pour ce bénéficiaire'. 4. L'annonce passe en statut Réservé."
  },
  {
    id: 'resa-2',
    category: 'Réservations & Récupération',
    question: "Qui doit confirmer la réception du don ?",
    keywords: ['confirmer reception', 'bouton reception', 'jai recu le don', 'qui confirme'],
    answer: "C'est obligatoirement le bénéficiaire ! Dès que vous avez physiquement récupéré l'objet, ouvrez votre conversation sur Zarazarao et cliquez sur 'Oui, j'ai reçu le don'. Le statut passe alors officiellement à 'RECUPÉRÉ'."
  },
  {
    id: 'resa-3',
    category: 'Réservations & Récupération',
    question: "Que faire si un bénéficiaire ne vient pas au rendez-vous ?",
    keywords: ['ne vient pas', 'absent', 'lapin', 'annuler reservation', 'pas venu'],
    answer: "Si le bénéficiaire ne se présente pas ou ne répond plus, le donateur peut simplement cliquer sur 'Annuler la réservation' dans la conversation. Le don redevient instantanément disponible pour les autres membres de la communauté."
  },
  {
    id: 'resa-4',
    category: 'Réservations & Récupération',
    question: "Peut-on réserver un don pour plusieurs personnes en même temps ?",
    keywords: ['plusieurs personnes', 'double reservation', 'concurrence'],
    answer: "Non. Une réservation est exclusive : le donateur ne peut attribuer l'objet qu'à un seul bénéficiaire à la fois. Cela garantit le respect des engagements et évite les malentendus."
  },

  // --- 6. Sécurité, Rencontres & Objets interdits ---
  {
    id: 'secu-1',
    category: 'Sécurité & Bonnes pratiques',
    question: "Quelles sont les précautions pour la remise en main propre à Madagascar ?",
    keywords: ['securite', 'precautions', 'lieu de rendez-vous', 'rencontre', 'securise'],
    answer: "Nous conseillons vivement de convenir d'un rendez-vous dans un lieu public très fréquenté en plein jour (ex : devant une gare, un centre commercial, une mairie, une grande station-service). Si l'objet est encombrant et nécessite un passage à domicile, faites-vous toujours accompagner."
  },
  {
    id: 'secu-2',
    category: 'Sécurité & Bonnes pratiques',
    question: "Quels sont les objets formellement interdits sur Zarazarao ?",
    keywords: ['objets interdits', 'interdictions', 'medicaments', 'armes', 'dangereux', 'nourriture'],
    answer: "Sont strictement interdits : les médicaments et produits pharmaceutiques sous ordonnance, les armes ou objets dangereux, les produits chimiques toxiques, les contrefaçons, les denrées alimentaires périssables, les animaux vivants, ainsi que tout contenu pour adultes."
  },
  {
    id: 'secu-3',
    category: 'Sécurité & Bonnes pratiques',
    question: "Comment signaler un comportement suspect ou une annonce douteuse ?",
    keywords: ['signaler', 'abus', 'faux don', 'suspect', 'escroquerie', 'arnaque'],
    answer: "Sur chaque annonce ou dans chaque conversation, un bouton 'Signaler' vous permet d'alerter nos modérateurs en indiquant le motif (ex: demande d'argent, comportement irrespectueux, objet non conforme). Notre équipe traite les signalements en priorité."
  },

  // --- 7. Publication d'un don ---
  {
    id: 'pub-1',
    category: 'Publication de dons',
    question: "Comment publier un don sur Zarazarao ?",
    keywords: ['publier un don', 'comment donner', 'mettre une annonce', 'deposer un don'],
    answer: "Cliquez sur le bouton vert 'Donner un objet' en haut de la page. Remplissez le formulaire : titre clair, description complète, catégorie, état de l'objet (0 à 10), ville, fokontany, mode de remise et ajoutez au moins une photo réelle. Validez ensuite pour mettre l'annonce en ligne !"
  },
  {
    id: 'pub-2',
    category: 'Publication de dons',
    question: "Combien de photos peut-on ajouter par annonce ?",
    keywords: ['combien de photos', 'nombre images', 'photos max', 'galerie'],
    answer: "Vous pouvez ajouter jusqu'à 20 photographies réelles par publication pour bien montrer l'objet sous tous ses angles et mettre en valeur son état."
  },
  {
    id: 'pub-3',
    category: 'Publication de dons',
    question: "Que signifie la note d'état de 0 à 10 ?",
    keywords: ['etat de lobjet', 'note', 'echelle', 'score etat'],
    answer: "L'échelle va de 0 (pour pièces ou bricolage) à 10 (neuf ou comme neuf). Par exemple, 8/10 correspond à un objet en très bon état de fonctionnement avec seulement de légères traces d'usage."
  },

  // --- 8. Carte & Google Maps ---
  {
    id: 'map-1',
    category: 'Carte & Géographie',
    question: "Comment fonctionne la Carte du Partage avec Google Maps ?",
    keywords: ['google maps', 'carte', 'cercles de concentration', 'satelitte', 'zoomer'],
    answer: "La Carte du Partage s'appuie sur Google Maps Platform. Elle affiche des cercles de concentration thermique indiquant les zones où les dons sont les plus nombreux (ex: Antananarivo, Tamatave). Vous pouvez basculer entre vue Plan et Satellite, zoomer dans les fokontanys et cliquer sur les marqueurs pour voir les dons !"
  },
  {
    id: 'map-2',
    category: 'Carte & Géographie',
    question: "Que représentent les cercles de concentration sur la carte ?",
    keywords: ['cercles de concentration', 'chaleur', 'densite', 'concentration'],
    answer: "Les cercles de concentration illustrent l'intensité du partage dans chaque zone géographique. Plus le cercle est grand et lumineux, plus le nombre de dons disponibles ou récupérés dans cette ville ou ce fokontany est élevé."
  }
];

/**
 * Normalizes text for search (lowercasing, removing accents and punctuation)
 */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches the ZaraBot knowledge base for the best matching Q&A item
 */
export function findBestKnowledgeMatch(query: string): { item: KnowledgeItem; score: number } | null {
  const normQuery = normalizeSearchText(query);
  if (!normQuery || normQuery.length < 3) return null;

  const queryWords = normQuery.split(' ').filter(w => w.length > 2);
  let bestMatch: KnowledgeItem | null = null;
  let highestScore = 0;

  for (const item of ZARABOT_KNOWLEDGE_BASE) {
    let score = 0;
    const normQuestion = normalizeSearchText(item.question);
    const normAnswer = normalizeSearchText(item.answer);

    // Exact question match
    if (normQuestion.includes(normQuery) || normQuery.includes(normQuestion)) {
      score += 100;
    }

    // Keyword hits
    for (const kw of item.keywords) {
      const normKw = normalizeSearchText(kw);
      if (normQuery.includes(normKw)) {
        score += 35;
      }
    }

    // Individual word matching
    for (const word of queryWords) {
      if (normQuestion.includes(word)) score += 15;
      if (normAnswer.includes(word)) score += 5;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Threshold score for confident match
  if (bestMatch && highestScore >= 35) {
    return { item: bestMatch, score: highestScore };
  }

  return null;
}
