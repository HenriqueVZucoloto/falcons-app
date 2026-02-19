import { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from './types';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Configuração de Navegação
import Layout from './components/Layout';

// Páginas Comuns/Atleta
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StatementPage from './pages/StatementPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';

// Páginas Admin (Novas)
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAthletesPage from './pages/admin/AdminAthletesPage';
import AdminAthleteProfilePage from './pages/admin/AdminAthleteProfilePage';
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

    const loadUserProfile = async (uid: string) => {
        try {
            const docRef = doc(db, "usuarios", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const profile = docSnap.data() as UserProfile;
                profile.uid = uid;
                setUserProfile(profile);
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

    return (
        <BrowserRouter>
            <AppRoutes userProfile={userProfile} loadUserProfile={loadUserProfile} />
        </BrowserRouter>
    );
}

/** Routes internas que podem usar useNavigate (dentro do BrowserRouter). */
function AppRoutes({ userProfile, loadUserProfile }: { userProfile: UserProfile; loadUserProfile: (uid: string) => Promise<void> }) {
    const navigate = useNavigate();

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

    return (
        <Layout user={userProfile}>
            <Routes>
                <Route path="/" element={<HomePage user={userProfile} onNavigateToStatement={() => navigate('/statement')} />} />
                <Route path="/statement" element={<StatementPage user={userProfile} />} />
                <Route path="/profile" element={<ProfilePage user={userProfile} onProfileUpdated={() => loadUserProfile(userProfile.uid)} />} />

                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/athletes" element={<AdminAthletesPage />} />
                <Route path="/admin/athletes/:uid" element={<AdminAthleteProfilePage />} />
                <Route path="/admin/charges" element={<AdminChargesPage />} />
                <Route path="/admin/management" element={<AdminManagementPage user={userProfile} />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}

export default App;