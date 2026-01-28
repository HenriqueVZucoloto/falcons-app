import React, { useState, useEffect } from 'react';
import { ArrowDownLeftIcon, ArrowUpRightIcon, CalendarBlankIcon, WalletIcon } from '@phosphor-icons/react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import type { UserProfile } from '../types';

interface StatementItem {
    id: string;
    type: 'entry' | 'exit' | 'neutral';
    title: string;
    amount: number;
    date: Date;
    method: 'pix' | 'saldo' | 'misto';
}

interface StatementPageProps {
    user: UserProfile;
    onBack: () => void;
}

const StatementPage: React.FC<StatementPageProps> = ({ user }) => {
    const [transactions, setTransactions] = useState<StatementItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStatement = async () => {
            if (!user.uid) return;
            
            try {
                // Busca todos os pagamentos/movimentações do usuário que foram APROVADOS
                const q = query(
                    collection(db, "pagamentos"),
                    where("atletaId", "==", user.uid),
                    where("statusPagamento", "==", "aprovado"),
                    orderBy("dataEnvio", "desc")
                );

                const querySnapshot = await getDocs(q);
                const items: StatementItem[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Conversão segura de Timestamp
                    const date = data.dataEnvio instanceof Timestamp ? data.dataEnvio.toDate() : new Date();

                    // Lógica 1: Adição de Saldo (Entrada)
                    if (data.tipo === 'adicao_saldo') {
                        items.push({
                            id: doc.id,
                            type: 'entry',
                            title: 'Adição de Saldo',
                            amount: data.valorPix || 0,
                            date: date,
                            method: 'pix'
                        });
                    }
                    
                    // Lógica 2: Pagamento de Cobrança (Saída)
                    else if (data.tipo === 'pagamento_cobranca') {
                        // Se usou saldo, registra a saída
                        if (data.valorSaldo && data.valorSaldo > 0) {
                            items.push({
                                id: doc.id,
                                type: 'exit',
                                title: data.tituloCobranca || 'Pagamento',
                                amount: data.valorSaldo,
                                date: date,
                                method: data.valorPix > 0 ? 'misto' : 'saldo'
                            });
                        }
                    }
                });

                setTransactions(items);
            } catch (error) {
                console.error("Erro ao buscar extrato:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatement();
    }, [user.uid]);

    return (
        <div className="w-full max-w-lg mx-auto pb-10">
            {/* Header com Navegação */}
            <header className="flex items-center gap-4 p-6 border-b border-[#333] sticky top-0 bg-[#121212] z-10">
                <h1 className="text-xl font-bold text-white">Extrato</h1>
            </header>

            {/* Resumo do Saldo no Topo */}
            <div className="p-6">
                <div className="bg-[#1c1c1c] border border-[#333] rounded-2xl p-6 shadow-lg mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <WalletIcon size={100} className="text-[#FFD600]" />
                    </div>
                    <span className="text-sm text-[#a0a0a0] uppercase tracking-wider font-medium">Saldo Atual</span>
                    <h2 className="text-4xl font-bold text-white mt-2">
                        R$ {(user.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h2>
                </div>

                <h3 className="text-sm font-bold text-[#a0a0a0] mb-4 uppercase tracking-wider flex items-center gap-2">
                    <CalendarBlankIcon size={16} /> Histórico Recente
                </h3>

                {/* Lista de Transações */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-[#252525] rounded-xl animate-pulse border border-[#333]" />
                        ))}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-[#555]">
                        <p>Nenhuma movimentação encontrada.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {transactions.map((item) => (
                            <div 
                                key={item.id} 
                                className="flex items-center justify-between bg-[#252525] p-4 rounded-xl border border-[#333] hover:border-[#444] transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${item.type === 'entry' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {item.type === 'entry' ? (
                                            <ArrowDownLeftIcon size={20} />
                                        ) : (
                                            <ArrowUpRightIcon size={20} />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-white">{item.title}</span>
                                        <span className="text-xs text-[#a0a0a0]">
                                            {item.date.toLocaleDateString('pt-BR')} • {item.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`font-bold ${item.type === 'entry' ? 'text-green-500' : 'text-white'}`}>
                                        {item.type === 'entry' ? '+' : '-'} R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                    {item.method === 'misto' && (
                                        <span className="text-[10px] text-[#FFD600] bg-[#FFD600]/10 px-1.5 rounded mt-1">Misto</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatementPage;