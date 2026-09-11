import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAfzC1XGRmGX_PetUjQLr-Ypdxx1smNwx4",
  authDomain: "stocktracker-368a1.firebaseapp.com",
  projectId: "stocktracker-368a1",
  storageBucket: "stocktracker-368a1.firebasestorage.app",
  messagingSenderId: "448654499527",
  appId: "1:448654499527:web:7914aaeb48b00a649128e2"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Explicitly ensure persistence across device reloads, tabs, and mobile browsers (Safari/Chrome/iOS/Android)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("Firebase persistence fallback:", err);
  });
}

export { db, auth };


