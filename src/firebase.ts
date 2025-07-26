import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { simulatedDB } from "./lib/simulatedDB";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCI748T09o7MbzOHqbRvk8ay9Ai8v6k-SA",
  authDomain: "tienda-arg.firebaseapp.com",
  projectId: "tienda-arg",
  storageBucket: "tienda-arg.appspot.com", // Corregido de firebasestorage.app a appspot.com
  messagingSenderId: "607179205513",
  appId: "1:607179205513:web:3512cb3674301b42720f58",
  measurementId: "G-ZF7PYT3MTC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

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
    console.log("%c✅ Firestore está accesible y configurado correctamente", "color: green; font-weight: bold;");
  } catch (error) {
    console.error("Error de acceso a Firestore:", error);
    console.log("%c⚠️ Activando modo de simulación de base de datos local", "color: orange; font-weight: bold;");
    simulatedDB.setSimulationMode(true);
    
    console.log("%c⚠️ IMPORTANTE: Configurar Reglas Firestore", "background: #ff5722; color: white; font-size: 14px; font-weight: bold; padding: 4px;");
    console.log(
      "%cSi ves errores de 'Missing or insufficient permissions', debes configurar las reglas de seguridad de Firestore en la consola Firebase:\n" +
      "https://console.firebase.google.com/project/tienda-arg/firestore/rules\n\n" +
      "Reglas recomendadas para desarrollo:\n" +
      "rules_version = '2';\n" +
      "service cloud.firestore {\n" +
      "  match /databases/{database}/documents {\n" +
      "    match /{document=**} {\n" +
      "      allow read, write: if true;\n" +
      "    }\n" +
      "  }\n" +
      "}", 
      "color: #333; font-size: 12px;"
    );
  }
})();

// Verificar las reglas de seguridad
console.log("%c⚠️ IMPORTANTE: Configurar Reglas Firestore", "background: #ff5722; color: white; font-size: 14px; font-weight: bold; padding: 4px;");
console.log(
  "%cSi ves errores de 'Missing or insufficient permissions', debes configurar las reglas de seguridad de Firestore en la consola Firebase:\n" +
  "https://console.firebase.google.com/project/tienda-arg/firestore/rules\n\n" +
  "Reglas recomendadas para desarrollo:\n" +
  "rules_version = '2';\n" +
  "service cloud.firestore {\n" +
  "  match /databases/{database}/documents {\n" +
  "    match /{document=**} {\n" +
  "      allow read, write: if true;\n" +
  "    }\n" +
  "  }\n" +
  "}", 
  "color: #333; font-size: 12px;"
);