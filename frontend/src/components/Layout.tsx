import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import falconsLogo from '../assets/falcons-logo.png';
import { SignOut, Swap } from 'phosphor-react';
import type { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  canSwitch: boolean | undefined;
  currentView: UserRole;
  onViewChange: (view: UserRole) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, canSwitch, currentView, onViewChange }) => {

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("Usuário deslogado com sucesso!");
        } catch (error) {
            console.error("Erro ao deslogar: ", error);
        }
    };

    const handleViewSwitch = () => {
        const nextView = currentView === 'admin' ? 'atleta' : 'admin';
        onViewChange(nextView);
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#1A1A1A] text-[#F5F5F5]">
            <header className="relative flex items-center px-6 py-4 bg-[#252525] border-b border-[#333]">
                {/* Lado Esquerdo: Logo */}
                <div className="flex items-center">
                    <img src={falconsLogo} alt="Falcons Logo" className="h-8" />
                </div>

                {/* Centro: Botão de Switch */}
                {canSwitch && (
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <button 
                            onClick={handleViewSwitch} 
                            className="flex items-center gap-2 bg-[#333] border border-[#555] text-[#FFD600] px-4 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap hover:bg-[#444] transition-colors"
                        >
                            <Swap size={20} />
                            <span className="hidden sm:inline text-sm">
                                {currentView === 'admin' ? 'Ver como Atleta' : 'Ver como Admin'}
                            </span>
                        </button>
                    </div>
                )}
                
                {/* Lado Direito: Logout */}
                <button 
                    onClick={handleLogout} 
                    className="ml-auto flex items-center gap-2 text-[#a0a0a0] cursor-pointer p-2 rounded hover:text-[#FFD600] hover:bg-[#333] transition-colors"
                    title="Sair"
                >
                    <SignOut size={24} />
                    <span className="hidden md:inline">Sair</span>
                </button>
            </header>

            <main className="grow overflow-y-auto p-6">
                {children}
            </main>
        </div>
    );
};

export default Layout;