// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 

// Importação dos tipos que definimos
import type { UserProfile, UserRole } from './types';

// Componentes (Eles ainda serão migrados, então os imports podem dar erro agora)
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

const LoadingScreen = () => (
    <div className="flex items-center justify-center h-screen bg-falcons-black text-white">
        <span className="text-xl font-medium animate-pulse">Carregando...</span>
    </div>
);

function App() {
    // Tipagem do estado do perfil e da visão atual
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null); 
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState<UserRole>('atleta');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, "usuarios", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // O 'as UserProfile' garante que o TS reconheça os campos
                    const profile = docSnap.data() as UserProfile;
                    profile.uid = user.uid;

                    setUserProfile(profile);
                    
                    // Define a visão padrão baseada nos roles
                    if (profile.roles && profile.roles.includes('admin')) {
                        setCurrentView('admin');
                    } else {
                        setCurrentView('atleta');
                    }
                } else {
                    console.error("Usuário autenticado não encontrado no Firestore!");
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }
            setIsLoading(false); 
        });

        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!userProfile) {
      return <LoginPage />;
  }

    const canSwitchView = userProfile.roles && userProfile.roles.length > 1;

    return (
        <Layout 
            canSwitch={canSwitchView} 
            currentView={currentView}
            onViewChange={setCurrentView}
        >
            {currentView === 'admin' ? (
                <AdminPage />
            ) : (
                <HomePage user={userProfile} />
            )}
        </Layout>
    );
}

export default App;