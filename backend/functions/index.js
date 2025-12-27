// functions/index.js

// 1. IMPORTAÇÃO DA V2 (A MUDANÇA PRINCIPAL)
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

admin.initializeApp();
const db = getFirestore();
const authAdmin = getAuth();

// 2. A SINTAXE DA V2 (onCall recebe 'request')
exports.createAthlete = onCall(async (request) => {
  
  // 3. Pegamos 'auth' e 'data' do 'request'
  const auth = request.auth; // O 'context.auth' agora é 'request.auth'
  const data = request.data; // O 'data' agora é 'request.data'

  // 1. VERIFICAÇÃO DE SEGURANÇA: O usuário que está chamando está logado?
  if (!auth) {
    throw new HttpsError(
      "unauthenticated", 
      "Você precisa estar logado para criar um usuário."
    );
  }

  // 2. VERIFICAÇÃO DE AUTORIZAÇÃO: O usuário que está chamando é um ADMIN?
  const adminDocRef = db.collection("usuarios").doc(auth.uid);
  const adminDoc = await adminDocRef.get();

  if (!adminDoc.exists || !adminDoc.data().roles.includes("admin")) {
    throw new HttpsError(
      "permission-denied", 
      "Você não tem permissão para executar esta ação."
    );
  }

  // 3. SE CHEGOU AQUI, É UM ADMIN! Vamos pegar os dados.
  const { nome, email, password } = data;

  // 4. Validação dos dados
  if (!email || !email.endsWith("@usp.br") || !nome || !password || password.length < 6) {
    throw new HttpsError(
      "invalid-argument", 
      "Dados inválidos. Verifique o e-mail (@usp.br), nome e senha (mín. 6 caracteres)."
    );
  }

  // 5. O GRANDE FINAL: Tenta criar os usuários
  try {
    const userRecord = await authAdmin.createUser({
      email: email,
      password: password,
      displayName: nome,
    });

    await db.collection("usuarios").doc(userRecord.uid).set({
      nome: nome,
      email: email,
      saldo: 0,
      roles: ["atleta"],
      precisaMudarSenha: true,
    });

    return { 
      status: "success", 
      message: `Atleta ${nome} criado com sucesso!`, 
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