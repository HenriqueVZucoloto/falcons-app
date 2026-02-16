import { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from './types';

// Configuração de Navegação
import Layout from './components/Layout';
import type { PageType } from './config/navigation';

// Páginas Comuns/Atleta
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StatementPage from './pages/StatementPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';

// Páginas Admin (Novas)
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAthletesPage from './pages/admin/AdminAthletesPage';
import AdminChargesPage from './pages/admin/AdminChargesPage';
import AdminManagementPage from './pages/admin/AdminManagementPage';

const LoadingScreen = () => (
    <div className="flex items-center justify-center h-screen bg-[#121212] text-white">
        <span className="text-xl font-medium animate-pulse">Carregando...</span>
    </div>
);

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Estado único de navegação (controla qual tela aparece no miolo do Layout)
    const [activePage, setActivePage] = useState<PageType>('home');

    const loadUserProfile = async (uid: string) => {
        try {
            const docRef = doc(db, "usuarios", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const profile = docSnap.data() as UserProfile;
                profile.uid = uid;
                setUserProfile(profile);

                // Se o usuário for admin, podemos jogá-lo direto para o dashboard, 
                // ou manter na home. Vamos manter na home por padrão.
                if (profile.roles && profile.roles.includes('admin')) {
                    // Opcional: setActivePage('admin_dashboard');
                }
            } else {
                console.error("Usuário não encontrado!");
                setUserProfile(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) await loadUserProfile(user.uid);
            else setUserProfile(null);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 1. Loading
    if (isLoading) return <LoadingScreen />;

    // 2. Login
    if (!userProfile) return <LoginPage />;

    // 3. Troca de Senha Obrigatória
    if (userProfile.precisaMudarSenha) {
        return (
            <div className="min-h-screen bg-[#121212] text-white p-8 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <ChangePasswordPage
                        userUid={userProfile.uid}
                        onPasswordChanged={() => loadUserProfile(userProfile.uid)}
                        isFirstAccess={true}
                    />
                </div>
            </div>
        );
    }

    // 4. Roteador de Conteúdo (Switch Case)
    const renderContent = () => {
        switch (activePage) {
            // --- Área do Atleta ---
            case 'home':
                return <HomePage
                    user={userProfile}
                    onNavigateToStatement={() => setActivePage('statement')}
                />;
            case 'statement':
                return <StatementPage user={userProfile} onBack={() => setActivePage('home')} />;
            case 'profile':
                return <ProfilePage user={userProfile} />;

            // --- Área do Admin ---
            case 'admin_dashboard':
                return <AdminDashboardPage />;
            case 'admin_athletes':
                return <AdminAthletesPage />;
            case 'admin_charges':
                return <AdminChargesPage />;
            case 'admin_management':
                return <AdminManagementPage user={userProfile} />;

            default:
                return <HomePage
                    user={userProfile}
                    onNavigateToStatement={() => setActivePage('statement')}
                />;
        }
    };

    // 5. Layout Principal (Sidebar/BottomNav)
    return (
        <Layout
            user={userProfile}
            activePage={activePage}
            onNavigate={setActivePage}
        >
            {renderContent()}
        </Layout>
    );
}

export default App;