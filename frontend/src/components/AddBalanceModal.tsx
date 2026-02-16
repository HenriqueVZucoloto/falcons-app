import React, { useState } from 'react';
import { UploadSimpleIcon, WalletIcon } from '@phosphor-icons/react';
import Modal from './Modal';
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
        } catch {
            setError("Erro ao processar. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={!isClosing}
            onClose={handleStartClose}
            title="Adicionar Saldo"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold flex items-center gap-2 text-white">
                        <WalletIcon size={18} className="text-[#FFD600]" />
                        Quanto você deseja adicionar?</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a0] font-medium">R$</span>
                        <input
                            type="text" // Text para aplicar máscara
                            inputMode="numeric" // Teclado numérico no celular
                            placeholder="0,00"
                            value={valorDisplay}
                            onChange={handleCurrencyChange}
                            className="w-full bg-[#333] border border-[#444] p-3 pl-12 rounded-xl text-white text-xl font-bold focus:border-[#FFD600] outline-none"
                        />
                    </div>
                </div>

                <label className="flex items-center justify-center gap-2 p-6 bg-[#333] border border-dashed border-[#444] rounded-xl cursor-pointer hover:bg-[#3A3A3A] hover:border-[#FFD600] transition-colors group">
                    <UploadSimpleIcon size={24} className="text-[#FFD600] group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-[#a0a0a0] group-hover:text-white transition-colors">{file ? file.name : "Anexar Comprovante do PIX"}</span>
                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>

                {error && <p className="text-[#FF5555] text-xs text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}

                <button disabled={isLoading} className="w-full p-4 bg-[#FFD600] text-[#1A1A1A] rounded-xl font-bold text-lg hover:bg-[#e6c200] disabled:bg-[#555] disabled:cursor-not-allowed transition-colors active:scale-[0.98]">
                    {isLoading ? "Enviando..." : "Confirmar Envio"}
                </button>
            </form>
        </Modal>
    );
};

export default AddBalanceModal;