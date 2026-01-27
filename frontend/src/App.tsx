// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Importação dos tipos
import type { UserProfile, UserRole } from './types';

// Componentes
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import StatementPage from './pages/StatementPage'; // Novo import

const LoadingScreen = () => (
    <div className="flex items-center justify-center h-screen bg-[#121212] text-white">
        <span className="text-xl font-medium animate-pulse">Carregando...</span>
    </div>
);

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState<UserRole>('atleta');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    
    // Novo estado para controlar a visualização do Extrato dentro da visão de Atleta
    const [showStatement, setShowStatement] = useState(false);

    // Função centralizada para buscar os dados do usuário
    const loadUserProfile = async (uid: string) => {
        try {
            const docRef = doc(db, "usuarios", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const profile = docSnap.data() as UserProfile;
                profile.uid = uid;
                setUserProfile(profile);

                // Define a visão padrão baseada nos roles
                if (profile.roles && profile.roles.includes('admin')) {
                    setCurrentView('admin');
                } else {
                    setCurrentView('atleta');
                }
            } else {
                console.error("Usuário não encontrado no Firestore!");
                setUserProfile(null);
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await loadUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Resetar o extrato quando trocar de visão (Admin <-> Atleta)
    const handleViewChange = (view: UserRole) => {
        setCurrentView(view);
        setShowStatement(false);
    };

    if (isLoading) return <LoadingScreen />;
    if (!userProfile) return <LoginPage />;

    // Interceptador de Troca de Senha
    if (userProfile.precisaMudarSenha) {
        return (
            <Layout canSwitch={false} currentView="atleta" onViewChange={() => { }}>
                <ChangePasswordPage 
                    userUid={userProfile.uid} 
                    onPasswordChanged={() => {
                        loadUserProfile(userProfile.uid); 
                    }} 
                />
            </Layout>
        );
    }

    const canSwitchView = userProfile.roles && userProfile.roles.includes('admin') && userProfile.roles.includes('atleta');

    return (
        <Layout
            canSwitch={canSwitchView || false}
            currentView={currentView}
            onViewChange={handleViewChange}
        >
            {/* Roteamento Lógico */}
            {currentView === 'admin' ? (
                <AdminPage />
            ) : (
                // Área do Atleta
                <>
                    {showStatement ? (
                        <StatementPage 
                            user={userProfile} 
                            onBack={() => setShowStatement(false)} 
                        />
                    ) : (
                        <HomePage 
                            user={userProfile} 
                            onNavigateToStatement={() => setShowStatement(true)}
                        />
                    )}
                </>
            )}
        </Layout>
    );
}

export default App;