import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAfzC1XGRmGX_PetUjQLr-Ypdxx1smNwx4",
  authDomain: "stocktracker-368a1.firebaseapp.com",
  projectId: "stocktracker-368a1",
  storageBucket: "stocktracker-368a1.firebasestorage.app",
  messagingSenderId: "448654499527",
  appId: "1:448654499527:web:7914aaeb48b00a649128e2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
