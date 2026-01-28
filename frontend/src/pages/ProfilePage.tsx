import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { SignOutIcon, PasswordIcon, UserIcon } from '@phosphor-icons/react';
import ChangePasswordPage from './ChangePasswordPage';
import type { UserProfile } from '../types';

interface ProfilePageProps {
    user: UserProfile;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
    const [isChangingPass, setIsChangingPass] = useState(false);

    const handleLogout = () => {
        if(window.confirm("Sair do app?")) auth.signOut();
    };

    if (isChangingPass) {
        return (
            <div className="flex flex-col gap-4">
                <button onClick={() => setIsChangingPass(false)} className="text-sm text-[#a0a0a0] hover:text-white self-start">
                    ← Voltar
                </button>
                <ChangePasswordPage 
                    userUid={user.uid} 
                    onPasswordChanged={() => setIsChangingPass(false)} 
                    isFirstAccess={false} // Opcional, o padrão já é false
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-lg mx-auto pt-4">
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
                    className="flex items-center gap-3 p-4 bg-[#252525] rounded-xl border border-[#333] hover:border-[#FFD600] transition-colors text-left group"
                >
                    <div className="p-2 bg-[#333] rounded-lg group-hover:bg-[#FFD600] group-hover:text-black transition-colors">
                        <PasswordIcon size={24} />
                    </div>
                    <span className="font-medium text-white">Alterar Senha</span>
                </button>

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-4 bg-[#252525] rounded-xl border border-[#333] hover:border-red-500 transition-colors text-left group mt-4"
                >
                    <div className="p-2 bg-[#333] rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors text-red-500">
                        <SignOutIcon size={24} />
                    </div>
                    <span className="font-medium text-white group-hover:text-red-500">Sair da Conta</span>
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;