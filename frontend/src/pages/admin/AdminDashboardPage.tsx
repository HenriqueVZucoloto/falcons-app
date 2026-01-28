import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { Payment } from '../../types';

const AdminDashboardPage: React.FC = () => {
    const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const functions = getFunctions();

    const processar = async (pagamentoId: string, acao: 'aprovar' | 'rejeitar') => {
        let motivo = "";
        if (acao === 'rejeitar') {
            motivo = window.prompt("Digite o motivo da rejeição:") || "";
            if (!motivo) return;
        }

        try {
            const proc = httpsCallable(functions, 'processarPagamento');
            await proc({ pagamentoId, acao, motivo });
            alert(`Pagamento ${acao === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso!`);
            window.location.reload(); 
        } catch (error) {
            console.error(error);
            alert("Erro ao processar pagamento.");
        }
    };

    const handleViewProof = (url?: string) => {
        if (url) window.open(url, '_blank');
    };

    useEffect(() => {
        const fetchPayments = async () => {
            setIsLoading(true);
            try {
                const paymentsQuery = query(
                    collection(db, "pagamentos"),
                    where("statusPagamento", "==", "em análise")
                );
                const paymentsSnapshot = await getDocs(paymentsQuery);
                const paymentsList = paymentsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Payment[];
                setPendingPayments(paymentsList);
            } catch (error) {
                console.error("Erro ao buscar pagamentos: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayments();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold text-white">Validação</h1>
                <p className="text-[#a0a0a0]">Aprovar ou rejeitar comprovantes pendentes.</p>
            </header>

            <section className="bg-[#252525] p-6 rounded-2xl border border-[#333]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Fila de Análise</h2>
                    <span className="text-sm font-bold text-[#FFD600] bg-[#FFD600]/10 px-3 py-1 rounded-full text-center">
                        {pendingPayments.length} pendente(s)
                    </span>
                </div>

                {isLoading ? (
                    <p className="text-[#a0a0a0] animate-pulse">Carregando pagamentos...</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {pendingPayments.length === 0 ? (
                            <p className="text-[#a0a0a0] text-center py-4 italic">Nenhum pagamento aguardando validação.</p>
                        ) : (
                            pendingPayments.map(payment => (
                                <div key={payment.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#333] p-6 rounded-xl border border-[#444]">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-white text-lg">{payment.atletaNome || 'Desconhecido'}</span>
                                        <span className="text-sm text-[#a0a0a0]">{payment.tituloCobranca || 'Adição de Saldo'}</span>
                                        <span className="font-bold text-xl text-[#FFD600] mt-1">
                                            R$ {(payment.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            className="grow md:grow-0 bg-[#555] text-white px-4 py-2.5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-[#666] transition-colors"
                                            onClick={() => handleViewProof(payment.urlComprovante)}
                                        >
                                            Ver Comprovante
                                        </button>
                                        <button
                                            className="grow md:grow-0 bg-[#a03c3c] text-white px-4 py-2.5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-[#c04a4a] transition-colors"
                                            onClick={() => processar(payment.id, 'rejeitar')}
                                        >
                                            Rejeitar
                                        </button>
                                        <button
                                            className="grow md:grow-0 bg-[#3c8a5a] text-white px-4 py-2.5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-[#4ba86e] transition-colors"
                                            onClick={() => processar(payment.id, 'aprovar')}
                                        >
                                            Aprovar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminDashboardPage;