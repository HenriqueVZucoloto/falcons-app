import { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
    SignOutIcon, PasswordIcon, PencilSimpleIcon,
    FloppyDiskIcon, XIcon, UserIcon,
    PhoneIcon, CalendarBlankIcon, EnvelopeSimpleIcon, IdentificationCardIcon
} from '@phosphor-icons/react';
import Modal from '../components/Modal';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { formatPhone } from '../utils/masks';
import type { UserProfile } from '../types';

interface ProfilePageProps {
    user: UserProfile;
    onProfileUpdated?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onProfileUpdated }) => {
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [nome, setNome] = useState(user.nome);
    const [apelido, setApelido] = useState(user.apelido || '');
    const [telefone, setTelefone] = useState(user.telefone || '');
    const [dataNascimento, setDataNascimento] = useState(user.dataNascimento || '');

    const handleLogout = () => {
        if (window.confirm("Sair do app?")) auth.signOut();
    };

    const handleCancel = () => {
        setNome(user.nome);
        setApelido(user.apelido || '');
        setTelefone(user.telefone || '');
        setDataNascimento(user.dataNascimento || '');
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!nome.trim()) {
            alert("O nome é obrigatório.");
            return;
        }

        setIsSaving(true);
        try {
            await updateDoc(doc(db, "usuarios", user.uid), {
                nome: nome.trim(),
                apelido: apelido.trim(),
                telefone: telefone.replace(/\D/g, ''),
                dataNascimento,
            });
            alert("Perfil atualizado!");
            setIsEditing(false);
            onProfileUpdated?.();
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            alert("Erro ao salvar. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const initials = user.nome
        ?.split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U';

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-20">

            {/* Modal Alterar Senha */}
            <Modal
                isOpen={isChangingPass}
                onClose={() => setIsChangingPass(false)}
                title="Alterar Senha"
            >
                <div className="mt-2">
                    <p className="text-sm text-[#a0a0a0] mb-4">
                        Digite sua nova senha abaixo para atualizar seu cadastro.
                    </p>
                    <ChangePasswordForm
                        userUid={user.uid}
                        onSuccess={() => setIsChangingPass(false)}
                    />
                </div>
            </Modal>

            {/* ═══════ HERO HEADER ═══════ */}
            <section className="relative bg-[#1c1c1c] rounded-2xl border border-[#333] overflow-hidden">
                {/* Background decorativo */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD600]/5 via-transparent to-[#FFD600]/3" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFD600]/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

                <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full ring-2 ring-[#FFD600]/20 ring-offset-4 ring-offset-[#1c1c1c] overflow-hidden">
                            {user.fotoUrl ? (
                                <img
                                    src={user.fotoUrl}
                                    alt={user.nome}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={`w-full h-full bg-gradient-to-br from-[#333] to-[#252525] flex items-center justify-center text-[#FFD600] font-bold text-3xl ${user.fotoUrl ? 'hidden' : ''}`}>
                                {initials}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                            {user.nome}
                        </h1>
                        {user.apelido && (
                            <span className="text-[#a0a0a0] text-base -mt-1">"{user.apelido}"</span>
                        )}
                        <p className="text-[#777] text-sm">{user.email}</p>
                        <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 bg-[#FFD600]/10 text-[#FFD600] rounded-full text-xs font-semibold uppercase tracking-wider border border-[#FFD600]/15">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600] animate-pulse" />
                            {user.roles?.includes('admin') ? 'Administrador' : 'Atleta'}
                        </span>
                    </div>

                    {/* Edit toggle — desktop: canto sup direito */}
                    <div className="md:absolute md:top-6 md:right-6">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#252525] border border-[#444] rounded-xl text-sm text-[#FFD600] hover:bg-[#333] hover:border-[#FFD600]/40 transition-all cursor-pointer"
                            >
                                <PencilSimpleIcon size={16} weight="bold" />
                                Editar Perfil
                            </button>
                        ) : (
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2 bg-[#252525] border border-[#444] rounded-xl text-sm text-[#a0a0a0] hover:bg-[#333] hover:text-white transition-all cursor-pointer"
                            >
                                <XIcon size={16} weight="bold" />
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════ GRID: Dados + Ações ═══════ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* ── COLUNA 1: Dados Pessoais (2/3 no desktop) ── */}
                <section className="md:col-span-2 bg-[#1c1c1c] border border-[#333] rounded-2xl overflow-hidden">
                    <div className="p-6 pb-0">
                        <h2 className="text-base font-bold text-white tracking-wide">Dados Pessoais</h2>
                        <p className="text-xs text-[#555] mt-0.5">
                            {isEditing ? 'Altere seus dados e salve ao final.' : 'Informações do seu cadastro.'}
                        </p>
                    </div>

                    <div className="p-6 flex flex-col gap-5">
                        {/* Nome Completo */}
                        <FieldRow
                            icon={<UserIcon size={18} />}
                            label="Nome Completo"
                            isEditing={isEditing}
                            value={user.nome}
                            editElement={
                                <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                                    className="flex-1 bg-[#252525] border border-[#444] px-4 py-2.5 rounded-xl text-white text-sm outline-none focus:border-[#FFD600] transition-colors" required />
                            }
                        />

                        {/* Apelido */}
                        <FieldRow
                            icon={<UserIcon size={18} />}
                            label="Apelido"
                            isEditing={isEditing}
                            value={user.apelido}
                            placeholder="Não informado"
                            editElement={
                                <input type="text" value={apelido} onChange={e => setApelido(e.target.value)}
                                    placeholder="Ex: Cheers"
                                    className="flex-1 bg-[#252525] border border-[#444] px-4 py-2.5 rounded-xl text-white text-sm outline-none focus:border-[#FFD600] transition-colors placeholder:text-[#555]" />
                            }
                        />

                        {/* Telefone */}
                        <FieldRow
                            icon={<PhoneIcon size={18} />}
                            label="Telefone"
                            isEditing={isEditing}
                            value={user.telefone ? formatPhone(user.telefone) : undefined}
                            placeholder="Não informado"
                            editElement={
                                <input type="tel" inputMode="numeric" value={telefone}
                                    onChange={e => setTelefone(formatPhone(e.target.value))}
                                    placeholder="(11) 99999-9999"
                                    className="flex-1 bg-[#252525] border border-[#444] px-4 py-2.5 rounded-xl text-white text-sm outline-none focus:border-[#FFD600] transition-colors placeholder:text-[#555]" />
                            }
                        />

                        {/* Data Nascimento */}
                        <FieldRow
                            icon={<CalendarBlankIcon size={18} />}
                            label="Data de Nascimento"
                            isEditing={isEditing}
                            value={user.dataNascimento ? new Date(user.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : undefined}
                            placeholder="Não informado"
                            editElement={
                                <input type="date" value={dataNascimento}
                                    onChange={e => setDataNascimento(e.target.value)}
                                    className="flex-1 bg-[#252525] border border-[#444] px-4 py-2.5 rounded-xl text-white text-sm outline-none focus:border-[#FFD600] transition-colors" />
                            }
                        />

                        {/* Divider */}
                        <div className="border-t border-[#333]" />

                        {/* Email (read-only) */}
                        <FieldRow
                            icon={<EnvelopeSimpleIcon size={18} />}
                            label="E-mail"
                            isEditing={false}
                            value={user.email}
                            readOnlyNote="somente admin"
                        />

                        {/* CPF (read-only) */}
                        {user.cpf && (
                            <FieldRow
                                icon={<IdentificationCardIcon size={18} />}
                                label="CPF"
                                isEditing={false}
                                value={user.cpf}
                                readOnlyNote="somente admin"
                            />
                        )}

                        {/* Botão Salvar */}
                        {isEditing && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FFD600] text-[#1A1A1A] rounded-xl font-bold cursor-pointer disabled:bg-[#555] disabled:cursor-not-allowed hover:bg-[#e6c200] transition-colors active:scale-[0.98] mt-1"
                            >
                                <FloppyDiskIcon size={20} weight="bold" />
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        )}
                    </div>
                </section>

                {/* ── COLUNA 2: Ações Rápidas (1/3 no desktop) ── */}
                <aside className="flex flex-col gap-4">
                    <div className="bg-[#1c1c1c] border border-[#333] rounded-2xl p-5 flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-[#777] uppercase tracking-wider">Conta</h3>

                        <button
                            onClick={() => setIsChangingPass(true)}
                            className="flex items-center gap-3 p-3.5 bg-[#252525] rounded-xl border border-[#333] hover:border-[#FFD600]/40 transition-all text-left group cursor-pointer"
                        >
                            <div className="p-2 bg-[#333] rounded-lg group-hover:bg-[#FFD600] group-hover:text-[#1A1A1A] transition-colors text-[#a0a0a0]">
                                <PasswordIcon size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white group-hover:text-[#FFD600] transition-colors">Alterar Senha</span>
                                <span className="text-[11px] text-[#555]">Atualizar credenciais</span>
                            </div>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 p-3.5 bg-[#252525] rounded-xl border border-[#333] hover:border-red-500/40 transition-all text-left group cursor-pointer"
                        >
                            <div className="p-2 bg-[#333] rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors text-[#a0a0a0]">
                                <SignOutIcon size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">Sair da Conta</span>
                                <span className="text-[11px] text-[#555]">Encerrar sessão</span>
                            </div>
                        </button>
                    </div>

                    {/* Dica visual */}
                    <div className="bg-[#1c1c1c] border border-[#333] rounded-2xl p-5">
                        <h3 className="text-xs font-bold text-[#777] uppercase tracking-wider mb-3">Sobre</h3>
                        <p className="text-xs text-[#555] leading-relaxed">
                            Os campos <span className="text-[#777]">E-mail</span>, <span className="text-[#777]">CPF</span> e <span className="text-[#777]">Foto</span> só podem ser alterados por um administrador do time.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

/* ═══════ COMPONENTE AUXILIAR — Linha de campo ═══════ */

interface FieldRowProps {
    icon: React.ReactNode;
    label: string;
    isEditing: boolean;
    value?: string;
    placeholder?: string;
    readOnlyNote?: string;
    editElement?: React.ReactNode;
}

const FieldRow: React.FC<FieldRowProps> = ({ icon, label, isEditing, value, placeholder, readOnlyNote, editElement }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        {/* Label com ícone */}
        <div className="flex items-center gap-2 sm:w-44 shrink-0 text-[#777]">
            {icon}
            <span className="text-xs uppercase tracking-wider font-medium">
                {label}
                {readOnlyNote && <span className="text-[#444] ml-1">({readOnlyNote})</span>}
            </span>
        </div>

        {/* Valor ou Input */}
        {isEditing && editElement ? (
            editElement
        ) : (
            <span className={`text-sm px-1 ${value ? 'text-white' : 'text-[#444] italic'}`}>
                {value || placeholder || '—'}
            </span>
        )}
    </div>
);

export default ProfilePage;