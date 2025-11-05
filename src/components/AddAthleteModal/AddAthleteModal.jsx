// src/components/AddAthleteModal/AddAthleteModal.jsx
import React, { useState } from 'react';
import './AddAthleteModal.css';
import { X } from 'phosphor-react';

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
            // Por enquanto, vamos simular
            console.log("Chamando a função de backend para criar:", { nome, email, password });
            // await criarAtletaFuncao({ nome, email, password });
            
            // Se deu certo:
            // onAthleteAdded(); // Avisa o AdminPage para recarregar a lista
            // onClose(); // Fecha o modal
            setError('Funcionalidade ainda em construção!'); // Placeholder

        } catch (err) {
            console.error(err);
            setError('Erro ao criar atleta.');
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