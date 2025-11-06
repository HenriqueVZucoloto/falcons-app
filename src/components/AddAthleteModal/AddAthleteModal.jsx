// src/components/AddAthleteModal/AddAthleteModal.jsx
import React, { useState } from 'react';
import './AddAthleteModal.css';
import { X } from 'phosphor-react';
// 1. IMPORTE AS FERRAMENTAS DO FIREBASE FUNCTIONS
import { auth, functions } from '../../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { getIdToken } from 'firebase/auth'; // <-- 1. IMPORTE O 'getIdToken'

// 2. PEGUE A REFERÊNCIA DA SUA FUNÇÃO NA NUVEM
const createAthleteFunction = httpsCallable(functions, 'createAthlete');

// Recebe a função 'onClose' para fechar e 'onAthleteAdded' para atualizar a lista
const AddAthleteModal = ({ onClose, onAthleteAdded }) => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Validação simples (aquela que discutimos)
        // if (!email.endsWith('@usp.br')) { // Adicione seu domínio institucional
        //     setError('O e-mail deve ser institucional (ex: @usp.br)');
        //     setIsLoading(false);
        //     return;
        // }

        // =============================================
        // AQUI VAI ENTRAR A CHAMADA DA CLOUD FUNCTION (PASSO 2)
        // =============================================
        try {
            // 1. CHECAGEM RÁPIDA
            if (!auth.currentUser) {
                // Se o usuário não estiver logado (o que não deve acontecer), pare aqui.
                console.error("Usuário é nulo no momento da chamada!");
                throw new Error("Usuário não está logado.");
            }

            // 2. DEFINA O TOKEN FORA (no escopo principal do try)
            const idToken = await getIdToken(auth.currentUser);
            console.log("CONSEGUI O TOKEN DE ID:", idToken);

            // 3. AGORA SIM, CHAME A FUNÇÃO
            // O 'idToken' existe e é visível aqui.
            const result = await createAthleteFunction({ 
                nome: nome, 
                email: email, 
                password: password,
                authToken: idToken 
            });

            console.log("Resultado da função:", result.data);
            onAthleteAdded();
            onClose();

        } catch (err) {
            console.error(err);
            setError(err.message); 
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Cadastrar Novo Atleta</h2>
                    <button onClick={onClose} className="close-button">
                        <X size={24} />
                    </button>
                </header>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <label htmlFor="nome">Nome Completo</label>
                    <input 
                        id="nome" 
                        type="text" 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Nome do Atleta"
                    />
                    
                    <label htmlFor="email">E-mail Institucional</label>
                    <input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemplo@usp.br"
                    />

                    <label htmlFor="password">Senha Temporária</label>
                    <input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                    />
                    
                    {error && <p className="error-message">{error}</p>}
                    
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Cadastrando...' : 'Cadastrar Atleta'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAthleteModal;