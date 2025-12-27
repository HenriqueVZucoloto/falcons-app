// frontend/src/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, CollectionReference } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import type { UserProfile, Payment } from "../types";

// 1. Tipagem das variáveis de ambiente para o Vite + TS
// Isso ajuda o VS Code a sugerir os nomes das chaves do .env
interface FirebaseEnv {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
}

const env = import.meta.env as unknown as FirebaseEnv;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

// 2. Inicialização
const app = initializeApp(firebaseConfig);

// 3. Exportando os serviços com as mesmas instâncias do legado
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// 4. Atalhos Tipados (Helper Functions)
// Isso é o "pulo do gato" no TS: sempre que usarmos essas funções, 
// o código saberá exatamente quais campos existem em cada documento.
export const usersCollection = collection(db, "usuarios") as CollectionReference<UserProfile>;
export const paymentsCollection = collection(db, "pagamentos") as CollectionReference<Payment>;

export default app;