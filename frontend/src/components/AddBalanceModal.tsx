import React, { useState } from 'react';
import { XIcon, UploadSimpleIcon, PixLogoIcon, WalletIcon } from '@phosphor-icons/react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { UserProfile } from '../types';
import { formatCurrency } from '../utils/masks';

interface AddBalanceModalProps {
    user: UserProfile;
    onClose: () => void;
}

const AddBalanceModal: React.FC<AddBalanceModalProps> = ({ user, onClose }) => {
    const [valorDisplay, setValorDisplay] = useState(''); 
    const [valorRaw, setValorRaw] = useState(0);
    const [valorPix, setValorPix] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleStartClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { raw, display } = formatCurrency(e.target.value);
        setValorRaw(raw);
        setValorDisplay(display);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!valorRaw || valorRaw <= 0) {
            setError('Insira um valor válido.');
            return;
        }
        if (!file) return setError("Anexe o comprovante do PIX.");

        setIsLoading(true);
        try {
            const storageRef = ref(storage, `comprovantes/${user.uid}/SALDO_${Date.now()}`);
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadResult.ref);

            const functions = getFunctions();
            const enviar = httpsCallable(functions, 'enviarParaAnalise');
            
            await enviar({
                tipo: 'adicao_saldo',
                valorPix: valorRaw,
                valorSaldo: 0,
                urlComprovante: downloadURL,
                tituloCobranca: "Adição de Saldo"
            });

            onClose();
        } catch (err) {
            setError("Erro ao processar. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex flex-col bg-[#1A1A1A] transition-opacity duration-300 md:items-center md:justify-center p-0 md:p-4 ${isClosing ? 'opacity-0 md:bg-black/0' : 'opacity-100 md:bg-black/70'}`} onClick={onClose}>
            <div className={`w-full h-full bg-[#1A1A1A] flex flex-col md:h-auto md:max-w-125 md:bg-[#252525] md:rounded-2xl shadow-2xl ${isClosing ? 'animate-[slideDown_0.3s_ease-in_forwards]' : 'animate-[slideUp_0.3s_ease-out_forwards]'} md:animate-none`} onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-6 border-b border-[#333]">
                    <h2 className="text-xl font-bold text-white">Adicionar Saldo</h2>
                    <button onClick={handleStartClose} className="text-[#a0a0a0] cursor-pointer hover:text-white"><XIcon size={24} /></button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold flex items-center gap-2">
                            <WalletIcon size={18} className="text-[#FFD600]" />
                            Quanto você deseja adicionar?</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a0]">R$</span>
                            <input
                                type="text" // Text para aplicar máscara
                                inputMode="numeric" // Teclado numérico no celular
                                placeholder="0,00"
                                value={valorDisplay}
                                onChange={handleCurrencyChange}
                                className="w-full bg-[#333] border border-[#444] p-4 pl-12 rounded-xl text-white text-xl font-bold focus:border-[#FFD600] outline-none"
                            />
                        </div>
                    </div>

                    <label className="flex items-center justify-center gap-2 p-6 bg-[#333] border border-dashed border-[#555] rounded-xl cursor-pointer hover:bg-[#444]">
                        <UploadSimpleIcon size={24} className="text-[#FFD600]" />
                        <span className="text-sm">{file ? file.name : "Anexar Comprovante do PIX"}</span>
                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>

                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                    <button disabled={isLoading} className="w-full p-4 bg-[#FFD600] text-[#1A1A1A] rounded-xl font-bold hover:bg-[#e6c200] disabled:bg-[#555]">
                        {isLoading ? "Enviando..." : "Confirmar Envio"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddBalanceModal;