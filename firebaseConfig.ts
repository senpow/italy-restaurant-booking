import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyA7LXncqFce7GgChb8f-3nGnAxaEyh6hO4",
  authDomain: "italien-res-bc870.firebaseapp.com",
  projectId: "italien-res-bc870",
  storageBucket: "italien-res-bc870.firebasestorage.app",
  messagingSenderId: "944773845418",
  appId: "1:944773845418:web:c797e22590c5a8ae8f5bd3",
  measurementId: "G-HY0G93SSMP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);