import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  indexedDBLocalPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Use same-origin host when in browser so our Express reverse proxy serves /__/auth on identical origin
// This completely solves mobile third-party cookie restrictions and PWA standalone session loss
const resolvedAuthDomain = typeof window !== 'undefined' && window.location.hostname
  ? window.location.host
  : firebaseConfig.authDomain;

export const app = initializeApp({
  ...firebaseConfig,
  authDomain: resolvedAuthDomain
});

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId as required by SKILL.md
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth with multi-tier persistence fallbacks (IndexedDB -> LocalStorage -> SessionStorage)
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence]
  });
} catch (e) {
  authInstance = getAuth(app);
}

export const auth = authInstance;

// Connection test per SKILL.md
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Vérification de connexion Firebase: le client est hors-ligne ou la base est en cours d'initialisation.");
    }
  }
}

testConnection();
