import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const semearDadosTeste = async (atletaId: string) => {
  try {
    // 1. Criar Cobrança de Outubro
    const cobRef = await addDoc(collection(db, "cobrancas"), {
      atletaId: atletaId,
      titulo: "Mensalidade Outubro",
      valor: 50.00,
      status: "pendente",
      dataVencimento: serverTimestamp()
    });

    // 2. Criar Pagamento Misto Pendente (O cenário do Henrique)
    await addDoc(collection(db, "pagamentos"), {
      atletaId: atletaId,
      atletaNome: "Henrique",
      tituloCobranca: "Mensalidade Outubro",
      tipo: "pagamento_cobranca",
      cobrancaId: cobRef.id,
      valorTotal: 50.00,
      valorPix: 30.00,    // O que o Admin vai conferir no PIX
      valorSaldo: 20.00,  // O que vai ser descontado do saldo no "aprovar"
      statusPagamento: "em análise",
      dataEnvio: serverTimestamp(),
      urlComprovante: "https://via.placeholder.com/150" // URL fake de teste
    });

    // 3. Criar Cobrança de Novembro (Para testar o saldo que não pode ser usado)
    await addDoc(collection(db, "cobrancas"), {
      atletaId: atletaId,
      titulo: "Mensalidade Novembro",
      valor: 50.00,
      status: "pendente",
      dataVencimento: serverTimestamp()
    });

    alert("Banco semeado com sucesso!");
  } catch (e) {
    console.error("Erro ao semear: ", e);
  }
};