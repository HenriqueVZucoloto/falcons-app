import React, { useState, useEffect } from 'react';
import { Warning, TrendUp, CheckCircle } from 'phosphor-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { UserProfile, Payment } from '../types';

import BalanceCard from '../components/BalanceCard';
import PaymentsListCard from '../components/PaymentsListCard';
import SubmitPaymentModal from '../components/SubmitPaymentModal';

// Interfaces para os tipos de pagamento formatados que a UI espera
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
    
    // Trigger para recarregar os dados após fechar o modal
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const userName = user.nome || 'Atleta';
    const saldoFormatado = (user.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    useEffect(() => {
        const fetchPayments = async () => {
            if (!user) return;
            setIsLoadingPayments(true);
            
            const lateList: FormattedPayment[] = [];
            const pendingList: FormattedPayment[] = [];
            const hoje = new Date();

            try {
                const q = query(
                    collection(db, "pagamentos"), 
                    where("atletaId", "==", user.uid),
                    where("statusPagamento", "==", "pendente")
                );

                const querySnapshot = await getDocs(q);

                querySnapshot.forEach((doc) => {
                    const data = doc.data() as Payment;
                    const dataVencimento = (data.dataVencimento as unknown as Timestamp).toDate();

                    const dataFormatada = dataVencimento.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    
                    const formattedPayment: FormattedPayment = {
                        id: doc.id,
                        name: data.despesaNome,
                        amount: (data.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                        dueDate: ''
                    };

                    if (dataVencimento < hoje) {
                        formattedPayment.dueDate = `Vencido em ${dataFormatada}`;
                        lateList.push(formattedPayment);
                    } else {
                        formattedPayment.dueDate = `Vencimento em ${dataFormatada}`;
                        pendingList.push(formattedPayment);
                    }
                });

                setLatePayments(lateList);
                setPendingPayments(pendingList);
            } catch (error) {
                console.error("Erro ao buscar pagamentos: ", error);
            } finally {
                setIsLoadingPayments(false);
            }
        };

        fetchPayments();
    }, [user, refreshTrigger]);

    const handlePaymentClick = (paymentItem: FormattedPayment) => {
        setSelectedPayment(paymentItem);
    };

    const handleCloseModal = () => {
        setSelectedPayment(null);
        setRefreshTrigger(prev => prev + 1); // Força a atualização da lista
    };

    return (
        <div className="w-full max-w-150 mx-auto flex flex-col gap-6">
            <header className="text-center mb-4">
                <h1 className="text-3xl font-semibold mb-1">Olá, {userName}! 🦅</h1>
                <p className="text-[#a0a0a0]">Gerencie suas finanças do time</p>
            </header>
            
            {/* BalanceCard */}
            <BalanceCard saldo={saldoFormatado} />

            {isLoadingPayments ? (
                <p className="text-center text-[#a0a0a0] animate-pulse">Carregando pagamentos...</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {latePayments.length === 0 && pendingPayments.length === 0 ? (
                        <div className="flex items-center gap-4 p-6 bg-green-500/10 border border-green-500 rounded-xl text-green-500"> 
                            <CheckCircle size={32} />
                            <div className="flex flex-col">
                                <strong className="text-lg font-semibold">Você está em dia!</strong>
                                <span className="text-sm opacity-80">Nenhum pagamento atrasado ou pendente.</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <PaymentsListCard
                                type="late"
                                title={`Você possui ${latePayments.length} pagamento(s) atrasado(s)`}
                                icon={<Warning size={30} />}
                                list={latePayments}
                                onItemClick={handlePaymentClick}
                            />

                            <PaymentsListCard
                                type="pending"
                                title={`Você possui ${pendingPayments.length} pagamento(s) pendente(s)`}
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
                />
            )}
        </div>
    );
};

export default HomePage;