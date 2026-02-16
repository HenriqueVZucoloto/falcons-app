import React, { useState } from 'react';
import { UploadSimpleIcon, CopyIcon, QrCodeIcon, WalletIcon } from '@phosphor-icons/react';
import Modal from './Modal';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { UserProfile } from '../types';
import { formatCurrency } from '../utils/masks';
import { generatePixCopyPaste } from '../utils/pix';
import { FINANCE_CONFIG } from '../config/finance';

interface AddBalanceModalProps {
    onClose: () => void;
    user: UserProfile;
}

const AddBalanceModal: React.FC<AddBalanceModalProps> = ({ onClose, user }) => {
    const [amount, setAmount] = useState(0);
    const [displayAmount, setDisplayAmount] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pixCode, setPixCode] = useState('');
    const [showPix, setShowPix] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleStartClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { raw, display } = formatCurrency(e.target.value);
        setAmount(raw);
        setDisplayAmount(display);
        setError('');

        if (raw > 0) {
            // Ordem: chave, nome, cidade, valor, id
            const code = generatePixCopyPaste(
                FINANCE_CONFIG.PIX_KEY,
                FINANCE_CONFIG.PIX_MERCHANT_NAME,
                FINANCE_CONFIG.PIX_MERCHANT_CITY,
                raw,
                `${FINANCE_CONFIG.PIX_TXID_PREFIX}-SALDO-${user.uid.substring(0, 4)}`
            );
            setPixCode(code);
            setShowPix(true);
        } else {
            setShowPix(false);
            setPixCode('');
        }
    };

    const handleCopyPix = () => {
        if (pixCode) {
            navigator.clipboard.writeText(pixCode);
            alert("Código PIX copiado!");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || amount <= 0) {
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
                valorPix: amount,
                valorSaldo: 0,
                urlComprovante: downloadURL,
                tituloCobranca: "Adição de Saldo"
            });

            handleStartClose();
        } catch (err) {
            console.error(err);
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
                        Quanto você deseja adicionar?
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a0] font-medium">R$</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0,00"
                            value={displayAmount}
                            onChange={handleAmountChange}
                            className="w-full bg-[#333] border border-[#444] p-3 pl-12 rounded-xl text-white text-xl font-bold focus:border-[#FFD600] outline-none"
                        />
                    </div>
                </div>

                {showPix && amount > 0 && (
                    <div className="bg-[#1A1A1A] p-4 rounded-xl border border-dashed border-[#FFD600]/50 flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-2 text-[#FFD600] font-bold text-sm uppercase tracking-wider">
                            <QrCodeIcon size={20} />
                            Pague via PIX
                        </div>
                        <p className="text-[#a0a0a0] text-xs text-center px-4">
                            Utilize o código abaixo para pagar exatamente <strong>R$ {displayAmount}</strong>.
                        </p>
                        <div className="w-full flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={pixCode}
                                className="w-full bg-black/30 border border-[#333] rounded-lg px-3 py-2 text-xs text-[#777] font-mono truncate"
                            />
                            <button
                                type="button"
                                onClick={handleCopyPix}
                                className="bg-[#FFD600] text-[#1A1A1A] p-2 rounded-lg font-bold hover:bg-[#e6c200] transition-colors cursor-pointer"
                                title="Copiar"
                            >
                                <CopyIcon size={20} />
                            </button>
                        </div>
                    </div>
                )}

                <label className="flex items-center justify-center gap-2 p-6 bg-[#333] border border-dashed border-[#444] rounded-xl cursor-pointer hover:bg-[#3A3A3A] hover:border-[#FFD600] transition-colors group">
                    <UploadSimpleIcon size={24} className="text-[#FFD600] group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-[#a0a0a0] group-hover:text-white transition-colors">{file ? file.name : "Anexar Comprovante do PIX"}</span>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                </label>

                {error && <p className="text-[#FF5555] text-xs text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}

                <button disabled={isLoading} className="w-full p-4 bg-[#FFD600] text-[#1A1A1A] cursor-pointer rounded-xl font-bold text-lg hover:bg-[#e6c200] disabled:bg-[#555] disabled:cursor-not-allowed transition-colors active:scale-[0.98]">
                    {isLoading ? "Enviando..." : "Confirmar Envio"}
                </button>
            </form>
        </Modal>
    );
};

export default AddBalanceModal;