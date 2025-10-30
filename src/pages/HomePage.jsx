import React from 'react';
import './HomePage.css'; // Importando nosso CSS
import { Wallet, DownloadSimple, Warning, Clock, CheckCircle, TrendUp, Plus } from 'phosphor-react';

const HomePage = () => {
    const userName = "Henrique";
    const saldo = "50,00";
    const pagamentosAtrasados = 2;
    const pagamentosPendentes = 3;

    return (
        <div className="home-container">
            {/* Bloco 1: Cabeçalho de Boas-Vindas */}
            <header className="welcome-header">
                <h1>Olá, {userName}! 🦅</h1>
                <p>Gerencie suas finanças do time</p>
            </header>

            {/* Bloco 2: Card Principal de Saldo */}
            <div className="card balance-card">
                <div className="card-header">
                    <div className="card-title">
                        <Wallet size={20} />
                        <span>Saldo</span>
                    </div>
                </div>
                <p className="balance-amount">R$ {saldo}</p>
                <button className="add-saldo-button">+ Adicionar Saldo</button>
            </div>

            {/* Bloco 3: Card de Atrasos */}
            <div className="card late-card">
                <div className='card-header'>
                    <div className="late-title">
                        <Warning size={30} />
                        <strong>Você possui {pagamentosAtrasados} pagamento(s) atrasado(s)</strong>
                    </div>
                </div>

                <div className='late-list'>
                    <div className="card late-item">
                        <div className='item-info'>
                            <div className="item-title">
                                <Clock size={20} />
                                <span> Mensalidade - Setembro </span>
                            </div>
                            <span className='due-date'>- Vencido em 05/09/2025</span>
                        </div>

                        <span className="late-amount">R$ 50,00</span>
                    </div>

                    <div className="card late-item">
                        <div className='item-info'>
                            <div className="item-title">
                                <Clock size={20} />
                                <span> Mensalidade - Outubro </span>
                            </div>
                            <span className='due-date'>- Vencido em 05/10/2025</span>
                        </div>
                        
                        <span className="late-amount">R$ 50,00</span>
                    </div>
                </div>
            </div>

            {/* Bloco 4: Card de Pendências */}
            <div className="card pending-card">
                <div className='card-header'>
                    <div className="pending-title">
                        <Warning size={30} />
                        <strong>Você possui {pagamentosPendentes} pagamento(s) pendentes(s)</strong>
                    </div>
                </div>

                <div className='pending-list'>
                    <div className="card pending-item">
                        <div className='item-info'>
                            <div className="item-title">
                                <Clock size={20} />
                                <span> Mensalidade - Setembro </span>
                            </div>
                            <span className='due-date'>- Vencimento em 05/09/2025</span>
                        </div>

                        <span className="pending-amount">R$ 50,00</span>
                    </div>

                    <div className="card pending-item">
                        <div className='item-info'>
                            <div className="item-title">
                                <Clock size={20} />
                                <span> Mensalidade - Outubro </span>
                            </div>
                            <span className='due-date'>- Vencimento em 05/10/2025</span>
                        </div>
                        
                        <span className="pending-amount">R$ 50,00</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;