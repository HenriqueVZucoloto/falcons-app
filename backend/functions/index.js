// backend/functions/index.js

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

admin.initializeApp();
const db = getFirestore();
const authAdmin = getAuth();

// --- HELPERS ---

/**
 * Verifica se o usuário está autenticado.
 * @param {Object} request - O objeto request da Cloud Function.
 * @return {Object} O objeto auth do usuário.
 */
function verifyAuth(request) {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Você precisa estar logado para executar esta ação.",
    );
  }
  return request.auth;
}

/**
 * Verifica se o usuário tem permissão de administrador.
 * @param {string} uid - O UID do usuário.
 * @return {Promise<void>}
 */
async function verifyAdmin(uid) {
  const userDoc = await db.collection("usuarios").doc(uid).get();
  if (!userDoc.exists || !userDoc.data().roles.includes("admin")) {
    throw new HttpsError(
      "permission-denied",
      "Acesso restrito a administradores.",
    );
  }
}

// --- FUNÇÕES ---

exports.createAthlete = onCall(async (request) => {
  const auth = verifyAuth(request);
  await verifyAdmin(auth.uid);

  const { nome, apelido, email, password } = request.data;

  // VALIDAÇÃO DOS DADOS
  if (!email || !email.endsWith("@usp.br") || !nome || !apelido ||
    !password || password.length < 6) {
    throw new HttpsError(
      "invalid-argument",
      "Dados inválidos. Verifique o e-mail (@usp.br), nome, apelido e senha.",
    );
  }

  try {
    // CRIAÇÃO NO FIREBASE AUTH
    const userRecord = await authAdmin.createUser({
      email: email,
      password: password,
      displayName: nome,
    });

    // CRIAÇÃO DO DOCUMENTO NO FIRESTORE
    await db.collection("usuarios").doc(userRecord.uid).set({
      nome: nome,
      apelido: apelido,
      email: email,
      saldo: 0,
      roles: ["atleta"],
      precisaMudarSenha: true,
      dataCriacao: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      status: "success",
      message: `Atleta ${apelido} criado com sucesso!`,
      uid: userRecord.uid,
    };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw new HttpsError(
      "internal",
      `Erro ao criar usuário: ${error.message}`,
    );
  }
});

exports.processarPagamento = onCall(async (request) => {
  const auth = verifyAuth(request);
  await verifyAdmin(auth.uid);

  const { pagamentoId, acao, motivo } = request.data;
  const pagRef = db.collection("pagamentos").doc(pagamentoId);
  const pagSnap = await pagRef.get();

  if (!pagSnap.exists) {
    throw new HttpsError("not-found", "Pagamento não encontrado.");
  }

  const pagData = pagSnap.data();

  // Ação de Rejeitar
  if (acao === "rejeitar") {
    const batch = db.batch();

    batch.update(pagRef, {
      statusPagamento: "rejeitado",
      motivoRejeicao: motivo || "Comprovante inválido.",
      dataProcessamento: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (pagData.cobrancaId) {
      const cobRef = db.collection("cobrancas").doc(pagData.cobrancaId);
      batch.update(cobRef, { status: "pendente" });
    }

    await batch.commit();
    return {
      status: "success",
      message: "Pagamento rejeitado e cobrança restaurada.",
    };
  }

  // Ação de Aprovar
  const batch = db.batch();
  const userRef = db.collection("usuarios").doc(pagData.atletaId);

  if (pagData.tipo === "adicao_saldo") {
    batch.update(userRef, {
      saldo: admin.firestore.FieldValue.increment(pagData.valorPix),
    });
  } else if (pagData.tipo === "pagamento_cobranca") {
    if (pagData.cobrancaId) {
      const cobRef = db.collection("cobrancas").doc(pagData.cobrancaId);
      batch.update(cobRef, { status: "paga" });
    }
    if (pagData.valorSaldo > 0) {
      batch.update(userRef, {
        saldo: admin.firestore.FieldValue.increment(-pagData.valorSaldo),
      });
    }
  }

  batch.update(pagRef, {
    statusPagamento: "aprovado",
    dataProcessamento: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
  return { status: "success", message: "Pagamento aprovado e saldo atualizado!" };
});

exports.pagarComSaldoTotal = onCall(async (request) => {
  const auth = verifyAuth(request);
  const { cobrancaId } = request.data;
  const userRef = db.collection("usuarios").doc(auth.uid);
  const cobRef = db.collection("cobrancas").doc(cobrancaId);

  return await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const cobDoc = await transaction.get(cobRef);

    if (!cobDoc.exists) {
      throw new HttpsError("not-found", "Cobrança não encontrada.");
    }

    const userData = userDoc.data();
    const cobData = cobDoc.data();

    if (userData.saldo < cobData.valor) {
      throw new HttpsError(
        "failed-precondition",
        "Saldo insuficiente para quitar esta dívida.",
      );
    }

    transaction.update(userRef, {
      saldo: admin.firestore.FieldValue.increment(-cobData.valor),
    });
    transaction.update(cobRef, { status: "paga" });

    const pagRef = db.collection("pagamentos").doc();
    transaction.set(pagRef, {
      atletaId: auth.uid,
      atletaNome: userData.nome,
      tituloCobranca: cobData.titulo,
      tipo: "pagamento_cobranca",
      cobrancaId: cobrancaId,
      valorTotal: cobData.valor,
      valorSaldo: cobData.valor,
      valorPix: 0,
      statusPagamento: "aprovado",
      dataEnvio: admin.firestore.FieldValue.serverTimestamp(),
      dataProcessamento: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { status: "success" };
  });
});

exports.enviarParaAnalise = onCall(async (request) => {
  const auth = verifyAuth(request);
  const {
    cobrancaId,
    valorSaldo,
    valorPix,
    urlComprovante,
    tituloCobranca,
    tipo,
  } = request.data;

  const userDoc = await db.collection("usuarios").doc(auth.uid).get();
  const userData = userDoc.data();

  const batch = db.batch();
  const pagRef = db.collection("pagamentos").doc();

  if (tipo === "pagamento_cobranca" && cobrancaId) {
    const cobRef = db.collection("cobrancas").doc(cobrancaId);
    batch.update(cobRef, { status: "processando" });
  }

  batch.set(pagRef, {
    atletaId: auth.uid,
    atletaNome: userData.nome,
    tituloCobranca: tituloCobranca || "Adição de Saldo",
    tipo: tipo || "pagamento_cobranca",
    cobrancaId: cobrancaId || null,
    valorTotal: (valorSaldo || 0) + (valorPix || 0),
    valorSaldo: valorSaldo || 0,
    valorPix: valorPix || 0,
    urlComprovante: urlComprovante || null,
    statusPagamento: "em análise",
    dataEnvio: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
  return { status: "success" };
});

exports.ajustarSaldoAdmin = onCall(async (request) => {
  const auth = verifyAuth(request);
  await verifyAdmin(auth.uid);

  const { atletaId, valor, motivo } = request.data;

  if (!atletaId || !valor || !motivo) {
    throw new HttpsError("invalid-argument", "Atleta, valor e motivo são obrigatórios.");
  }

  const userRef = db.collection("usuarios").doc(atletaId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new HttpsError("not-found", "Atleta não encontrado.");
  }

  const batch = db.batch();

  // 1. Atualizar Saldo
  batch.update(userRef, {
    saldo: admin.firestore.FieldValue.increment(Number(valor)),
  });

  // 2. Criar Registro de Pagamento (Log)
  const pagRef = db.collection("pagamentos").doc();
  batch.set(pagRef, {
    atletaId: atletaId,
    atletaNome: userDoc.data().nome,
    tituloCobranca: "Ajuste Administrativo",
    tipo: "ajuste_admin",
    cobrancaId: null,
    valorTotal: Number(valor),
    valorSaldo: 0,
    valorPix: 0,
    statusPagamento: "aprovado",
    motivoRejeicao: motivo, // Usando este campo para guardar o motivo do ajuste
    dataEnvio: admin.firestore.FieldValue.serverTimestamp(),
    dataProcessamento: admin.firestore.FieldValue.serverTimestamp(),
    realizadoPor: auth.uid
  });

  await batch.commit();

  return {
    status: "success",
    message: `Saldo ajustado em R$ ${Number(valor).toFixed(2)}`
  };
});
