import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { SignOutIcon, PasswordIcon, UserIcon } from '@phosphor-icons/react';
import Modal from '../components/Modal';
import ChangePasswordForm from '../components/ChangePasswordForm';
import type { UserProfile } from '../types';

interface ProfilePageProps {
    user: UserProfile;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
    const [isChangingPass, setIsChangingPass] = useState(false);

    const handleLogout = () => {
        if (window.confirm("Sair do app?")) auth.signOut();
    };

    return (
        <div className="flex flex-col gap-6 max-w-lg mx-auto pt-4">

            {/* Modal de Alterar Senha */}
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
            <header className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#333] border border-[#444] rounded-full flex items-center justify-center text-[#FFD600]">
                    <UserIcon size={32} weight="fill" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">{user.nome}</h1>
                    <p className="text-[#a0a0a0]">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#FFD600]/10 text-[#FFD600] rounded text-[10px] uppercase tracking-widest border border-[#FFD600]/20">
                        {user.roles?.includes('admin') ? 'Administrador' : 'Atleta'}
                    </span>
                </div>
            </header>

            <div className="flex flex-col gap-3">
                <button
                    onClick={() => setIsChangingPass(true)}
                    className="flex items-center gap-3 p-4 bg-falcons-surface rounded-xl border border-falcons-border-dark hover:border-falcons-gold transition-colors text-left group"
                >
                    <div className="p-2 bg-falcons-input rounded-lg group-hover:bg-falcons-gold group-hover:text-black transition-colors">
                        <PasswordIcon size={24} />
                    </div>
                    <span className="font-medium text-white">Alterar Senha</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-4 bg-falcons-surface rounded-xl border border-falcons-border-dark hover:border-red-500 transition-colors text-left group mt-4"
                >
                    <div className="p-2 bg-falcons-input rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors text-red-500">
                        <SignOutIcon size={24} />
                    </div>
                    <span className="font-medium text-white group-hover:text-red-500">Sair da Conta</span>
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;