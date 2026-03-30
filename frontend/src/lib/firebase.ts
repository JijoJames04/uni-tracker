import { initializeApp, getApps } from 'firebase/app';
import { Auth, getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
};

// Only initialize if config is present
const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app = null;
let authInstance: Auth | null = null;
let isConfiguredSuccessfully = false;

try {
  app = isConfigured && getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0] || null;
    
  if (app) {
    authInstance = getAuth(app);
    isConfiguredSuccessfully = true;
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export const auth = authInstance;
export const isFirebaseConfigured = isConfiguredSuccessfully;

export let analytics: Analytics | null = null;
if (app && typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported && app) {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.error("Firebase analytics initialization failed:", error);
      }
    }
  }).catch(error => console.error("Firebase analytics support check failed:", error));
}

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.appdata');

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase not configured');
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  
  return {
    user: result.user,
    token: credential?.accessToken || null,
  };
}

export async function signOutUser() {
  if (!auth) throw new Error('Firebase not configured');
  return fbSignOut(auth);
}
