// backend/functions/index.js

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

admin.initializeApp();
const db = getFirestore();
const authAdmin = getAuth();

exports.createAthlete = onCall(async (request) => {
  const auth = request.auth;
  const data = request.data;

  // 1. VERIFICAÇÃO DE SEGURANÇA
  if (!auth) {
    throw new HttpsError(
      "unauthenticated", 
      "Você precisa estar logado para criar um usuário."
    );
  }

  // 2. VERIFICAÇÃO DE AUTORIZAÇÃO (Admin)
  const adminDocRef = db.collection("usuarios").doc(auth.uid);
  const adminDoc = await adminDocRef.get();

  if (!adminDoc.exists || !adminDoc.data().roles.includes("admin")) {
    throw new HttpsError(
      "permission-denied", 
      "Você não tem permissão para executar esta ação."
    );
  }

  // 3. CAPTURA DOS DADOS (Incluindo o novo campo 'apelido')
  // A senha virá como 'falcons2026' enviada pelo frontend
  const { nome, apelido, email, password } = data;

  // 4. VALIDAÇÃO DOS DADOS
  // Adicionamos a validação para o campo apelido
  if (!email || !email.endsWith("@usp.br") || !nome || !apelido || !password || password.length < 6) {
    throw new HttpsError(
      "invalid-argument", 
      "Dados inválidos. Verifique o e-mail (@usp.br), nome, apelido e senha."
    );
  }

  try {
    // 5. CRIAÇÃO NO FIREBASE AUTH
    const userRecord = await authAdmin.createUser({
      email: email,
      password: password,
      displayName: nome,
    });

    // 6. CRIAÇÃO DO DOCUMENTO NO FIRESTORE
    await db.collection("usuarios").doc(userRecord.uid).set({
      nome: nome,
      apelido: apelido, // Agora salvamos o apelido do atleta
      email: email,
      saldo: 0,
      roles: ["atleta"],
      precisaMudarSenha: true, // Mantemos o flag para o futuro "force change"
      dataCriacao: admin.firestore.FieldValue.serverTimestamp(), // Boa prática de Auditoria
    });

    return { 
      status: "success", 
      message: `Atleta ${apelido} criado com sucesso!`, 
      uid: userRecord.uid 
    };

  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw new HttpsError(
      "internal", 
      `Erro ao criar usuário: ${error.message}`
    );
  }
});