// src/pages/LoginPage/LoginPage.jsx

import React, { useState } from 'react';
import './LoginPage.css';
import { auth } from '../../lib/firebase'; // Nosso conector!
import { signInWithEmailAndPassword } from 'firebase/auth';

import falconsLogo from '../../assets/falcons-logo.png';

// Recebemos uma função 'onLoginSuccess' do App.jsx
const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); // Impede o recarregamento da página
        setError(''); // Limpa erros antigos

        try {
            // Tenta fazer o login no Firebase!
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            console.log("Login feito com SUCESSO!", userCredential.user);

        } catch (err) {
            console.error("Erro no login:", err.message);
            // Traduz o erro para o usuário
            if (err.code === 'auth/invalid-credential') {
                setError('E-mail ou senha inválidos.');
            } else {
                setError('Ocorreu um erro. Tente novamente.');
            }
        }
    };

    return (
        <div className="login-container">
            <header className="header">
                <img src={falconsLogo} alt="Falcons Logo"/>
            </header>
            <div className="login-box">
                <form onSubmit={handleLogin}>
                    <label htmlFor="email">E-mail</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu-email@usp.br"
                    />
                    
                    <label htmlFor="password">Senha</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                    
                    {error && <p className="error-message">{error}</p>}
                    
                    <button type="submit">Entrar</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;