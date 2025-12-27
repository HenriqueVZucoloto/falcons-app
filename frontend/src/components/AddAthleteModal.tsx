import React, { useState } from 'react';
import { X } from 'phosphor-react';
import { auth, functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { getIdToken } from 'firebase/auth';

interface AddAthleteModalProps {
    onClose: () => void;
    onAthleteAdded: () => void;
}

// Tipagem para a resposta da função (ajuste conforme seu retorno no backend)
interface CreateAthleteResponse {
    message: string;
    uid: string;
}

const createAthleteFunction = httpsCallable<any, CreateAthleteResponse>(functions, 'createAthlete');

const AddAthleteModal: React.FC<AddAthleteModalProps> = ({ onClose, onAthleteAdded }) => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Controle de animação de saída (igual ao SubmitPaymentModal)
    const [isClosing, setIsClosing] = useState(false);

    const handleStartClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!auth.currentUser) throw new Error("Usuário não está logado.");

            // Pegando o token para validação na Function
            const idToken = await getIdToken(auth.currentUser);

            await createAthleteFunction({ 
                nome, 
                email, 
                password,
                authToken: idToken 
            });

            onAthleteAdded();
            handleStartClose();

        } catch (err: any) {
            console.error("Erro na Cloud Function:", err);
            setError(err.message || "Erro ao cadastrar atleta."); 
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div 
            className={`fixed inset-0 z-50 flex flex-col bg-[#1A1A1A] transition-opacity duration-300 md:items-center md:justify-center p-0 md:p-4 ${
                isClosing ? 'opacity-0 md:bg-black/0' : 'opacity-100 md:bg-black/70'
            }`}
            onClick={handleStartClose}
        >
            <div 
                className={`w-full h-full bg-[#1A1A1A] flex flex-col md:h-auto md:max-w-125 md:bg-[#252525] md:rounded-2xl shadow-2xl ${
                    isClosing 
                        ? 'animate-[slideDown_0.3s_ease-in_forwards]' 
                        : 'animate-[slideUp_0.3s_ease-out_forwards]'
                } md:animate-none`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-6 border-b border-[#333]">
                    <h2 className="text-xl font-bold">Cadastrar Novo Atleta</h2>
                    <button onClick={handleStartClose} className="text-[#a0a0a0] cursor-pointer hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </header>

                <form className="p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="nome" className="text-sm text-[#a0a0a0]">Nome Completo</label>
                        <input 
                            id="nome" 
                            type="text" 
                            value={nome} 
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Nome do Atleta"
                            className="p-4 rounded-lg border border-[#333] bg-[#333] text-white focus:outline-none focus:border-[#FFD600]"
                            required
                        />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-sm text-[#a0a0a0]">E-mail Institucional</label>
                        <input 
                            id="email" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemplo@usp.br"
                            className="p-4 rounded-lg border border-[#333] bg-[#333] text-white focus:outline-none focus:border-[#FFD600]"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="text-sm text-[#a0a0a0]">Senha Temporária</label>
                        <input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="p-4 rounded-lg border border-[#333] bg-[#333] text-white focus:outline-none focus:border-[#FFD600]"
                            required
                        />
                    </div>
                    
                    {error && <p className="text-[#ffaaaa] text-sm text-center bg-red-500/10 p-2 rounded">{error}</p>}
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full p-4 mt-4 bg-[#FFD600] text-[#1A1A1A] rounded-xl font-bold text-lg cursor-pointer disabled:bg-[#555] disabled:cursor-not-allowed hover:bg-[#e6c200] transition-colors"
                    >
                        {isLoading ? 'Cadastrando...' : 'Cadastrar Atleta'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAthleteModal;