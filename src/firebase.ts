import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { simulatedDB } from "./lib/simulatedDB";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCI748T09o7MbzOHqbRvk8ay9Ai8v6k-SA",
  authDomain: "tienda-arg.firebaseapp.com",
  projectId: "tienda-arg",
  storageBucket: "tienda-arg.firebasestorage.app", // Bucket correcto de Firebase Storage
  messagingSenderId: "607179205513",
  appId: "1:607179205513:web:3512cb3674301b42720f58",
  measurementId: "G-ZF7PYT3MTC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Conexión para la función de envío de correo
export const sendWelcomeEmail = httpsCallable(functions, 'sendRegistrationEmail');

// Configurar Firestore con persistencia activada antes de cualquier operación
export const db = getFirestore(app);

// No activamos la persistencia después de la inicialización
// porque causa errores en hot reload
// La persistencia se puede activar usando firestoreSettings en la inicialización en producción

// Verificar si Firestore está accesible y configurar modo de simulación si no lo está
(async () => {
  try {
    // Intentar acceder a la colección "access_test" para verificar permisos
    await getDocs(collection(db, "access_test"));
    simulatedDB.setSimulationMode(false);
    if (import.meta.env.DEV) {
      console.log("%c✅ Firestore configurado correctamente", "color: green; font-weight: bold;");
    }
  } catch (error) {
    console.error("Error de acceso a Firestore:", error);
    simulatedDB.setSimulationMode(true);
    
    if (import.meta.env.DEV) {
      console.warn("⚠️ Modo simulación activado. Configura Firestore en: https://console.firebase.google.com/project/tienda-arg/firestore/rules");
    }
  }
})();