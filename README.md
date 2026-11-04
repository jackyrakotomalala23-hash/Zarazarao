# ZARAZARAO - Plateforme Communautaire de Dons Gratuits à Madagascar & Afrique

> « Un objet dont tu n'as plus besoin peut changer la vie de quelqu'un. »  
> *Partageons plus. Gaspillons moins. Aidons-nous davantage.*

---

## 1. Présentation et Philosophie
**Zarazarao** est une plateforme communautaire de dons gratuits entre particuliers adaptée aux réalités, à la connectivité et à la culture du partage (*Fihavanana* et *Firaisankina*) de Madagascar, conçue avec une architecture modulaire et évolutive vers d'autres pays d'Afrique.

### Principes Fondamentaux :
1. **100% Gratuit** : Donner est gratuit, recevoir un don est gratuit.
2. **Zéro transaction marchande** : Aucun prix de vente, commission ou paiement entre donateur et bénéficiaire.
3. **Système de fidélité « Les Pommes »** : Récompense la générosité citoyenne sans monétiser les dons.
4. **Bons d'achat partenaires** : Règle officielle **1 000 pommes = 1 000 Ar**, utilisables dès 10 000 Ar auprès des enseignes partenaires agréées (Score, Supermaki, Librairies, etc.).
5. **Confidentialité & Sécurité** : Les adresses exactes et numéros de téléphone ne sont jamais publiés en clair sur les annonces publiques.

---

## 2. Architecture Technique
- **Frontend** : React 19, TypeScript, Vite, Tailwind CSS 4, Lucide Icons, Canvas Confetti.
- **Backend & Cloud** : Firebase Authentication, Cloud Firestore, Cloud Storage.
- **Sécurité** : Règles Firestore ABAC avec séparation PII (`users/{uid}/private/info`), blocage des mises à jour orphelines, immutabilité des transactions de fidélité et vérification des rôles.

---

## 3. Collections Firestore
- `/users/{userId}` : Profil public (nom d'affichage, ville, fokontany, solde de pommes, badges).
- `/users/{userId}/private/info` : Données privées PII (numéro de téléphone, adresse exacte).
- `/donations/{donationId}` : Publications de dons (titre, description, 14 catégories, état 0-10, jusqu'à 20 photos réelles, mode de remise, statut `DISPONIBLE`, `RESERVE`, `RECUPERE`).
- `/conversations/{conversationId}` : Conversations directes liées à une annonce.
- `/conversations/{conversationId}/messages/{messageId}` : Messages temps réel et événements système de réservation.
- `/reservations/{reservationId}` : Documents formels d'engagement de réservation.
- `/loyaltyTransactions/{transactionId}` : Journal immuable des gains et conversions de pommes.
- `/coupons/{couponId}` : Bons d'achat avec code unique à 8 chiffres et code-barres SVG.
- `/partners/{partnerId}` : Enseignes partenaires agréées pour l'encaissement des coupons.
- `/auditLogs/{logId}` : Traçabilité des opérations sensibles en caisse.

---

## 4. Programme de Fidélité « Les Pommes »
- **Inscription validée** : +10 pommes
- **Profil 100% complété** : +10 pommes
- **Première annonce publiée** : +50 pommes (bonus unique)
- **Tirage aléatoire par don** : de 10 à 1 000 pommes créditées par publication admissible
- **Conversion** : 1 000 pommes = 1 000 Ar de bon d'achat, seuil minimum d'utilisation 10 000 Ar

---

## 5. Guide de Test et Découverte
Dans l'en-tête de l'application, un sélecteur de rôle de test permet d'expérimenter la plateforme sous tous les angles :
- **Donateur** : Création d'annonces, réception des demandes, clic sur « Réserver pour ce bénéficiaire ».
- **Bénéficiaire** : Recherche filtrée, discussion, clic sur « Oui, j'ai reçu le don » pour clore la remise.
- **Magasin Partenaire** : Accès au terminal de caisse pour saisir le code à 8 chiffres, vérifier le coupon et le valider.
- **Super Administrateur** : Vue d'ensemble, modération des publications et réinitialisation des données démo.

---

## 6. Système de Notifications Temps Réel (Firestore)
- **Déclenchement automatique** : Dès qu'une nouvelle annonce est publiée, le backend identifie les membres dont la ville (`alertCity`) ou les catégories favorites (`savedCategories`) correspondent à l'objet.
- **Documents Firestore synchronisés** : Création d'alertes dans `/notifications/{notificationId}` avec statut `isRead: false`.
- **Cloche de notification interactive** :
  - Compteur animé en temps réel dans la barre de navigation.
  - Bannière flottante instantanée lors de l'arrivée d'une nouvelle offre locale.
  - Clic direct vers l'annonce (`donation-detail`) avec marquage automatique comme lu.
  - Onglet dédié dans le tableau de bord pour sélectionner sa ville d'alerte et cocher ses catégories surveillées parmi les 14 catégories.

---

## 7. Assistant IA ZaraBot (Gemini 3.8 Flash & Google Maps Grounding)
- **Conseiller communautaire multi-tours** : Accessible depuis le bouton flottant `🤖 ZaraBot` sur toutes les pages.
- **Ancrage cartographique Google Maps** : Utilise l'outil `googleMaps` pour localiser avec précision les quartiers de Madagascar et les enseignes partenaires pour l'utilisation des coupons.
