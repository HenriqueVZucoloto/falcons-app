import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, limit, getDocs, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { UserProfile, Payment } from '../../types';
import { ArrowLeftIcon, ShieldCheckIcon, WalletIcon, FloppyDiskIcon, PencilSimpleIcon, XIcon } from '@phosphor-icons/react';
import Modal from '../../components/Modal';
import { formatPhone } from '../../utils/masks';

const AdminAthleteProfilePage: React.FC = () => {
    const { uid } = useParams<{ uid: string }>();
    const navigate = useNavigate();
    const [athlete, setAthlete] = useState<UserProfile | null>(null);
    const [recentLogs, setRecentLogs] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Edit mode
    const [isEditingData, setIsEditingData] = useState(false);
    const [formData, setFormData] = useState({
        nome: '', apelido: '', telefone: '', dataNascimento: '', cpf: '', fotoUrl: ''
    });

    // Modal States
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [balanceAdjustment, setBalanceAdjustment] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');

    useEffect(() => {
        if (uid) fetchAthleteData(uid);
    }, [uid]);

    const fetchAthleteData = async (userId: string) => {
        setIsLoading(true);
        try {
            const userDoc = await getDoc(doc(db, "usuarios", userId));
            if (userDoc.exists()) {
                const data = { uid: userDoc.id, ...userDoc.data() } as UserProfile;
                setAthlete(data);
                setFormData({
                    nome: data.nome || '',
                    apelido: data.apelido || '',
                    telefone: data.telefone ? formatPhone(data.telefone) : '',
                    dataNascimento: data.dataNascimento || '',
                    cpf: data.cpf || '',
                    fotoUrl: data.fotoUrl || '',
                });
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            alert("Erro ao carregar dados do atleta.");
        } finally {
            setIsLoading(false);
        }

        try {
            const logsQuery = query(
                collection(db, "pagamentos"),
                where("atletaId", "==", userId),
                where("tipo", "==", "ajuste_admin"),
                orderBy("dataProcessamento", "desc"),
                limit(5)
            );
            const logsSnap = await getDocs(logsQuery);
            setRecentLogs(logsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Payment)));
        } catch (error) {
            console.warn("Logs de ajuste não carregados (índice pode estar pendente):", error);
        }
    };

    const handleCancelEdit = () => {
        if (athlete) {
            setFormData({
                nome: athlete.nome || '',
                apelido: athlete.apelido || '',
                telefone: athlete.telefone ? formatPhone(athlete.telefone) : '',
                dataNascimento: athlete.dataNascimento || '',
                cpf: athlete.cpf || '',
                fotoUrl: athlete.fotoUrl || '',
            });
        }
        setIsEditingData(false);
    };

    const handleSaveData = async () => {
        if (!athlete || !formData.nome.trim()) {
            alert("O nome é obrigatório.");
            return;
        }

        setIsSaving(true);
        try {
            await updateDoc(doc(db, "usuarios", athlete.uid), {
                nome: formData.nome.trim(),
                apelido: formData.apelido.trim(),
                telefone: formData.telefone.replace(/\D/g, ''),
                dataNascimento: formData.dataNascimento,
                cpf: formData.cpf.trim(),
                fotoUrl: formData.fotoUrl.trim(),
            });
            alert("Dados atualizados!");
            setIsEditingData(false);
            fetchAthleteData(athlete.uid);
        } catch (error) {
            console.error("Erro ao salvar dados:", error);
            alert("Erro ao salvar. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRoleToggle = async (role: 'admin' | 'super_admin') => {
        if (!athlete) return;
        const currentRoles = athlete.roles || [];
        const hasRole = currentRoles.includes(role);

        let newRoles;
        if (hasRole) {
            newRoles = currentRoles.filter(r => r !== role);
        } else {
            newRoles = [...currentRoles, role];
        }

        if (window.confirm(`Tem certeza que deseja ${hasRole ? 'remover' : 'adicionar'} a permissão de ${role}?`)) {
            try {
                await updateDoc(doc(db, "usuarios", athlete.uid), { roles: newRoles });
                setAthlete({ ...athlete, roles: newRoles });
            } catch (error) {
                console.error("Erro ao atualizar permissão:", error);
                alert("Erro ao atualizar permissão.");
            }
        }
    };

    const handleBalanceAdjustment = async () => {
        if (!athlete || !balanceAdjustment || !adjustmentReason) return;

        setIsSaving(true);
        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, "usuarios", athlete.uid);
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) {
                    throw new Error("Atleta não encontrado.");
                }

                const newPaymentRef = doc(collection(db, "pagamentos"));

                const valor = parseFloat(balanceAdjustment);
                const novoSaldo = (userDoc.data().saldo || 0) + valor;
                transaction.update(userRef, { saldo: novoSaldo });

                transaction.set(newPaymentRef, {
                    atletaId: athlete.uid,
                    atletaNome: athlete.nome,
                    tituloCobranca: "Ajuste Administrativo",
                    tipo: "ajuste_admin",
                    cobrancaId: null,
                    valorTotal: valor,
                    valorSaldo: 0,
                    valorPix: 0,
                    statusPagamento: "aprovado",
                    motivoRejeicao: adjustmentReason,
                    dataEnvio: serverTimestamp(),
                    dataProcessamento: serverTimestamp(),
                    realizadoPor: auth.currentUser?.uid
                });
            });

            alert("Saldo ajustado com sucesso!");
            setIsBalanceModalOpen(false);
            setBalanceAdjustment('');
            setAdjustmentReason('');
            fetchAthleteData(athlete.uid);
        } catch (error) {
            console.error("Erro ao ajustar saldo:", error);
            alert("Erro ao ajustar saldo.");
        } finally {
            setIsSaving(false);
        }
    };

    const initials = athlete?.nome
        ?.split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U';

    if (isLoading) return <div className="text-center text-[#a0a0a0] p-10 animate-pulse">Carregando perfil...</div>;
    if (!athlete) return <div className="text-center text-red-500 p-10">Atleta não encontrado.</div>;

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-20">
            {/* --- HEADER --- */}
            <header className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#333] rounded-full transition-colors cursor-pointer">
                    <ArrowLeftIcon size={24} className="text-white" />
                </button>

                {athlete.fotoUrl ? (
                    <img
                        src={athlete.fotoUrl}
                        alt={athlete.nome}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#FFD600]/30"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-14 h-14 bg-[#333] border border-[#444] rounded-full flex items-center justify-center text-[#FFD600] font-bold text-lg">
                        {initials}
                    </div>
                )}

                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {athlete.nome}
                        {athlete.apelido && <span className="text-[#a0a0a0] font-normal text-lg ml-2">({athlete.apelido})</span>}
                    </h1>
                    <p className="text-[#a0a0a0] text-sm">{athlete.email}</p>
                </div>
            </header>

            {/* --- DADOS PESSOAIS (Admin edita tudo) --- */}
            <section className="bg-[#1c1c1c] border border-[#333] rounded-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 pb-4">
                    <h2 className="text-lg font-bold text-white">Dados Pessoais</h2>
                    {!isEditingData ? (
                        <button
                            onClick={() => setIsEditingData(true)}
                            className="flex items-center gap-1.5 text-sm text-[#FFD600] hover:text-[#e6c200] transition-colors cursor-pointer"
                        >
                            <PencilSimpleIcon size={16} />
                            Editar
                        </button>
                    ) : (
                        <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1.5 text-sm text-[#a0a0a0] hover:text-white transition-colors cursor-pointer"
                        >
                            <XIcon size={16} />
                            Cancelar
                        </button>
                    )}
                </div>

                <div className="px-6 pb-6 flex flex-col gap-4">
                    {/* Nome */}
                    <div>
                        <label className="text-xs text-[#777] uppercase tracking-wider mb-1 block">Nome Completo</label>
                        {isEditingData ? (
                            <input type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                className="w-full bg-[#252525] border border-[#444] p-3 rounded-xl text-white outline-none focus:border-[#FFD600]" required />
                        ) : (
                            <p className="text-white p-3">{athlete.nome}</p>
                        )}
                    </div>

                    {/* Apelido */}
                    <div>
                        <label className="text-xs text-[#777] uppercase tracking-wider mb-1 block">Apelido</label>
                        {isEditingData ? (
                            <input type="text" value={formData.apelido} onChange={e => setFormData({ ...formData, apelido: e.target.value })}
                                placeholder="Ex: Cheers"
                                className="w-full bg-[#252525] border border-[#444] p-3 rounded-xl text-white outline-none focus:border-[#FFD600] placeholder:text-[#555]" />
                        ) : (
                            <p className="text-white p-3">{athlete.apelido || <span className="text-[#555] italic">Não informado</span>}</p>
                        )}
                    </div>

                    {/* Telefone */}
                    <div>
                        <label className="text-xs text-[#777] uppercase tracking-wider mb-1 block">Telefone</label>
                        {isEditingData ? (
                            <input type="tel" inputMode="numeric" value={formData.telefone}
                                onChange={e => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                                placeholder="(11) 99999-9999"
                                className="w-full bg-[#252525] border border-[#444] p-3 rounded-xl text-white outline-none focus:border-[#FFD600] placeholder:text-[#555]" />
                        ) : (
                            <p className="text-white p-3">
                                {athlete.telefone ? formatPhone(athlete.telefone) : <span className="text-[#555] italic">Não informado</span>}
                            </p>
                        )}
                    </div>

                    {/* Data de Nascimento */}
                    <div>
                        <label className="text-xs text-[#777] uppercase tracking-wider mb-1 block">Data de Nascimento</label>
                        {isEditingData ? (
                            <input type="date" value={formData.dataNascimento}
                                onChange={e => setFormData({ ...formData, dataNascimento: e.target.value })}
                                className="w-full bg-[#252525] border border-[#444] p-3 rounded-xl text-white outline-none focus:border-[#FFD600]" />
                        ) : (
                            <p className="text-white p-3">
                                {athlete.dataNascimento
                                    ? new Date(athlete.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR')
                                    : <span className="text-[#555] italic">Não informado</span>}
                            </p>
                        )}
                    </div>

                    {/* CPF (admin-only) */}
                    <div>
                        <label className="text-xs text-[#777] uppercase tracking-wider mb-1 block">CPF</label>
                        {isEditingData ? (
                            <input type="text" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                                placeholder="000.000.000-00"
                                className="w-full bg-[#252525] border border-[#444] p-3 rounded-xl text-white outline-none focus:border-[#FFD600] placeholder:text-[#555]" />
                        ) : (
                            <p className="text-white p-3">{athlete.cpf || <span className="text-[#555] italic">Não informado</span>}</p>
                        )}
                    </div>

                    {/* Foto URL (admin-only) */}
                    <div>
                        <label className="text-xs text-[#777] uppercase tracking-wider mb-1 block">Foto (link externo)</label>
                        {isEditingData ? (
                            <input type="url" value={formData.fotoUrl} onChange={e => setFormData({ ...formData, fotoUrl: e.target.value })}
                                placeholder="https://drive.google.com/..."
                                className="w-full bg-[#252525] border border-[#444] p-3 rounded-xl text-white outline-none focus:border-[#FFD600] placeholder:text-[#555] text-sm" />
                        ) : (
                            <p className="text-white p-3 text-sm truncate">
                                {athlete.fotoUrl
                                    ? <a href={athlete.fotoUrl} target="_blank" rel="noopener noreferrer" className="text-[#00BFA5] hover:underline">{athlete.fotoUrl}</a>
                                    : <span className="text-[#555] italic">Sem foto</span>}
                            </p>
                        )}
                    </div>

                    {/* Email (read-only) */}
                    <div>
                        <label className="text-xs text-[#777] uppercase tracking-wider mb-1 block">E-mail <span className="text-[#555]">(fixo)</span></label>
                        <p className="text-[#a0a0a0] p-3 bg-[#252525] rounded-xl border border-[#333]">{athlete.email}</p>
                    </div>

                    {/* Botão Salvar */}
                    {isEditingData && (
                        <button
                            onClick={handleSaveData}
                            disabled={isSaving}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-[#FFD600] text-[#1A1A1A] rounded-xl font-bold text-lg cursor-pointer disabled:bg-[#555] disabled:cursor-not-allowed hover:bg-[#e6c200] transition-colors active:scale-[0.98] mt-2"
                        >
                            <FloppyDiskIcon size={20} weight="bold" />
                            {isSaving ? 'Salvando...' : 'Salvar Dados'}
                        </button>
                    )}
                </div>
            </section>

            {/* --- FINANCEIRO --- */}
            <section className="bg-[#1c1c1c] p-6 rounded-2xl border border-[#333] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <WalletIcon size={100} className="text-[#FFD600]" />
                </div>

                <h2 className="text-sm font-bold text-[#a0a0a0] uppercase tracking-wider mb-2">Saldo Atual</h2>
                <div className="flex items-baseline gap-2 mb-6">
                    <span className={`text-4xl font-bold font-mono ${athlete.saldo < 0 ? 'text-red-500' : 'text-[#FFD600]'}`}>
                        R$ {(athlete.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsBalanceModalOpen(true)}
                        className="flex-1 bg-[#333] hover:bg-[#444] text-white py-3 rounded-xl font-semibold transition-colors border border-[#444] cursor-pointer"
                    >
                        Ajustar Saldo
                    </button>
                </div>
            </section>

            {/* --- ACESSO & PERMISSÕES --- */}
            <section className="bg-[#1c1c1c] p-6 rounded-2xl border border-[#333]">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldCheckIcon size={24} className="text-[#a0a0a0]" />
                    <h2 className="text-lg font-bold text-white">Permissões de Acesso</h2>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center p-4 bg-[#252525] rounded-xl border border-[#333]">
                        <div>
                            <span className="block font-semibold text-white">Administrador</span>
                            <span className="text-xs text-[#777]">Acesso ao painel gerencial básico</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={athlete.roles?.includes('admin')}
                                onChange={() => handleRoleToggle('admin')}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFD600]"></div>
                        </label>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-[#252525] rounded-xl border border-[#333]">
                        <div>
                            <span className="block font-semibold text-white">Super Admin</span>
                            <span className="text-xs text-[#777]">Controle total (CUIDADO)</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={athlete.roles?.includes('super_admin')}
                                onChange={() => handleRoleToggle('super_admin')}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                        </label>
                    </div>
                </div>
            </section>

            {/* --- HISTÓRICO DE AJUSTES --- */}
            {recentLogs.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold text-[#a0a0a0] uppercase tracking-wider mb-3 ml-1">Últimos Ajustes</h3>
                    <div className="flex flex-col gap-2">
                        {recentLogs.map(log => (
                            <div key={log.id} className="bg-[#1c1c1c] p-4 rounded-xl border border-[#333] flex justify-between items-center">
                                <div>
                                    <span className="block text-white text-sm font-medium">{log.motivoRejeicao}</span>
                                    <span className="text-xs text-[#666]">
                                        {log.dataProcessamento?.toDate().toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <span className={`font-mono font-bold ${log.valorTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {log.valorTotal >= 0 ? '+' : ''} R$ {log.valorTotal?.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* --- MODAL DE AJUSTE DE SALDO --- */}
            {isBalanceModalOpen && (
                <Modal isOpen={isBalanceModalOpen} onClose={() => setIsBalanceModalOpen(false)} title="Ajuste Manual de Saldo">
                    <div className="space-y-4">
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-200 text-sm">
                            <p>⚠️ Essa ação altera diretamente o saldo do atleta e gera um registro de auditoria.</p>
                        </div>

                        <div>
                            <label className="block text-sm text-[#a0a0a0] mb-1">Valor do Ajuste (R$)</label>
                            <input
                                type="number"
                                placeholder="Ex: 50.00 ou -20.00"
                                className="w-full bg-[#1A1A1A] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-[#FFD600]"
                                value={balanceAdjustment}
                                onChange={e => setBalanceAdjustment(e.target.value)}
                            />
                            <p className="text-xs text-[#555] mt-1">Use valores negativos para reduzir o saldo.</p>
                        </div>

                        <div>
                            <label className="block text-sm text-[#a0a0a0] mb-1">Motivo (Obrigatório)</label>
                            <input
                                type="text"
                                placeholder="Ex: Correção de erro no pagamento X"
                                className="w-full bg-[#1A1A1A] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-[#FFD600]"
                                value={adjustmentReason}
                                onChange={e => setAdjustmentReason(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleBalanceAdjustment}
                            disabled={!balanceAdjustment || !adjustmentReason || isSaving}
                            className={`w-full py-3 rounded-xl font-bold text-[#1A1A1A] transition-all bg-[#FFD600] cursor-pointer
                                ${(!balanceAdjustment || !adjustmentReason || isSaving) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e6c200]'}
                            `}
                        >
                            {isSaving ? 'Registrando...' : 'Confirmar Ajuste'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminAthleteProfilePage;
