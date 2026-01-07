// Use namespaced imports for Firebase v8 compatibility
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

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

// Initialize Firebase if no app exists
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export auth and db using the namespaced API
export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const db = firebase.firestore();

export default firebase;
