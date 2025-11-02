// src/lib/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ==========================================================
// VAMOS ADICIONAR ESTE CONSOLE.LOG
console.log("Variáveis de ambiente lidas:", import.meta.env);
// ==========================================================

// 1. Lendo as variáveis de ambiente (do arquivo .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// ==========================================================
// E VAMOS ADICIONAR ESTE OUTRO
console.log("Objeto de configuração sendo enviado:", firebaseConfig);
// ==========================================================

// 2. Inicializando o app do Firebase
const app = initializeApp(firebaseConfig);

// 3. Exportando os serviços que vamos usar no resto do app
//    Nós nunca vamos importar 'app' diretamente, vamos usar estes atalhos:
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Para os comprovantes (JPG/PDF)

export default app; // Exporte o app principal caso precise