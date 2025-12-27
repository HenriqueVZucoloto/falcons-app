import React, { useState } from 'react';
import { XIcon, UploadSimpleIcon, WalletIcon, PixLogoIcon } from '@phosphor-icons/react';
import { storage, db } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
    const [valorSaldoUtilizado, setValorSaldoUtilizado] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const valorTotalCobranca = parseFloat(paymentItem.amount.replace('.', '').replace(',', '.'));
    const valorRestantePix = valorTotalCobranca - valorSaldoUtilizado;

    const handleStartClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleSaldoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        if (val > valorTotalCobranca) {
            setValorSaldoUtilizado(valorTotalCobranca);
            return;
        }
        else if (val > saldoDisponivel) {
            setError(`Limite disponível: R$ ${saldoDisponivel.toLocaleString('pt-BR')}`);
            return;
        }
        setError('');
        setValorSaldoUtilizado(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (valorRestantePix > 0 && !file) {
            setError('Por favor, anexe o comprovante do PIX.');
            return;
        }

        setIsLoading(true);

        try {
            let downloadURL = "";

            if (file) {
                const newFileName = `[${user.nome}]-${paymentItem.name.replace(/ /g, '_')}-${Date.now()}`;
                const storageRef = ref(storage, `comprovantes/${user.uid}/${newFileName}`);
                const uploadResult = await uploadBytes(storageRef, file);
                downloadURL = await getDownloadURL(uploadResult.ref);
            }

            await addDoc(collection(db, "pagamentos"), {
                atletaId: user.uid,
                atletaNome: user.nome,
                tituloCobranca: paymentItem.name,
                tipo: 'pagamento_cobranca',
                cobrancaId: paymentItem.id,
                valorTotal: valorTotalCobranca,
                valorPix: valorRestantePix,
                valorSaldo: valorSaldoUtilizado,
                statusPagamento: "em análise",
                urlComprovante: downloadURL || null,
                dataEnvio: serverTimestamp(),
            });

            handleStartClose();
        } catch (err) {
            console.error(err);
            setError("Erro ao enviar. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex flex-col bg-[#1A1A1A] transition-opacity duration-300 md:items-center md:justify-center p-0 md:p-4 ${isClosing ? 'opacity-0 md:bg-black/0' : 'opacity-100 md:bg-black/70'}`} onClick={handleStartClose}>
            <div className={`w-full h-full bg-[#1A1A1A] flex flex-col md:h-auto md:max-w-125 md:bg-[#252525] md:rounded-2xl shadow-2xl ${isClosing ? 'animate-[slideDown_0.3s_ease-in_forwards]' : 'animate-[slideUp_0.3s_ease-out_forwards]'} md:animate-none`} onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-6 border-b border-[#333]">
                    <h2 className="text-xl font-bold text-white">Pagamento: {paymentItem.name}</h2>
                    <button onClick={handleStartClose} className="text-[#a0a0a0] cursor-pointer hover:text-white"><XIcon size={24} /></button>
                </header>

                <form className="p-6 flex flex-col gap-5" onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center bg-[#333] p-4 rounded-xl border border-[#444]">
                        <span className="text-[#a0a0a0]">Valor Total:</span>
                        <span className="text-xl font-bold text-white">R$ {paymentItem.amount}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold flex items-center gap-2">
                            <WalletIcon size={18} className="text-[#FFD600]" /> 
                            Usar Saldo (Disponível: R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                        </label>
                        <input 
                            type="number" 
                            step="0.01"
                            value={valorSaldoUtilizado}
                            onChange={handleSaldoChange}
                            className="bg-[#333] border border-[#444] p-3 rounded-lg text-white focus:border-[#FFD600] outline-none"
                        />
                    </div>

                    {valorRestantePix > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2"><PixLogoIcon size={18} className="text-[#00BFA5]" /> Restante no PIX:</span>
                                <span className="font-bold text-[#00BFA5]">R$ {valorRestantePix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            
                            <label htmlFor="file-upload" className="flex items-center justify-center gap-2 p-4 bg-[#333] border border-dashed border-[#555] rounded-xl text-sm cursor-pointer hover:bg-[#444] transition-colors">
                                <UploadSimpleIcon size={20} className="text-[#FFD600]" />
                                <span>{file ? file.name : 'Anexar comprovante do PIX'}</span>
                            </label>
                            <input id="file-upload" type="file" onChange={handleFileChange} className="hidden" />
                        </div>
                    )}

                    {error && <p className="text-[#ffaaaa] text-xs text-center bg-red-500/10 p-2 rounded">{error}</p>}
                    
                    <button type="submit" disabled={isLoading} className="w-full p-4 mt-2 bg-[#FFD600] text-[#1A1A1A] rounded-xl font-bold text-lg cursor-pointer hover:bg-[#e6c200] transition-colors">
                        {isLoading ? 'Processando...' : 'Confirmar Pagamento'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitPaymentModal;