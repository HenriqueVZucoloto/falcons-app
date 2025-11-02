// src/App.jsx

import React, { useState, useEffect } from 'react';
import { auth } from './lib/firebase'; // Nosso conector
import { onAuthStateChanged } from 'firebase/auth'; // Observador de login

import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
// (Vamos precisar de um componente de "Carregando...")

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Começa carregando

    // Este "observador" é a forma moderna de verificar o login
    useEffect(() => {
        // Ele "escuta" o estado do login
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Usuário está logado
                setIsLoggedIn(true);
            } else {
                // Usuário está deslogado
                setIsLoggedIn(false);
            }
            // Já verificamos, pode parar de carregar
            setIsLoading(false); 
        });

        // Limpa o "observador" quando o componente desmontar
        return () => unsubscribe();
    }, []); // O [] vazio faz isso rodar só uma vez

    // Função que a LoginPage vai chamar
    const handleLogin = (user) => {
        setIsLoggedIn(true);
        // (Aqui, no futuro, vamos ler o 'role' dele e decidir para onde mandar)
    };

    // 1. Se estivermos checando o login, mostre um "Carregando..."
    if (isLoading) {
        // (Seria bom criar um componente bonito para isso)
        return <div style={{ background: '#1A1A1A', height: '100vh', color: 'white' }}>Carregando...</div>;
    }

    // 2. Se NÃO estiver logado (e já checamos), mostre o Login
    if (!isLoggedIn) {
        return <LoginPage onLoginSuccess={handleLogin} />;
    }

    // 3. Se ESTIVER logado, mostre o app principal
    return (
        <Layout>
            <HomePage />
        </Layout>
    );
}

export default App;