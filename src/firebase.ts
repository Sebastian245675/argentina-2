import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- Agrega esto

const firebaseConfig = {
  apiKey: "AIzaSyCGxBFuorXGb8TZiymO5zX8Iv4fX1W6iK8",
  authDomain: "tienda-donada.firebaseapp.com",
  projectId: "tienda-donada",
  storageBucket: "tienda-donada.appspot.com",
  messagingSenderId: "653125785771",
  appId: "1:653125785771:web:430a534cec3369e79affee",
  measurementId: "G-7D5PYWPKJL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // <-- Agrega esto