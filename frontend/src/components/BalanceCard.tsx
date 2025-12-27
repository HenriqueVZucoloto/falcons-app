import React from 'react';
import { Wallet } from 'phosphor-react';

interface BalanceCardProps {
  saldo: string; // Recebe o saldo já formatado como string da HomePage
}

const BalanceCard: React.FC<BalanceCardProps> = ({ saldo }) => {
  return (
    <div className="bg-[#1c1c1c] border border-[#333] rounded-2xl p-6 mb-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 font-medium text-[#a0a0a0]">
          <Wallet size={20} />
          <span className="text-sm uppercase tracking-wider">Saldo</span>
        </div>
      </div>

      <p className="text-4xl font-bold my-4 text-[#F5F5F5]">
        R$ {saldo}
      </p>

      <button 
        className="w-full p-4 bg-[#FFD600] text-[#1A1A1A] rounded-xl text-base font-bold cursor-pointer hover:bg-[#e6c200] transition-colors active:scale-[0.98]"
      >
        + Adicionar Saldo
      </button>
    </div>
  );
};

export default BalanceCard;