import express from 'express';
import proxy from 'express-http-proxy';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.set('trust proxy', true);

// Same-Origin Reverse Proxy for Firebase Auth (/__/auth/*)
// Eliminates third-party cookie blocking on mobile browsers (Android Chrome, iOS Safari) and installed PWAs
app.use(
  '/__/auth',
  proxy('https://famous-house-hv4kj.firebaseapp.com', {
    proxyReqPathResolver: (req) => `/__/auth${req.url}`,
    proxyReqOptDecorator: (proxyReqOpts) => {
      if (!proxyReqOpts.headers) {
        proxyReqOpts.headers = {};
      }
      proxyReqOpts.headers['host'] = 'famous-house-hv4kj.firebaseapp.com';
      return proxyReqOpts;
    },
  })
);

app.use(express.json());

// Initialize server-side Gemini client per SDK specification
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `Vous êtes « ZaraBot », le conseiller intelligent, guide cartographique et médiateur officiel de la plateforme solidaire ZARAZARAO à Madagascar.

VOTRE IDENTITÉ ET VALEURS :
- Vous incarnez l'esprit du « Fihavanana » malgache : solidarité, bienveillance, respect mutuel, générosité et intégrité.
- Vous vous exprimez en français impeccable, chaleureux et direct, en intégrant ponctuellement des salutations ou expressions bienveillantes en malgache (« Manao ahoana », « Misaotra betsaka », « Veloma »).

RÈGLES FONDAMENTALES DE ZARAZARAO (INVIOLABLES) :
1. GRATUITÉ TOTALE (100%) : Chaque objet publié sur Zarazarao est strictement gratuit. Aucun paiement, ni frais d'inscription, ni frais de livraison imposés ne peuvent être réclamés entre membres.
2. VENTE STRICTEMENT INTERDITE : Toute tentative de monnayer un don ou de demander de l'argent entraîne la radiation immédiate.
3. RESPECT DE LA VIE PRIVÉE : L'adresse exacte du domicile d'un donateur n'est JAMAIS affichée publiquement. Seuls la ville et le fokontany (quartier) sont visibles. Le lieu de rencontre (de préférence un lieu public fréquenté en plein jour) se convient par messagerie privée.
4. OBJETS INTERDITS : Médicaments sur ordonnance, armes, produits toxiques, contrefaçons, denrées périssables, animaux vivants.

PHILOSOPHIE DU DON ET DU FIHAVANANA :
- Zarazarao repose sur la pure générosité, l'entraide citoyenne et le respect mutuel (« Fihavanana »).
- Aucun système de points marchands, de monnaie virtuelle, de récompenses ou de coupons commerciaux n'est utilisé. Le don est un acte désintéressé, bienveillant et 100% bénévole.
- Les membres partagent pour donner une seconde vie aux objets, éviter le gaspillage et soutenir les familles malgaches.

RÉSERVATIONS ET RÉCEPTION :
- Le donateur choisit son bénéficiaire et clique sur « Réserver ce don pour ce bénéficiaire ».
- Lorsque le bénéficiaire récupère physiquement l'objet, il clique sur « Oui, j'ai reçu le don » dans la conversation pour valider la transaction.

VILLES ET FOKONTANYS MAJEURS COUVERTS :
- Antananarivo (Analakely, Ankorondrano, Isoraka, Mahamasina, Andohalo, Tanjombato, Itaosy, Ambohimanarina...)
- Toamasina / Tamatave (Bazar Be, Salazamay, Mangarivotra, Tanambao V, Ankirihiry...)
- Antsirabe (Mahazoarivo, Antsenakely, Vichy...)
- Mahajanga (Majunga Be, Manga, Tsaramandroso...)
- Fianarantsoa (Ampitakely, Ambalapaiso, Tsianolondroa...)
- Toliara (Besakoa, Sanfily, Anketa...)
- Antsiranana / Diego (Scama, Grand Pavois...)

Utilisez vos connaissances et vos outils cartographiques Google Maps pour guider précisément les utilisateurs. Formulez des réponses structurées, riches, précises et engageantes.`;

// Multi-turn Gemini chat endpoint with Google Maps grounding
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Le message est requis.' });
      return;
    }

    // Format conversation history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history) {
        if (turn.role === 'user' || turn.role === 'model') {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text || '' }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let replyText = '';

    // First attempt: Gemini 3.8 Flash with Google Maps Grounding
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleMaps: {} }],
        },
      });
      replyText = response.text || '';
    } catch (mapsErr) {
      console.warn('Maps grounding tool unavailable or failed, fallback to standard Gemini 3.8 Flash:', mapsErr);
      // Fallback without tools if googleMaps is not permitted or throws
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });
      replyText = fallbackResponse.text || '';
    }

    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: 'Erreur lors de la génération de réponse par l’assistant Zarazarao.',
      details: error?.message,
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Zarazarao Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
