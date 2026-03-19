import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWRd_QizXeL0gvtJoawBUVkkDdtKIygP4",
  authDomain: "web-game-c4a6c.firebaseapp.com",
  projectId: "web-game-c4a6c",
  storageBucket: "web-game-c4a6c.firebasestorage.app",
  messagingSenderId: "404074049404",
  appId: "1:404074049404:web:b6a685992e6a21abcfbef9",
  measurementId: "G-T71M0X5QLP"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
