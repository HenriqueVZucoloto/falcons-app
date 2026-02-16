import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import type { Payment, UserProfile } from '../../types';
import { TrashIcon, MagnifyingGlassIcon, TrendUpIcon, TrendDownIcon } from '@phosphor-icons/react';

interface AdminManagementPageProps {
    user: UserProfile | null;
}

const AdminManagementPage: React.FC<AdminManagementPageProps> = ({ user }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'aprovado' | 'rejeitado' | 'em análise'>('all');

    const isSuperAdmin = user?.roles?.includes('super_admin');

    const fetchPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "pagamentos"), orderBy("dataEnvio", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Payment[];
            setPayments(data);
            setFilteredPayments(data);
        } catch (error) {
            console.error("Erro ao buscar pagamentos:", error);
        } finally {
            setIsLoading(false);
        }
    }, []); // Dependências vazias pois só busca uma vez

    const filterPayments = useCallback(() => {
        let result = payments;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.atletaNome.toLowerCase().includes(term) ||
                p.tituloCobranca.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(p => p.statusPagamento === statusFilter);
        }

        setFilteredPayments(result);
    }, [searchTerm, statusFilter, payments]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    useEffect(() => {
        filterPayments();
    }, [filterPayments]);

    const handleDelete = async (paymentId: string) => {
        if (!isSuperAdmin) return;
        if (!window.confirm("ATENÇÃO: Isso excluirá o registro permanentemente. Deseja continuar?")) return;

        try {
            await deleteDoc(doc(db, "pagamentos", paymentId));
            alert("Pagamento excluído com sucesso!");
            fetchPayments();
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir pagamento.");
        }
    };

    // Cálculos do Dashboard
    const totalRecebido = payments
        .filter(p => p.statusPagamento === 'aprovado')
        .reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

    const totalPendente = payments
        .filter(p => p.statusPagamento === 'em análise')
        .reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

    return (
        <div className="flex flex-col gap-8 pb-10">
            <header>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">Gestão Financeira</h1>
                    {isSuperAdmin && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            Super Admin
                        </span>
                    )}
                </div>
                <p className="text-[#a0a0a0]">Visão geral e controle de transações.</p>
            </header>

            {/* --- DASHBOARD WIDGETS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#333] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendUpIcon size={80} className="text-green-500" />
                    </div>
                    <span className="text-sm font-bold text-[#a0a0a0] uppercase tracking-wider">Total Recebido (Geral)</span>
                    <h2 className="text-3xl font-bold text-green-500 mt-2">
                        R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h2>
                </div>

                <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#333] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendDownIcon size={80} className="text-[#FFD600]" />
                    </div>
                    <span className="text-sm font-bold text-[#a0a0a0] uppercase tracking-wider">Pendente de Análise</span>
                    <h2 className="text-3xl font-bold text-[#FFD600] mt-2">
                        R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h2>
                </div>
            </div>

            {/* --- FILTROS --- */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777]" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por atleta ou título..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#252525] border border-[#333] pl-12 p-3 rounded-xl text-white outline-none focus:border-[#FFD600] transition-colors"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {(['all', 'aprovado', 'em análise', 'rejeitado'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap capitalize transition-colors ${statusFilter === status
                                ? 'bg-[#FFD600] text-[#1A1A1A]'
                                : 'bg-[#252525] text-[#a0a0a0] hover:bg-[#333]'
                                }`}
                        >
                            {status === 'all' ? 'Todos' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- LISTA DE PAGAMENTOS (DESKTOP) --- */}
            <div className="hidden md:block bg-[#1c1c1c] rounded-2xl border border-[#333] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#252525] text-[#a0a0a0] text-sm uppercase tracking-wider border-b border-[#333]">
                                <th className="p-4 font-medium">Data</th>
                                <th className="p-4 font-medium">Atleta</th>
                                <th className="p-4 font-medium">Referência</th>
                                <th className="p-4 font-medium text-right">Valor</th>
                                <th className="p-4 font-medium text-center">Status</th>
                                <th className="p-4 font-medium text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#333]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-[#555] animate-pulse">
                                        Carregando registros...
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-[#555]">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-[#252525]/50 transition-colors group">
                                        <td className="p-4 text-sm text-[#ccc]">
                                            {payment.dataEnvio instanceof Timestamp
                                                ? payment.dataEnvio.toDate().toLocaleDateString('pt-BR')
                                                : 'Hoje'}
                                        </td>
                                        <td className="p-4 font-medium text-white">
                                            {payment.atletaNome}
                                        </td>
                                        <td className="p-4 text-sm text-[#ccc]">
                                            {payment.tituloCobranca}
                                        </td>
                                        <td className="p-4 text-right font-mono text-white">
                                            R$ {(payment.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${payment.statusPagamento === 'aprovado' ? 'bg-green-500/10 text-green-500' :
                                                payment.statusPagamento === 'rejeitado' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-[#FFD600]/10 text-[#FFD600]'
                                                }`}>
                                                {payment.statusPagamento}
                                            </span>
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            {isSuperAdmin && (
                                                <button
                                                    onClick={() => handleDelete(payment.id)}
                                                    className="p-2 text-[#555] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Excluir Registro (Super Admin)"
                                                >
                                                    <TrashIcon size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- LISTA DE PAGAMENTOS (MOBILE) --- */}
            <div className="md:hidden flex flex-col gap-3">
                {isLoading ? (
                    <p className="text-center text-[#555] animate-pulse">Carregando registros...</p>
                ) : filteredPayments.length === 0 ? (
                    <p className="text-center text-[#555]">Nenhum registro encontrado.</p>
                ) : (
                    filteredPayments.map(payment => (
                        <div key={payment.id} className="bg-[#1c1c1c] p-4 rounded-xl border border-[#333] flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-lg">{payment.atletaNome}</span>
                                    <span className="text-xs text-[#777]">
                                        {payment.dataEnvio instanceof Timestamp
                                            ? payment.dataEnvio.toDate().toLocaleDateString('pt-BR')
                                            : 'Hoje'}
                                    </span>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${payment.statusPagamento === 'aprovado' ? 'bg-green-500/10 text-green-500' :
                                    payment.statusPagamento === 'rejeitado' ? 'bg-red-500/10 text-red-500' :
                                        'bg-[#FFD600]/10 text-[#FFD600]'
                                    }`}>
                                    {payment.statusPagamento}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1 bg-[#252525] p-3 rounded-lg border border-[#333]">
                                <span className="text-xs text-[#a0a0a0] uppercase tracking-wider">Referência</span>
                                <span className="text-sm text-white">{payment.tituloCobranca}</span>
                            </div>

                            <div className="flex justify-between items-end mt-1">
                                <div className="flex flex-col">
                                    <span className="text-xs text-[#a0a0a0] uppercase tracking-wider">Valor Total</span>
                                    <span className="text-xl font-bold text-white font-mono">
                                        R$ {(payment.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                {isSuperAdmin && (
                                    <button
                                        onClick={() => handleDelete(payment.id)}
                                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                        title="Excluir"
                                    >
                                        <TrashIcon size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminManagementPage;
