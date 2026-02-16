import React, { useState } from 'react';
import { UploadSimpleIcon, WalletIcon, PixLogoIcon } from '@phosphor-icons/react';
import Modal from './Modal';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { UserProfile } from '../types';
import { formatCurrency } from '../utils/masks';

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
    const [valorSaldoDisplay, setValorSaldoDisplay] = useState('');
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
        const { raw, display } = formatCurrency(e.target.value);

        if (raw > valorTotalCobranca && valorTotalCobranca < saldoDisponivel) {
            // Se passar do total da conta, trava no total
            const totalFormatado = valorTotalCobranca.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            setValorSaldoUtilizado(valorTotalCobranca);
            setValorSaldoDisplay(totalFormatado);
            return;
        }

        if (raw > saldoDisponivel && saldoDisponivel < valorTotalCobranca) {
            // Se passar do saldo, trava o total e avisa o erro
            setError(`Limite disponível: R$ ${saldoDisponivel.toLocaleString('pt-BR')}`);
            setValorSaldoUtilizado(saldoDisponivel);
            setValorSaldoDisplay(saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
            return;
        } else {
            setError('');
        }

        setValorSaldoUtilizado(raw);
        setValorSaldoDisplay(display);
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
            const functions = getFunctions();

            // CENÁRIO 1: PAGAMENTO 100% SALDO (Automático e Imediato)
            if (valorSaldoUtilizado === valorTotalCobranca) {
                const pagarTotal = httpsCallable(functions, 'pagarComSaldoTotal');
                await pagarTotal({ cobrancaId: paymentItem.id });
                console.log("Pago automaticamente com saldo!");
            }

            // CENÁRIO 2: PAGAMENTO MISTO OU 100% PIX (Vai para Análise)
            else {
                let downloadURL = "";
                if (file) {
                    const newFileName = `[${user.nome}]-${paymentItem.name.replace(/ /g, '_')}-${Date.now()}`;
                    const storageRef = ref(storage, `comprovantes/${user.uid}/${newFileName}`);
                    const uploadResult = await uploadBytes(storageRef, file);
                    downloadURL = await getDownloadURL(uploadResult.ref);
                }

                const enviarAnalise = httpsCallable(functions, 'enviarParaAnalise');
                await enviarAnalise({
                    cobrancaId: paymentItem.id,
                    tituloCobranca: paymentItem.name,
                    valorSaldo: valorSaldoUtilizado,
                    valorPix: valorRestantePix,
                    urlComprovante: downloadURL
                });
                console.log("Enviado para análise do Admin!");
            }

            handleStartClose();
        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Erro ao processar pagamento.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={!isClosing}
            onClose={handleStartClose}
            title={`Pagamento: ${paymentItem.name}`}
        >
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex justify-between items-center bg-[#333] p-4 rounded-xl border border-[#444]">
                    <span className="text-[#a0a0a0]">Valor Total:</span>
                    <span className="text-xl font-bold text-white">R$ {paymentItem.amount}</span>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold flex items-center gap-2 text-white">
                        <WalletIcon size={18} className="text-[#FFD600]" />
                        Usar Saldo (Disponível: R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                    </label>
                    <input
                        type="text" // Text para aplicar máscara
                        inputMode="numeric"
                        placeholder="0,00"
                        value={valorSaldoDisplay}
                        onChange={handleSaldoChange}
                        className="bg-[#333] border border-[#444] p-3 rounded-xl text-white focus:border-[#FFD600] outline-none w-full"
                    />
                </div>

                {valorRestantePix > 0 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2 text-white"><PixLogoIcon size={18} className="text-[#00BFA5]" /> Restante no PIX:</span>
                            <span className="font-bold text-[#00BFA5]">R$ {valorRestantePix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <label htmlFor="file-upload" className="flex items-center justify-center gap-2 p-5 bg-[#333] border border-dashed border-[#444] rounded-xl text-sm cursor-pointer hover:bg-[#3A3A3A] hover:border-[#FFD600] transition-colors group">
                            <UploadSimpleIcon size={20} className="text-[#FFD600] group-hover:scale-110 transition-transform" />
                            <span className="text-[#a0a0a0] group-hover:text-white transition-colors">{file ? file.name : 'Anexar comprovante do PIX'}</span>
                        </label>
                        <input id="file-upload" type="file" onChange={handleFileChange} className="hidden" />
                    </div>
                )}

                {error && <p className="text-[#FF5555] text-xs text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}

                <button type="submit" disabled={isLoading} className="w-full p-4 mt-2 bg-[#FFD600] text-[#1A1A1A] rounded-xl font-bold text-lg cursor-pointer hover:bg-[#e6c200] transition-colors active:scale-[0.98] disabled:bg-[#555] disabled:cursor-not-allowed">
                    {isLoading ? 'Processando...' : 'Confirmar Pagamento'}
                </button>
            </form>
        </Modal>
    );
};

export default SubmitPaymentModal;