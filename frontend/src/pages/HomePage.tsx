import React, { useState, useEffect } from 'react';
import { WarningIcon, TrendUpIcon, CheckCircleIcon, LockIcon, InfoIcon } from '@phosphor-icons/react'; // Adicionei InfoIcon
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { UserProfile, Payment, Cobranca } from '../types';

import BalanceCard from '../components/BalanceCard';
import PaymentsListCard from '../components/PaymentsListCard';
import SubmitPaymentModal from '../components/SubmitPaymentModal';
import AnalysisListModal from '../components/AnalysisListModal';

interface FormattedPayment {
    id: string;
    name: string;
    amount: string;
    dueDate: string;
}

interface HomePageProps {
    user: UserProfile;
}

const HomePage: React.FC<HomePageProps> = ({ user }) => {
    const [latePayments, setLatePayments] = useState<FormattedPayment[]>([]);
    const [pendingPayments, setPendingPayments] = useState<FormattedPayment[]>([]);
    const [analysisPayments, setAnalysisPayments] = useState<Payment[]>([]); // Lista para o Modal
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<FormattedPayment | null>(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false); // Controle do Modal
    const [blockedBalance, setBlockedBalance] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const userName = user.nome || 'Atleta';
    const saldoReal = user.saldo || 0;
    const saldoDisponivel = saldoReal - blockedBalance;

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setIsLoadingPayments(true);
            
            const lateList: FormattedPayment[] = [];
            const pendingList: FormattedPayment[] = [];
            const analiseList: Payment[] = []; // Lista temporária
            const hoje = new Date();
            let totalComprometido = 0;

            try {
                // 1. BUSCA COBRANÇAS
                const qCobrancas = query(
                    collection(db, "cobrancas"), 
                    where("atletaId", "==", user.uid),
                    where("status", "==", "pendente")
                );
                const snapCobrancas = await getDocs(qCobrancas);

                snapCobrancas.forEach((doc) => {
                    const data = doc.data() as Cobranca;
                    const dataVencimento = (data.dataVencimento as unknown as Timestamp).toDate();
                    const dataFormatada = dataVencimento.toLocaleDateString('pt-BR');
                    
                    const formatted: FormattedPayment = {
                        id: doc.id,
                        name: data.titulo,
                        amount: (data.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                        dueDate: ''
                    };

                    if (dataVencimento < hoje) {
                        formatted.dueDate = `Vencido em ${dataFormatada}`;
                        lateList.push(formatted);
                    } else {
                        formatted.dueDate = `Vencimento em ${dataFormatada}`;
                        pendingList.push(formatted);
                    }
                });

                // 2. BUSCA PAGAMENTOS EM ANÁLISE
                const qAnalise = query(
                    collection(db, "pagamentos"),
                    where("atletaId", "==", user.uid),
                    where("statusPagamento", "==", "em análise")
                );
                const snapAnalise = await getDocs(qAnalise);
                snapAnalise.forEach(doc => {
                    const data = { id: doc.id, ...doc.data() } as Payment;
                    analiseList.push(data); // Guarda o objeto completo
                    totalComprometido += (data.valorSaldo || 0);
                });

                setBlockedBalance(totalComprometido);
                setAnalysisPayments(analiseList); // Atualiza o estado da lista
                setLatePayments(lateList);
                setPendingPayments(pendingList);
            } catch (error) {
                console.error("Erro ao buscar dados: ", error);
            } finally {
                setIsLoadingPayments(false);
            }
        };

        fetchData();
    }, [user, refreshTrigger]);

    const handleCloseModal = () => {
        setSelectedPayment(null);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="w-full max-w-150 mx-auto flex flex-col gap-6 pb-24"> {/* Adicionado padding bottom para o aviso não cobrir o conteúdo */}
            <header className="text-center mb-4">
                <h1 className="text-3xl font-semibold mb-1">Olá, {userName}! 🦅</h1>
                <p className="text-[#a0a0a0]">Gerencie suas finanças do time</p>
            </header>
            
            <BalanceCard saldo={saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} />
            
            {isLoadingPayments ? (
                <p className="text-center text-[#a0a0a0] animate-pulse">Carregando...</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {latePayments.length === 0 && pendingPayments.length === 0 ? (
                        <div className="flex items-center gap-4 p-6 bg-green-500/10 border border-green-500 rounded-xl text-green-500"> 
                            <CheckCircleIcon size={32} />
                            <div className="flex flex-col">
                                <strong className="text-lg font-semibold">Você está em dia!</strong>
                                <span className="text-sm opacity-80">Nenhuma pendência encontrada.</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <PaymentsListCard
                                type="late"
                                title={`Atrasados (${latePayments.length})`}
                                icon={<WarningIcon size={30} />}
                                list={latePayments}
                                onItemClick={(item) => setSelectedPayment(item)}
                            />

                            <PaymentsListCard
                                type="pending"
                                title={`Pendentes (${pendingPayments.length})`}
                                icon={<TrendUpIcon size={30} />}
                                list={pendingPayments}
                                onItemClick={(item) => setSelectedPayment(item)}
                            />
                        </>
                    )}
                </div>
            )}

            {/* Aviso de Saldo em Análise movido para o final */}
            {analysisPayments.length > 0 && (
                <div className="flex justify-between items-center text-sm text-[#FFD600] bg-[#FFD600]/10 p-4 rounded-xl border border-[#FFD600]/20 mt-4">
                    <div className="flex items-center gap-2">
                        <LockIcon size={20} />
                        <span>{analysisPayments.length} pagamento(s) em análise</span>
                    </div>
                    <button 
                        onClick={() => setIsAnalysisModalOpen(true)}
                        className="p-1 hover:bg-[#FFD600]/20 rounded-full transition-colors cursor-pointer"
                    >
                        <InfoIcon size={22} weight="bold" />
                    </button>
                </div>
            )}

            {selectedPayment && (
                <SubmitPaymentModal 
                    user={user}
                    paymentItem={selectedPayment}
                    onClose={handleCloseModal}
                    saldoDisponivel={saldoDisponivel}
                />
            )}

            {/* Novo Modal de Detalhes */}
            {isAnalysisModalOpen && (
                <AnalysisListModal 
                    payments={analysisPayments}
                    onClose={() => setIsAnalysisModalOpen(false)}
                />
            )}
        </div>
    );
};

export default HomePage;