import React, { useState, useEffect } from 'react';
import { XIcon, UsersIcon, CheckSquareIcon, SquareIcon, MagnifyingGlassIcon, CalendarBlankIcon, CurrencyDollarIcon } from '@phosphor-icons/react';
import { db } from '../lib/firebase';
import { collection, getDocs, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { formatCurrency } from '../utils/masks';
import type { UserProfile } from '../types';

interface CreateChargeModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateChargeModal: React.FC<CreateChargeModalProps> = ({ onClose, onSuccess }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Dados da Cobrança
    const [titulo, setTitulo] = useState('');
    const [valorDisplay, setValorDisplay] = useState('');
    const [valorRaw, setValorRaw] = useState(0);
    const [dataVencimento, setDataVencimento] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // 1. Buscar usuários ao abrir
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "usuarios"));
                const usersList: UserProfile[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Filtra apenas quem tem role de atleta
                    if (data.roles?.includes('atleta')) {
                        usersList.push({ uid: doc.id, ...data } as UserProfile);
                    }
                });
                setUsers(usersList);
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            }
        };
        fetchUsers();
    }, []);

    // 2. Lógica de Seleção
    const toggleUser = (uid: string) => {
        if (selectedUsers.includes(uid)) {
            setSelectedUsers(prev => prev.filter(id => id !== uid));
        } else {
            setSelectedUsers(prev => [...prev, uid]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u.uid));
        }
    };

    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { raw, display } = formatCurrency(e.target.value);
        setValorRaw(raw);
        setValorDisplay(display);
    };

    const handleStartClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    // 3. Envio em Lote (Batch Write)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!titulo || valorRaw <= 0 || !dataVencimento) {
            alert("Preencha todos os campos corretamente.");
            return;
        }
        if (selectedUsers.length === 0) {
            alert("Selecione pelo menos um atleta.");
            return;
        }

        setIsLoading(true);
        try {
            const batch = writeBatch(db); // Cria o lote

            // Converte a data string (YYYY-MM-DD) para Timestamp
            const [ano, mes, dia] = dataVencimento.split('-').map(Number);
            const dataVencimentoTimestamp = Timestamp.fromDate(new Date(ano, mes - 1, dia));

            selectedUsers.forEach(atletaId => {
                const docRef = doc(collection(db, "cobrancas")); // Gera ID automático
                const atleta = users.find(u => u.uid === atletaId);

                batch.set(docRef, {
                    atletaId: atletaId,
                    atletaNome: atleta?.nome || "Desconhecido",
                    titulo: titulo,
                    valor: valorRaw,
                    dataVencimento: dataVencimentoTimestamp,
                    status: 'pendente',
                    criadoEm: Timestamp.now()
                });
            });

            await batch.commit(); // Executa tudo de uma vez
            onSuccess();
            handleStartClose();
        } catch (error) {
            console.error("Erro ao criar cobranças:", error);
            alert("Erro ao criar cobranças.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAllSelected = filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length;

    return (
        <div className={`fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/70 ${isClosing ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} onClick={handleStartClose}>
            <div className={`w-full h-full md:h-auto md:max-h-[90vh] max-w-2xl bg-[#252525] md:rounded-2xl shadow-2xl flex flex-col ${isClosing ? 'animate-[slideDown_0.3s_ease-in_forwards]' : 'animate-[slideUp_0.3s_ease-out_forwards]'} md:animate-none`} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <header className="flex justify-between items-center p-6 border-b border-[#333]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CurrencyDollarIcon size={24} className="text-[#FFD600]" />
                        Nova Cobrança
                    </h2>
                    <button onClick={handleStartClose} className="text-[#a0a0a0] hover:text-white cursor-pointer"><XIcon size={24} /></button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">

                    {/* Coluna Esquerda: Dados da Cobrança */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-[#a0a0a0]">Título da Cobrança</label>
                            <input
                                type="text"
                                placeholder="Ex: Mensalidade Maio"
                                className="bg-[#333] border border-[#444] p-3 rounded-xl text-white outline-none focus:border-[#FFD600]"
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-[#a0a0a0]">Valor (R$)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0,00"
                                value={valorDisplay}
                                onChange={handleValorChange}
                                className="bg-[#333] border border-[#444] p-3 rounded-xl text-white font-bold outline-none focus:border-[#FFD600]"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-[#a0a0a0]">Data de Vencimento</label>
                            <div className="relative">
                                <CalendarBlankIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                                <input
                                    type="date"
                                    className="w-full bg-[#333] border border-[#444] p-3 pl-10 rounded-xl text-white outline-none focus:border-[#FFD600]"
                                    value={dataVencimento}
                                    onChange={e => setDataVencimento(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Coluna Direita: Seleção de Usuários */}
                    <div className="flex-1 flex flex-col gap-2 bg-[#1A1A1A] p-4 rounded-xl border border-[#333]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-white flex items-center gap-2">
                                <UsersIcon size={18} /> Atletas ({selectedUsers.length})
                            </span>
                            <button
                                type="button"
                                onClick={toggleSelectAll}
                                className="text-xs text-[#FFD600] hover:underline cursor-pointer"
                            >
                                {isAllSelected ? "Desmarcar Todos" : "Selecionar Todos"}
                            </button>
                        </div>

                        <div className="relative mb-2">
                            <MagnifyingGlassIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                            <input
                                type="text"
                                placeholder="Buscar atleta..."
                                className="w-full bg-[#252525] text-sm p-2 pl-9 rounded-lg text-white outline-none border border-[#333] focus:border-[#555]"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-50 flex flex-col gap-1 pr-1 custom-scrollbar">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.uid}
                                    onClick={() => toggleUser(user.uid)}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedUsers.includes(user.uid) ? 'bg-[#FFD600]/10 border border-[#FFD600]/30' : 'hover:bg-[#333] border border-transparent'}`}
                                >
                                    {selectedUsers.includes(user.uid) ? (
                                        <CheckSquareIcon size={20} className="text-[#FFD600] shrink-0" weight="fill" />
                                    ) : (
                                        <SquareIcon size={20} className="text-[#555] shrink-0" />
                                    )}
                                    <span className={`text-sm truncate ${selectedUsers.includes(user.uid) ? 'text-white font-medium' : 'text-[#a0a0a0]'}`}>
                                        {user.nome || "Sem Nome"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <footer className="p-6 border-t border-[#333] flex justify-end gap-3">
                    <button onClick={handleStartClose} className="px-6 py-3 rounded-xl text-white hover:bg-[#333] transition-colors cursor-pointer">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-3 bg-[#FFD600] text-[#1A1A1A] font-bold rounded-xl hover:bg-[#e6c200] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {isLoading ? "Criando..." : `Criar ${selectedUsers.length} Cobrança(s)`}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CreateChargeModal;