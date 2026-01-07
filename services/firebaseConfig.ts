import { initializeApp } from "@firebase/app";
import { getAuth, GoogleAuthProvider } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";

// REPLACE THE VALUES BELOW WITH YOUR FIREBASE CONSOLE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyB5zBtUVjPu_gtSZL5dyoZ-PEtcYe7buNM",
  authDomain: "replaygram-a7dba.firebaseapp.com",
  projectId: "replaygram-a7dba",
  storageBucket: "replaygram-a7dba.firebasestorage.app",
  messagingSenderId: "165655910376",
  appId: "1:165655910376:web:1f1dd0f9c4b61fdbdfb65d",
  //measurementId: "G-8EZMMGTD5D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Standard modular initialization using scoped packages for robust type resolution
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);