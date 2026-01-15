import { initializeApp } from "firebase/app";
import { getAuth,onAuthStateChanged,signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {getFirestore } from "firebase/firestore"
const firebaseConfig = {
  apiKey: "AIzaSyAI6ONSpU8BCC8Xm0PGF4d0OYWiIe1y648",
  authDomain: "attandance-6942e.firebaseapp.com",
  projectId: "attandance-6942e",
  storageBucket: "attandance-6942e.firebasestorage.app",
  messagingSenderId: "402239004134",
  appId: "1:402239004134:web:5c3e817a0f8aa8043f8a27"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
    auth,
    createUserWithEmailAndPassword ,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    db
}
