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

exports.processarPagamento = onCall(async (request) => {
  const { pagamentoId, acao, motivo } = request.data;
  const auth = request.auth;

  // 1. Verificação de Admin
  const adminDoc = await db.collection("usuarios").doc(auth.uid).get();
  if (!adminDoc.exists || !adminDoc.data().roles.includes("admin")) {
    throw new HttpsError("permission-denied", "Acesso restrito a administradores.");
  }

  const pagRef = db.collection("pagamentos").doc(pagamentoId);
  const pagSnap = await pagRef.get();
  
  if (!pagSnap.exists) {
    throw new HttpsError("not-found", "Pagamento não encontrado.");
  }
  
  const pagData = pagSnap.data();

  // Ação de Rejeitar: Apenas sinaliza e libera o saldo "preso" (pois não foi descontado)
  if (acao === 'rejeitar') {
    await pagRef.update({ 
      statusPagamento: 'rejeitado', 
      motivoRejeicao: motivo || "Comprovante inválido.",
      dataProcessamento: admin.firestore.FieldValue.serverTimestamp() 
    });
    return { status: "success", message: "Pagamento rejeitado." };
  }

  // Ação de Aprovar: Aqui a mágica acontece
  const batch = db.batch();
  const userRef = db.collection("usuarios").doc(pagData.atletaId);

  if (pagData.tipo === 'adicao_saldo') {
    // Aumenta o saldo real com o valor do PIX aprovado
    batch.update(userRef, { saldo: admin.firestore.FieldValue.increment(pagData.valorPix) });
  } else if (pagData.tipo === 'pagamento_cobranca') {
    // 1. Marca a cobrança como paga
    if (pagData.cobrancaId) {
      const cobRef = db.collection("cobrancas").doc(pagData.cobrancaId);
      batch.update(cobRef, { status: 'paga' });
    }
    // 2. Desconta o saldo real se houve uso de saldo (misto ou total)
    if (pagData.valorSaldo > 0) {
      batch.update(userRef, { saldo: admin.firestore.FieldValue.increment(-pagData.valorSaldo) });
    }
  }

  batch.update(pagRef, { 
    statusPagamento: 'aprovado', 
    dataProcessamento: admin.firestore.FieldValue.serverTimestamp() 
  });

  await batch.commit();
  return { status: "success", message: "Pagamento aprovado e saldo atualizado!" };
});