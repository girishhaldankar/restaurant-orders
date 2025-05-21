// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCN3OVh2JOIzI2obpSX9R7dgLTLkspNJZw",
  authDomain: "restaurantordersystem-ab198.firebaseapp.com",
  projectId: "restaurantordersystem-ab198",
  storageBucket: "restaurantordersystem-ab198.firebasestorage.app",
  messagingSenderId: "945285659621",
  appId: "1:945285659621:web:3c6c3be7fe050bd2fccd0c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);



