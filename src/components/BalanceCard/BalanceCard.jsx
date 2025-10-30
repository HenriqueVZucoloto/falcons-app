import React from 'react';
import './BalanceCard.css';
import { Wallet } from 'phosphor-react';

const BalanceCard = ({ saldo }) => {
  return (
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
  );
};

export default BalanceCard;