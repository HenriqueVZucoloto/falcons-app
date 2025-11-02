// src/pages/HomePage/HomePage.jsx
import React from 'react';
import './HomePage.css'; // Importando nosso CSS
import { Warning, TrendUp, CheckCircle } from 'phosphor-react';

// Nossos novos componentes!
import BalanceCard from '../../components/BalanceCard/BalanceCard';
import PaymentsListCard from '../../components/PaymentsListCard/PaymentsListCard';

const HomePage = () => {
    // === DADOS (No futuro, virão do Firebase) ===
    const userName = "Henrique";
    const saldo = "500,00";

    const latePayments = [
        { id: 1, name: "Mensalidade - Setembro", dueDate: "Vencido em 05/09/2025", amount: "50,00" },
        { id: 2, name: "Mensalidade - Outubro", dueDate: "Vencido em 05/10/2025", amount: "50,00" }
    ];

    const pendingPayments = [
        { id: 1, name: "Inscrição Nacional", dueDate: "Vencimento em 10/11/2025", amount: "150,00" },
        { id: 2, name: "Jaqueta do Time", dueDate: "Vencimento em 15/11/2025", amount: "80,00" },
        { id: 3, name: "Uniforme Novo", dueDate: "Vencimento em 20/11/2025", amount: "120,00" }
    ];

    // === LÓGICA MESTRA ===
    const hasLatePayments = latePayments.length > 0;
    const hasPendingPayments = pendingPayments.length > 0;
    // Esta é a nossa condição de sucesso total!
    const isAllClear = !hasLatePayments && !hasPendingPayments;
    
    // === RENDERIZAÇÃO ===
    return (
        <div className="home-container">
            {/* Bloco 1: Cabeçalho de Boas-Vindas */}
            <header className="welcome-header">
                <h1>Olá, {userName}! 🦅</h1>
                <p>Gerencie suas finanças do time</p>
            </header>

            {/* Bloco 2: Card Principal de Saldo */}
            <BalanceCard saldo={saldo} />

            {/* Bloco 3 e 4: RENDERIZAÇÃO CONDICIONAL */}
            {isAllClear ? (
                // SE NADA ESTIVER PENDENTE OU ATRASADO:
                <div className="card success-card">
                    <CheckCircle size={32} />
                    <div className="success-text">
                        <strong>Você está em dia!</strong>
                        <span>Nenhum pagamento atrasado ou pendente.</span>
                    </div>
                </div>
            ) : (
                // SE HOUVER QUALQUER PENDÊNCIA:
                // Usamos um Fragment (<>) para agrupar os dois cards
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
        </div>
    );
};

export default HomePage;