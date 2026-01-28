import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import falconsLogo from '../assets/falcons-logo.png';
import { SignOut, Swap } from '@phosphor-icons/react';
import { NAV_ITEMS } from '../config/navigation';
import type { PageType } from '../config/navigation';
import type { UserProfile } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    user: UserProfile;
    activePage: PageType;
    onNavigate: (page: PageType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, activePage, onNavigate }) => {

    const handleLogout = async () => {
        if (window.confirm("Deseja realmente sair?")) {
            try {
                await signOut(auth);
            } catch (error) {
                console.error("Erro ao deslogar: ", error);
            }
        }
    };

    const isAdmin = user.roles && user.roles.includes('admin');

    // 1. Descobre em qual "Modo" estamos baseado na página ativa
    const currentItem = NAV_ITEMS.find(item => item.id === activePage);
    const currentSection = currentItem?.section || 'athlete';

    // 2. Lógica Desktop: Admin vê tudo, Atleta vê só o dele
    const desktopItems = NAV_ITEMS.filter(item => 
        isAdmin ? true : item.section === 'athlete'
    );

    // 3. Lógica Mobile: Mostra apenas os itens da seção atual
    const mobileItems = NAV_ITEMS.filter(item => item.section === currentSection);

    // Função para trocar de modo no mobile
    const handleMobileSwitch = () => {
        if (currentSection === 'athlete') {
            onNavigate('admin_dashboard'); // Vai para o início do Admin
        } else {
            onNavigate('home'); // Vai para o início do Atleta
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] text-[#F5F5F5] flex flex-col md:flex-row font-sans">
            
            {/* --- SIDEBAR (Desktop: Mantida Completa) --- */}
            <aside className="hidden md:flex flex-col w-64 h-screen bg-[#1A1A1A] border-r border-[#333] fixed left-0 top-0 z-50 overflow-y-auto custom-scrollbar">
                <div className="p-8 pb-6 flex justify-center">
                    <img src={falconsLogo} alt="Falcons Logo" className="h-10" />
                </div>

                <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
                    {desktopItems.map((item, index) => {
                        const isNewSection = index > 0 && item.section !== desktopItems[index - 1].section;

                        return (
                            <React.Fragment key={item.id}>
                                {isNewSection && (
                                    <div className="mt-4 mb-2 px-4 text-[10px] uppercase tracking-widest text-[#555] font-bold">
                                        Administração
                                    </div>
                                )}
                                <button
                                    onClick={() => onNavigate(item.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                                        activePage === item.id 
                                        ? 'bg-[#FFD600] text-[#1A1A1A] font-bold shadow-[0_0_15px_rgba(255,214,0,0.1)]' 
                                        : 'text-[#a0a0a0] hover:bg-[#252525] hover:text-white'
                                    }`}
                                >
                                    {React.cloneElement(item.icon as any, { 
                                        size: 20,
                                        weight: activePage === item.id ? 'fill' : 'regular' 
                                    })}
                                    <span>{item.label}</span>
                                </button>
                            </React.Fragment>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#333] mt-auto">
                    <div className="flex items-center gap-3 px-4 mb-4">
                        <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[#FFD600] font-bold text-xs border border-[#444]">
                            {user.nome?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate text-white">{user.nome?.split(' ')[0]}</span>
                            <span className="text-[10px] text-[#777] uppercase">{isAdmin ? 'Admin' : 'Atleta'}</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#ff5555] hover:bg-[#ff5555]/10 transition-colors text-sm w-full text-left"
                    >
                        <SignOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* --- BOTTOM NAV (Mobile: Simplificada) --- */}
            <nav className="md:hidden fixed bottom-0 w-full bg-[#1A1A1A]/95 backdrop-blur-md border-t border-[#333] z-50 pb-safe safe-area-bottom">
                <div className="flex justify-around items-center h-16 px-1">
                    
                    {/* Renderiza apenas itens do modo atual (3 ou 4 itens) */}
                    {mobileItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                                activePage === item.id 
                                ? 'text-[#FFD600]' 
                                : 'text-[#a0a0a0] active:scale-95'
                            }`}
                        >
                             {React.cloneElement(item.icon as any, { 
                                weight: activePage === item.id ? 'fill' : 'regular',
                                size: 22
                            })}
                            <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
                        </button>
                    ))}
                    
                    {/* Botão de Trocar Modo (Só para Admins) */}
                    {isAdmin && (
                        <button
                            onClick={handleMobileSwitch}
                            className="flex flex-col items-center justify-center w-full h-full gap-1 text-[#a0a0a0] hover:text-white active:scale-95 border-l border-[#333]/50 ml-1"
                        >
                            <Swap size={22} />
                            <span className="text-[10px] font-medium truncate">
                                Ir p/ {currentSection === 'athlete' ? 'Admin' : 'Atleta'}
                            </span>
                        </button>
                    )}

                </div>
            </nav>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <main className="flex-1 md:ml-64 pb-24 md:pb-0 min-h-screen">
                <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="md:hidden flex justify-center items-center py-2 mb-4">
                         <img src={falconsLogo} alt="Falcons Logo" className="h-10" />
                    </div>
                    {children}
                </div>
            </main>

        </div>
    );
};

export default Layout;