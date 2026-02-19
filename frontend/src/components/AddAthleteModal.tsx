import { useState } from 'react';
import { auth, functions } from '../lib/firebase';
import Modal from './Modal';
import { httpsCallable } from 'firebase/functions';
import { getIdToken } from 'firebase/auth';

interface AddAthleteModalProps {
    onClose: () => void;
    onAthleteAdded: () => void;
}

interface CreateAthleteData {
    nome: string;
    apelido: string;
    email: string;
    password?: string;
    authToken: string;
}

interface CreateAthleteResponse {
    status: string;
    message: string;
    uid: string;
}

const createAthleteFunction = httpsCallable<CreateAthleteData, CreateAthleteResponse>(functions, 'createAthlete');

const AddAthleteModal: React.FC<AddAthleteModalProps> = ({ onClose, onAthleteAdded }) => {
    const [nome, setNome] = useState('');
    const [apelido, setApelido] = useState(''); // Novo campo solicitado
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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

            const idToken = await getIdToken(auth.currentUser);

            // Chamada da função com a senha automática "falcons2026"
            await createAthleteFunction({
                nome,
                apelido,
                email,
                password: 'falcons2026',
                authToken: idToken
            });

            onAthleteAdded();
            handleStartClose();

        } catch (err: unknown) {
            console.error("Erro na Cloud Function:", err);
            const errorMessage = err instanceof Error ? err.message : "Erro ao cadastrar atleta.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={!isClosing}
            onClose={handleStartClose}
            title="Cadastrar Novo Atleta"
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                    <label htmlFor="nome" className="text-sm text-[#a0a0a0]">Nome Completo</label>
                    <input
                        id="nome"
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="CAASO Falcons"
                        className="bg-[#333] border border-[#444] p-3 rounded-xl text-white outline-none focus:border-[#FFD600] w-full"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="apelido" className="text-sm text-[#a0a0a0]">Apelido</label>
                    <input
                        id="apelido"
                        type="text"
                        value={apelido}
                        onChange={(e) => setApelido(e.target.value)}
                        placeholder="Cheers"
                        className="bg-[#333] border border-[#444] p-3 rounded-xl text-white outline-none focus:border-[#FFD600] w-full"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm text-[#a0a0a0]">E-mail Institucional</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemplo@usp.br"
                        className="bg-[#333] border border-[#444] p-3 rounded-xl text-white outline-none focus:border-[#FFD600] w-full"
                        required
                    />
                </div>

                <p className="text-xs text-[#a0a0a0] italic mt-2 text-center">
                    * A senha padrão para o primeiro acesso será: <strong className="text-white">falcons2026</strong>
                </p>

                {error && <p className="text-[#FF5555] text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full p-4 mt-2 bg-[#FFD600] text-[#1A1A1A] rounded-xl font-bold text-lg cursor-pointer disabled:bg-[#555] disabled:cursor-not-allowed hover:bg-[#e6c200] transition-colors active:scale-[0.98]"
                >
                    {isLoading ? 'Cadastrando...' : 'Cadastrar Atleta'}
                </button>
            </form>
        </Modal>
    );
};

export default AddAthleteModal;