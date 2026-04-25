// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDw72p28vXaA52j18r_OSqq06roCIl77tE",
  authDomain: "hannogeobot-commands.firebaseapp.com",
  projectId: "hannogeobot-commands",
  storageBucket: "hannogeobot-commands.firebasestorage.app",
  messagingSenderId: "563866664270",
  appId: "1:563866664270:web:fd8bc5e811bd2d525c721f",
  measurementId: "G-5E9JYRCX74"
};

// Initialize Firebase using CDN imports (works in plain browser)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };