import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { UserProfile, Payment } from '../types';
import { getFunctions, httpsCallable } from 'firebase/functions';

import AddAthleteModal from '../components/AddAthleteModal';

import { semearDadosTeste } from '../lib/seed'; // Importa a função de semear dados

const AdminPage: React.FC = () => {
    const [athletes, setAthletes] = useState<UserProfile[]>([]);
    const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const functions = getFunctions();

    const processar = async (pagamentoId: string, acao: 'aprovar' | 'rejeitar') => {
        let motivo = "";
        if (acao === 'rejeitar') {
            motivo = window.prompt("Digite o motivo da rejeição:") || "";
            if (!motivo) return; // Cancela se o admin não explicar o porquê
        }

        try {
            const proc = httpsCallable(functions, 'processarPagamento');
            await proc({ pagamentoId, acao, motivo });
            alert(`Pagamento ${acao === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso!`);
            window.location.reload(); // Simples para teste, depois podemos otimizar o state
        } catch (error) {
            console.error(error);
            alert("Erro ao processar pagamento.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Tarefa 1: Buscar Atletas (todos os usuários)
                const usersCollectionRef = collection(db, "usuarios");
                const usersSnapshot = await getDocs(usersCollectionRef);
                const athletesList = usersSnapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                })) as UserProfile[];
                setAthletes(athletesList);

                // Tarefa 2: Buscar Pagamentos "em análise"
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
                console.error("Erro ao buscar dados do admin: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleViewProof = (url?: string) => {
        if (url) window.open(url, '_blank');
    };

    return (
        <div className="w-full max-w-225 mx-auto flex flex-col gap-8">
            <h1 className="text-3xl font-bold text-white">Painel do Administrador</h1>

            {/* Seção 1: Gestão de Usuários */}
            <section className="bg-[#252525] p-6 rounded-2xl border border-[#333]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Gestão de Usuários</h2>
                    <button
                        className="bg-[#FFD600] text-[#1A1A1A] ml-3 px-3 py-2 md:px-5 md:py-2.5 truncate overflow-visible rounded-lg font-bold cursor-pointer hover:bg-[#e6c200] transition-colors active:scale-[0.98]"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Novo Atleta
                    </button>
                </div>

                {isLoading ? (
                    <p className="text-[#a0a0a0] animate-pulse">Carregando atletas...</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {athletes.map(athlete => (
                            <button
                                key={athlete.uid}
                                className="flex justify-between items-center w-full bg-[#333] p-4 px-6 rounded-xl border border-[#444] cursor-pointer hover:border-[#FFD600] transition-all group"
                            >
                                <div className="flex flex-col text-left">
                                    <span className="font-semibold text-white text-lg group-hover:text-[#FFD600]">{athlete.nome || 'Sem Nome'}</span>
                                    <span className="text-sm text-[#a0a0a0]">{athlete.email || 'Sem E-mail'}</span>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-[#a0a0a0] uppercase tracking-widest">Saldo</span>
                                    <span className="font-bold text-xl text-[#FFD600]">
                                        R$ {(athlete.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* Seção 2: Validação de Pagamentos */}
            <section className="bg-[#252525] p-6 rounded-2xl border border-[#333]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Validação de Pagamentos</h2>
                    <span className="text-sm font-bold text-[#FFD600] bg-[#FFD600]/10 px-3 py-1 rounded-full text-center">
                        {pendingPayments.length} em análise
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

            {isModalOpen && (
                <AddAthleteModal
                    onClose={() => setIsModalOpen(false)}
                    onAthleteAdded={() => {
                        // Aqui você pode disparar um novo fetch de dados se quiser atualizar a lista na hora
                        console.log("Atleta cadastrado com sucesso!");
                    }}
                />
            )}

            <button
                onClick={() => semearDadosTeste("wbilddxsNLVyXzh04wmuLcn5MgM2")} // Passe o seu UID aqui
                className="bg-red-600 text-white p-2 rounded mb-4"
            >
                ⚙️ Semear Dados (Clique uma vez)
            </button>
        </div>
    );
};

export default AdminPage;