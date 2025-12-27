import React, { useState, useEffect } from 'react';
import { Warning, TrendUp, CheckCircle, Lock } from 'phosphor-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { UserProfile, Payment, Cobranca } from '../types';

import BalanceCard from '../components/BalanceCard';
import PaymentsListCard from '../components/PaymentsListCard';
import SubmitPaymentModal from '../components/SubmitPaymentModal';

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
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<FormattedPayment | null>(null);
    const [blockedBalance, setBlockedBalance] = useState(0); // SALDO COMPROMETIDO
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
            const hoje = new Date();
            let totalComprometido = 0;

            try {
                // 1. BUSCA COBRANÇAS (O que ele deve pagar)
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
                        name: data.titulo, // Mudou de despesaNome para titulo
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

                // 2. BUSCA PAGAMENTOS EM ANÁLISE (Para travar o saldo)
                const qAnalise = query(
                    collection(db, "pagamentos"),
                    where("atletaId", "==", user.uid),
                    where("statusPagamento", "==", "em análise")
                );
                const snapAnalise = await getDocs(qAnalise);
                snapAnalise.forEach(doc => {
                    const data = doc.data() as Payment;
                    totalComprometido += (data.valorSaldo || 0); // Soma o que já foi prometido pagar
                });

                setBlockedBalance(totalComprometido);
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

    const handlePaymentClick = (paymentItem: FormattedPayment) => {
        setSelectedPayment(paymentItem);
    };

    const handleCloseModal = () => {
        setSelectedPayment(null);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="w-full max-w-150 mx-auto flex flex-col gap-6">
            <header className="text-center mb-4">
                <h1 className="text-3xl font-semibold mb-1">Olá, {userName}! 🦅</h1>
                <p className="text-[#a0a0a0]">Gerencie suas finanças do time</p>
            </header>
            
            {/* BalanceCard exibindo saldo disponível (já descontando o prometido) */}
            <BalanceCard saldo={saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} />
            
            {blockedBalance > 0 && (
                <div className="flex items-center gap-2 text-sm text-[#FFD600] bg-[#FFD600]/10 p-3 rounded-lg border border-[#FFD600]/20">
                    <Lock size={18} />
                    <span>Você possui R$ {blockedBalance.toLocaleString('pt-BR')} em análise.</span>
                </div>
            )}

            {isLoadingPayments ? (
                <p className="text-center text-[#a0a0a0] animate-pulse">Carregando...</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {latePayments.length === 0 && pendingPayments.length === 0 ? (
                        <div className="flex items-center gap-4 p-6 bg-green-500/10 border border-green-500 rounded-xl text-green-500"> 
                            <CheckCircle size={32} />
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
                                icon={<Warning size={30} />}
                                list={latePayments}
                                onItemClick={handlePaymentClick}
                            />

                            <PaymentsListCard
                                type="pending"
                                title={`Pendentes (${pendingPayments.length})`}
                                icon={<TrendUp size={30} />}
                                list={pendingPayments}
                                onItemClick={handlePaymentClick}
                            />
                        </>
                    )}
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
        </div>
    );
};

export default HomePage;