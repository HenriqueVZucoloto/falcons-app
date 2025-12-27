// frontend/src/pages/LoginPage/LoginPage.tsx
import React, { useState } from 'react';
import { auth } from '../lib/firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

// Certifique-se de que moveu o logo para: frontend/src/assets/
import falconsLogo from '../assets/falcons-logo.png';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setError(''); 

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // No novo App.tsx, o onAuthStateChanged detectará a mudança automaticamente.
        } catch (err) {
            const firebaseError = err as FirebaseError;
            console.error("Erro no login:", firebaseError.message);
            
            if (firebaseError.code === 'auth/invalid-credential') {
                setError('E-mail ou senha inválidos.');
            } else {
                setError('Ocorreu um erro. Tente novamente.');
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#1A1A1A] text-[#F5F5F5]">
            {/* Bloco 1: Header */}
            <header className="p-4 bg-[#252525] border-b border-[#333] flex justify-center items-center">
                <img src={falconsLogo} alt="Falcons Logo" className="h-8" />
            </header>

            {/* Bloco 2: Login Box */}
            <div className="grow p-6 flex flex-col justify-center 
                            md:grow-0 md:w-[90%] md:max-w-105 md:mx-auto md:my-20 
                            md:bg-[#252525] md:rounded-2xl md:p-10 md:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                
                <form onSubmit={handleLogin} className="flex flex-col text-left gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-sm text-[#a0a0a0]">E-mail</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu-email@usp.br"
                            className="p-4 rounded-lg border border-[#333] bg-[#333] text-[#F5F5F5] text-base focus:outline-none focus:border-[#FFD600]"
                            required
                        />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="text-sm text-[#a0a0a0]">Senha</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="p-4 rounded-lg border border-[#333] bg-[#333] text-[#F5F5F5] text-base focus:outline-none focus:border-[#FFD600]"
                            required
                        />
                    </div>
                    
                    {error && <p className="text-[#ffaaaa] text-sm text-center">{error}</p>}
                    
                    <button 
                        type="submit"
                        className="p-4 mt-4 bg-[#FFD600] text-[#1A1A1A] rounded-xl text-base font-bold cursor-pointer hover:bg-[#e6c200] transition-colors"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;