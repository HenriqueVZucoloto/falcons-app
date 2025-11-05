// src/App.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 

import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import AdminPage from './pages/AdminPage/AdminPage';

const LoadingScreen = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1A1A1A', color: 'white' }}>
        Carregando...
    </div>
);

function App() {
    const [userProfile, setUserProfile] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);
    
    // 1. O NOVO STATE! Controla a visão atual do usuário.
    const [currentView, setCurrentView] = useState('atleta'); // Começa como atleta

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, "usuarios", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const profile = docSnap.data();
                    setUserProfile(profile);
                    
                    // 2. DEFINE A VISÃO PADRÃO
                    // Se for admin, a visão padrão é 'admin'. Senão, 'atleta'.
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

    // 3. VERIFICA AS PERMISSÕES
    const isAdmin = userProfile.roles && userProfile.roles.includes('admin');
    // Só pode trocar de visão se tiver MAIS de um perfil (ex: admin e atleta)
    const canSwitchView = userProfile.roles && userProfile.roles.length > 1;

    return (
        // 4. PASSA AS NOVAS PROPS PARA O LAYOUT
        <Layout 
            canSwitch={canSwitchView} 
            currentView={currentView}
            onViewChange={setCurrentView} // Passa a função para o Layout mudar o state
        >
            {/* 5. A LÓGICA DE RENDERIZAÇÃO MUDA */}
            {/* Agora é baseada no 'currentView', não mais no 'isAdmin' */}
            {currentView === 'admin' ? (
                <AdminPage />
            ) : (
                <HomePage />
            )}
        </Layout>
    );
}

export default App;