// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASQbUnihYK5WdzSus5s7qe0g1m7Rnzo8",
  authDomain: "checklist-cama-clinica-603.firebaseapp.com",
  projectId: "checklist-cama-clinica-603",
  storageBucket: "checklist-cama-clinica-603.appspot.com",
  messagingSenderId: "72845197983",
  appId: "1:72845197983:web:7ce604584a82c4c773cf02",
  measurementId: "G-T1CTS94TT"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);

export { db };
