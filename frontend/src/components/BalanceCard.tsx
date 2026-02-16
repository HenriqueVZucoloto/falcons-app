import React from 'react';
import { WalletIcon, ClockCounterClockwiseIcon } from '@phosphor-icons/react';

interface BalanceCardProps {
  saldo: string;
  onAddBalance: () => void;
  onViewStatement: () => void; // Nova Prop
}

const BalanceCard: React.FC<BalanceCardProps> = ({ saldo, onAddBalance, onViewStatement }) => {
  return (
    <div className="bg-[#1c1c1c] border border-[#333] rounded-2xl p-6 mb-4 shadow-sm relative overflow-hidden">

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 font-medium text-[#a0a0a0]">
          <WalletIcon size={20} />
          <span className="text-sm uppercase tracking-wider">Saldo Disponível</span>
        </div>

        {/* Botão de Extrato */}
        <button
          onClick={onViewStatement}
          className="flex items-center gap-1 text-xs font-bold text-[#FFD600] bg-[#FFD600]/10 px-3 py-1.5 rounded-lg hover:bg-[#FFD600]/20 transition-colors cursor-pointer"
        >
          <ClockCounterClockwiseIcon size={16} />
          Extrato
        </button>
      </div>

      <p className="text-4xl font-bold my-4 text-[#F5F5F5]">
        R$ {saldo}
      </p>

      <button
        onClick={onAddBalance}
        className="w-full p-4 bg-[#FFD600] text-[#1A1A1A] rounded-xl text-base font-bold cursor-pointer hover:bg-[#e6c200] transition-all active:scale-[0.98] shadow-lg hover:shadow-[#FFD600]/40"
      >
        + Adicionar Saldo
      </button>
    </div>
  );
};

export default BalanceCard;