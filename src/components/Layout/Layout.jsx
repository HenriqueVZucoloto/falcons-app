import './Layout.css';
// 1. Importe as ferramentas de logout, a logo e o ícone de Sair
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import falconsLogo from '../../assets/falcons-logo.png';
import { House, Calendar, Users, User, SignOut, Swap } from 'phosphor-react';

const Layout = ({ children, canSwitch, currentView, onViewChange }) => {

    // 2. A função de logout agora vive no topo do componente
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
        onViewChange(nextView); // Chama a função do App.jsx para mudar o state
    };

    return (
        <div className="layout-container">
            <header className="header">
                <div className="logo">
                    <img src={falconsLogo} alt="Falcons Logo"/>
                </div>

                {/* 4. O "SWITCH" RENDERIZADO CONDICIONALMENTE */}
                {canSwitch && (
                    <button onClick={handleViewSwitch} className="switch-view-button">
                        <Swap size={20} />
                        {/* O texto do botão muda dependendo da visão atual */}
                        {currentView === 'admin' ? 'Ver como Atleta' : 'Ver como Admin'}
                    </button>
                )}
                
                <button onClick={handleLogout} className="logout-button" title="Sair">
                    <SignOut size={24} />
                    <span>Sair</span>
                </button>
            </header>

            <main className="content">
                {children}
            </main>

            {/* <footer className="bottom-nav">
                <a href="#" className="nav-item active">
                    <House size={28} />
                    <span>Início</span>
                </a>
                <a href="#" className="nav-item">
                    <Calendar size={28} />
                    <span>Calendário</span>
                </a>
                <a href="#" className="nav-item">
                    <Users size={28} />
                    <span>Membros</span>
                </a>
                <a href="#" className="nav-item">
                    <User size={28} />
                    <span>Perfil</span>
                </a>
            </footer> */}
        </div>
    );
};

export default Layout;