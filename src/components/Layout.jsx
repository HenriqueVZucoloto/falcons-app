import { House, Calendar, Users, User } from 'phosphor-react';
import './Layout.css'
import falconsLogo from '../assets/falcons-logo.png';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
        <header className="header">
            <div className="logo-container">
                <img src={falconsLogo} alt="Falcons Logo" className="header-logo" />
            </div>
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