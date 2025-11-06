// src/pages/HomePage/HomePage.jsx

import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { Warning, TrendUp, CheckCircle } from 'phosphor-react';
import BalanceCard from '../../components/BalanceCard/BalanceCard';
import PaymentsListCard from '../../components/PaymentsListCard/PaymentsListCard';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const HomePage = ({ user }) => {
    
    const [latePayments, setLatePayments] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);

    const userName = user.nome || 'Atleta';
    const saldo = (user.saldo || 0).toFixed(2).replace('.', ',');

    useEffect(() => {
        const fetchPayments = async () => {
            if (!user) return;

            setIsLoadingPayments(true);
            
            const lateList = [];
            const pendingList = [];
            
            // 1. Defina a data de "hoje" UMA VEZ
            const hoje = new Date();

            try {
                // 2. A "pergunta" (query) agora é mais inteligente:
                // "Na coleção 'pagamentos', me traga TUDO onde o 'atletaId' for igual ao meu UID
                // E onde o 'statusPagamento' for 'pendente'"
                const q = query(
                    collection(db, "pagamentos"), 
                    where("atletaId", "==", user.uid),
                    where("statusPagamento", "==", "pendente") // Só buscamos o que não foi pago
                );

                const querySnapshot = await getDocs(q);

                // 3. Organiza os resultados
                querySnapshot.forEach((doc) => {
                    const payment = { id: doc.id, ...doc.data() };
                    
                    // 4. Converte o Timestamp do Firebase para um objeto de Data do JavaScript
                    const dataVencimento = payment.dataVencimento.toDate();

                    // Formata a string da data para mostrar ao usuário
                    const dataFormatada = dataVencimento.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    
                    const formattedPayment = {
                        id: payment.id,
                        name: payment.despesaNome,
                        amount: (payment.valor || 0).toFixed(2).replace('.', ',')
                    };

                    // 5. A LÓGICA DE CÁLCULO!
                    if (dataVencimento < hoje) {
                        // Se a data de vencimento for MENOR que hoje, está atrasado
                        formattedPayment.dueDate = `Vencido em ${dataFormatada}`;
                        lateList.push(formattedPayment);
                    } else {
                        // Senão, está "só" pendente
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
    }, [user]);


    return (
        <div className="home-container">
            <header className="welcome-header">
                <h1>Olá, {userName}! 🦅</h1>
                <p>Gerencie suas finanças do time</p>
            </header>
            
            <BalanceCard saldo={saldo} />

            {/* Bloco 3 e 4: Cards de Pagamento */}
            {isLoadingPayments ? (
                <p style={{ textAlign: 'center' }}>Carregando pagamentos...</p>
            ) : (
                <>
                    {/* 3. LÓGICA DE SUCESSO RE-ADICIONADA */}
                    {latePayments.length === 0 && pendingPayments.length === 0 ? (
                        // Se AMBAS as listas estiverem vazias, mostre o sucesso
                        <div className="card success-card"> 
                            <CheckCircle size={32} />
                            <div className="success-text">
                                <strong>Você está em dia!</strong>
                                <span>Nenhum pagamento atrasado ou pendente.</span>
                            </div>
                        </div>
                    ) : (
                        // Senão, mostre as listas (e o PaymentsListCard vai se esconder se sua lista individual for vazia)
                        <>
                            <PaymentsListCard
                                type="late"
                                title={`Você possui ${latePayments.length} pagamento(s) atrasado(s)`}
                                icon={<Warning size={30} />}
                                list={latePayments}
                            />
                            
                            <PaymentsListCard
                                type="pending"
                                title={`Você possui ${pendingPayments.length} pagamento(s) pendente(s)`}
                                icon={<TrendUp size={30} />}
                                list={pendingPayments}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default HomePage;