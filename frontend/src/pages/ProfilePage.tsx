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
                    className="flex items-center gap-3 p-4 bg-[#333] rounded-xl border border-[#444] hover:border-[#FFD600] transition-all text-left group cursor-pointer shadow-sm hover:shadow-lg hover:shadow-[#FFD600]/10 active:scale-[0.99]"
                >
                    <div className="p-2 bg-[#252525] rounded-lg group-hover:bg-[#FFD600] group-hover:text-[#1A1A1A] transition-colors text-white">
                        <PasswordIcon size={24} />
                    </div>
                    <span className="font-bold text-white group-hover:text-[#FFD600] transition-colors">Alterar Senha</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-4 bg-[#333] rounded-xl border border-[#444] hover:border-[#FF5555] transition-all text-left group mt-4 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-[#FF5555]/10 active:scale-[0.99]"
                >
                    <div className="p-2 bg-[#252525] rounded-lg group-hover:bg-[#FF5555] group-hover:text-white transition-colors text-white">
                        <SignOutIcon size={24} />
                    </div>
                    <span className="font-bold text-white group-hover:text-[#FF5555] transition-colors">Sair da Conta</span>
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;