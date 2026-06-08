import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfwb68HEn2NLf77Sr-0sC5-kR_nDP_vIQ",
  authDomain: "ai-metadata-generator-ce367.firebaseapp.com",
  projectId: "ai-metadata-generator-ce367",
  storageBucket: "ai-metadata-generator-ce367.firebasestorage.app",
  messagingSenderId: "878101234391",
  appId: "1:878101234391:web:015ded36c9d4909a626692"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
