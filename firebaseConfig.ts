import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase配置 - 使用环境变量
// 在Zeabur或其他平台部署时，请设置相应的环境变量
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA7LXncqFce7GgChb8f-3nGnAxaEyh6hO4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "italien-res-bc870.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "italien-res-bc870",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "italien-res-bc870.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "944773845418",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:944773845418:web:c797e22590c5a8ae8f5bd3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HY0G93SSMP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);