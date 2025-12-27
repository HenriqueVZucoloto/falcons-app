// frontend/src/components/PaymentsListCard.tsx

import React from 'react';
import { ClockIcon } from '@phosphor-icons/react';

// Interface para garantir que os itens da lista tenham o formato correto
interface PaymentItem {
    id: string;
    name: string;
    amount: string;
    dueDate: string;
}

interface PaymentsListCardProps {
    type: 'late' | 'pending';
    title: string;
    icon: React.ReactNode;
    list: PaymentItem[];
    onItemClick: (item: PaymentItem) => void;
}

const PaymentsListCard: React.FC<PaymentsListCardProps> = ({ type, title, icon, list, onItemClick }) => {
    
    if (list.length === 0) return null;

    // Configurações dinâmicas baseadas no tipo (late vs pending)
    const isLate = type === 'late';
    
    const cardStyles = isLate 
        ? "bg-red-500/10 border-[3px] border-red-500/70 text-red-500/70" 
        : "bg-orange-500/10 border border-orange-500/70 text-orange-500/70";

    const itemBorder = isLate ? "border-red-500/70 hover:bg-red-500/5" : "border-orange-500/70 hover:bg-orange-500/5";
    const dueDateColor = isLate ? "text-red-300" : "text-[#a0a0a0]";

    return (
        <div className={`p-6 rounded-2xl mb-4 ${cardStyles}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
                {icon}
                <strong className="text-lg font-bold">{title}</strong>
            </div>

            <div className="flex flex-col gap-2">
                {list.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className={`w-full flex flex-col gap-2 p-6 bg-[#252525] rounded-2xl text-left text-white border transition-all cursor-pointer active:scale-[0.99] ${itemBorder}`}
                    >
                        <div className="flex items-center justify-center md:justify-start gap-2 font-medium text-gray-300">
                            <ClockIcon size={20} />
                            <span>{item.name}</span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-auto gap-1">
                            <span className={`text-sm ${dueDateColor}`}>{item.dueDate}</span>
                            <span className="ml-auto font-bold text-2xl text-white whitespace-nowrap">
                                R$ {item.amount}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PaymentsListCard;