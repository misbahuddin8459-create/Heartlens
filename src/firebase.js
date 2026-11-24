import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  getRemoteConfig,
  fetchAndActivate,
  getString,
} from "firebase/remote-config";
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  InferenceMode,
} from "firebase/ai";

// 1. Keep YOUR HeartLens firebaseConfig here
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_authDomain,
  projectId: import.meta.env.VITE_FIREBASE_projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_appId,
  measurementId: import.meta.env.VITE_FIREBASE_measurementId,
};

// 2. Initialize Firebase
export const app = initializeApp(firebaseConfig);

// 3. App Check Debug Token
self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("debug-placeholder-key"),
  isTokenAutoRefreshEnabled: true,
});

// 4. Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function ensureSignedIn() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  return auth.currentUser;
}

// 5. Remote Config (controls AI tone dynamically)
export const remoteConfig = getRemoteConfig(app);
remoteConfig.settings.minimumFetchIntervalMillis = 60000; // 1 min for testing
remoteConfig.defaultConfig = {
  ai_tone: "gentle",
};

export async function getActiveTone() {
  try {
    await fetchAndActivate(remoteConfig);
  } catch (err) {
    console.warn("Remote Config fetch skipped (using default):", err);
  }
  return getString(remoteConfig, "ai_tone") || "gentle";
}

// 6. Hybrid AI Model (Prefer On-Device, Fallback to Cloud)
const ai = getAI(app, { backend: new GoogleAIBackend() });

export const hybridModel = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_ON_DEVICE,
});