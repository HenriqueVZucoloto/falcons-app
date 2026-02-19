import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import falconsLogo from '../assets/falcons-logo.png';
import { SignOut, Swap } from '@phosphor-icons/react';
import { NAV_ITEMS, type PageType } from '../config/navigation';
import { useLocation, useNavigate } from 'react-router-dom';

// Fix: Derive IconProps from one of the icons since it's not exported directly
type IconProps = React.ComponentProps<typeof SignOut>;
import type { UserProfile } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    user: UserProfile;
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Mapeamento simples de Rota -> ID da Página (para destacar no menu)
    const getActivePageId = (pathname: string): PageType => {
        if (pathname === '/' || pathname === '/home') return 'home';
        if (pathname === '/statement') return 'statement';
        if (pathname === '/profile') return 'profile';
        if (pathname === '/admin/dashboard') return 'admin_dashboard';
        if (pathname === '/admin/athletes' || pathname.startsWith('/admin/athletes/')) return 'admin_athletes';
        if (pathname === '/admin/charges') return 'admin_charges';
        if (pathname === '/admin/management') return 'admin_management';
        return 'home';
    };

    const activePage = getActivePageId(location.pathname);

    const handleNavigate = (pageId: PageType) => {
        switch (pageId) {
            case 'home': navigate('/'); break;
            case 'statement': navigate('/statement'); break;
            case 'profile': navigate('/profile'); break;
            case 'admin_dashboard': navigate('/admin/dashboard'); break;
            case 'admin_athletes': navigate('/admin/athletes'); break;
            case 'admin_charges': navigate('/admin/charges'); break;
            case 'admin_management': navigate('/admin/management'); break;
        }
    };

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
            navigate('/admin/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-falcons-bg text-falcons-text flex flex-col md:flex-row font-sans">

            {/* --- SIDEBAR (Desktop: Mantida Completa) --- */}
            <aside className="hidden md:flex flex-col w-64 h-screen bg-falcons-bg-card border-r border-falcons-border fixed left-0 top-0 z-50 overflow-y-auto custom-scrollbar">
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
                                    onClick={() => handleNavigate(item.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group cursor-pointer ${activePage === item.id
                                        ? 'bg-[#FFD600] text-[#1A1A1A] font-bold shadow-[0_0_20px_rgba(255,214,0,0.3)] scale-[1.02]'
                                        : 'text-[#a0a0a0] hover:bg-[#333] hover:text-white hover:pl-5'
                                        }`}
                                >
                                    {React.cloneElement(item.icon as React.ReactElement<IconProps>, {
                                        size: 20,
                                        weight: activePage === item.id ? 'fill' : 'regular'
                                    })}
                                    <span>{item.label}</span>
                                </button>
                            </React.Fragment>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-falcons-border mt-auto">
                    <div className="flex items-center gap-3 px-4 mb-4">
                        {user.fotoUrl ? (
                            <img src={user.fotoUrl} alt={user.nome} className="w-8 h-8 rounded-full object-cover border border-[#444]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-falcons-border flex items-center justify-center text-falcons-gold font-bold text-xs border border-[#444]">
                                {user.nome?.charAt(0) || 'U'}
                            </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate text-white">{user.apelido || user.nome?.split(' ')[0]}</span>
                            <span className="text-[10px] text-[#777] uppercase">{isAdmin ? 'Admin' : 'Atleta'}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-falcons-error hover:bg-falcons-error/10 transition-colors text-sm w-full text-left cursor-pointer hover:shadow-lg active:scale-95"
                    >
                        <SignOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* --- BOTTOM NAV (Mobile: Simplificada) --- */}
            <nav className="md:hidden fixed bottom-0 w-full bg-falcons-bg-card/95 backdrop-blur-md border-t border-falcons-border z-50 pb-safe safe-area-bottom">
                <div className="flex justify-around items-center h-16 px-1">

                    {/* Renderiza apenas itens do modo atual (3 ou 4 itens) */}
                    {mobileItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors cursor-pointer ${activePage === item.id
                                ? 'text-falcons-gold'
                                : 'text-falcons-text-secondary active:scale-95 hover:text-white'
                                }`}
                        >
                            {React.cloneElement(item.icon as React.ReactElement<IconProps>, {
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
                            className="flex flex-col items-center justify-center w-full h-full gap-1 text-falcons-text-secondary hover:text-white active:scale-95 border-l border-falcons-border/50 ml-1 cursor-pointer"
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