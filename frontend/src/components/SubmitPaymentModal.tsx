import React, { useState } from 'react';
import { X, UploadSimple } from 'phosphor-react';
import { storage, db } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Mudança aqui
import type { UserProfile } from '../types';

interface FormattedPayment {
    id: string;
    name: string;
    amount: string;
    dueDate: string;
}

interface SubmitPaymentModalProps {
    user: UserProfile;
    paymentItem: FormattedPayment;
    onClose: () => void;
    saldoDisponivel: number;
}

const SubmitPaymentModal: React.FC<SubmitPaymentModalProps> = ({ user, paymentItem, onClose, saldoDisponivel }) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleStartClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!file) {
            setError('Por favor, anexe um comprovante.');
            return;
        }

        setIsLoading(true);

        try {
            // PASSO 1: Upload para o Storage
            const paymentNameForFile = paymentItem.name.replace(/ /g, '_'); 
            const newFileName = `[${user.nome}]-${paymentNameForFile}-${Date.now()}`;
            const storagePath = `comprovantes/${user.uid}/${newFileName}`;

            const storageRef = ref(storage, storagePath);
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadResult.ref);

            // PASSO 2: Criar NOVO documento em 'pagamentos' (Não mais updateDoc)
            // Nota: Por enquanto, estamos assumindo pagamento TOTAL via PIX. 
            // No próximo passo, adicionaremos o campo para o Henrique escolher quanto do saldo usar.
            const valorNumerico = parseFloat(paymentItem.amount.replace('.', '').replace(',', '.'));

            await addDoc(collection(db, "pagamentos"), {
                atletaId: user.uid,
                atletaNome: user.nome,
                tituloCobranca: paymentItem.name,
                tipo: 'pagamento_cobranca',
                cobrancaId: paymentItem.id, // O ID que veio da Home é o ID da cobrança
                valorTotal: valorNumerico,
                valorPix: valorNumerico,
                valorSaldo: 0, // Ajustaremos isso na UI do Modal depois
                statusPagamento: "em análise",
                urlComprovante: downloadURL,
                dataEnvio: serverTimestamp(),
            });

            console.log("Pagamento criado com sucesso!");
            handleStartClose();

        } catch (err) {
            console.error("Erro ao enviar pagamento: ", err);
            setError("Erro ao enviar comprovante. Tente novamente.");
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
                    <h2 className="text-xl font-bold text-white">Pagar: {paymentItem.name}</h2>
                    <button 
                        onClick={handleStartClose} 
                        className="text-[#a0a0a0] cursor-pointer hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </header>

                <form className="p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="bg-[#333] p-4 rounded-xl border border-[#444]">
                        <span className="text-[#a0a0a0] text-sm block">Valor da Pendência</span>
                        <span className="text-[#FFD600] text-2xl font-bold">R$ {paymentItem.amount}</span>
                    </div>

                    <p className="text-[#a0a0a0] text-sm mt-2">Anexe o comprovante do PIX correspondente ao valor total.</p>
                    
                    <label 
                        htmlFor="file-upload" 
                        className="flex items-center justify-center gap-2 p-6 bg-[#333] border border-dashed border-[#555] rounded-xl text-[#F5F5F5] cursor-pointer hover:bg-[#444] transition-colors"
                    >
                        <UploadSimple size={24} className="text-[#FFD600]" />
                        <span className="font-medium">{file ? file.name : 'Escolher arquivo'}</span>
                    </label>
                    
                    <input 
                        id="file-upload" 
                        type="file" 
                        accept="image/png, image/jpeg, application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    
                    {error && <p className="text-[#ffaaaa] text-sm text-center bg-red-500/10 p-2 rounded">{error}</p>}
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full p-4 mt-2 bg-[#FFD600] text-[#1A1A1A] rounded-xl font-bold text-lg cursor-pointer disabled:bg-[#555] disabled:cursor-not-allowed hover:bg-[#e6c200] transition-colors"
                    >
                        {isLoading ? 'Enviando...' : 'Confirmar Pagamento'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitPaymentModal;