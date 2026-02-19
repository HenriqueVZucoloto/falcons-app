import { Wallet, PixLogo } from '@phosphor-icons/react';
import type { Payment } from '../types';
import Modal from './Modal';

interface AnalysisListModalProps {
    payments: Payment[];
    onClose: () => void;
}

const AnalysisListModal: React.FC<AnalysisListModalProps> = ({ payments, onClose }) => {
    return (
        <Modal isOpen={true} onClose={onClose} title="Em Análise">
            <div className="flex flex-col gap-4">
                <p className="text-[#a0a0a0] text-sm">
                    Estes valores já foram enviados e aguardam a conferência do administrador.
                </p>

                {payments.map(payment => (
                    <div key={payment.id} className="bg-[#333] p-4 rounded-xl border border-[#444] flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <span className="font-semibold text-white">{payment.tituloCobranca || 'Adição de Saldo'}</span>
                            <span className="text-xs text-[#a0a0a0]">
                                {payment.dataEnvio?.toDate().toLocaleDateString('pt-BR')}
                            </span>
                        </div>

                        <div className="flex gap-4 mt-1">
                            {payment.valorSaldo > 0 && (
                                <div className="flex items-center gap-1 text-xs text-[#FFD600]">
                                    <Wallet size={14} />
                                    R$ {payment.valorSaldo.toLocaleString('pt-BR')} (Saldo)
                                </div>
                            )}
                            {payment.valorPix > 0 && (
                                <div className="flex items-center gap-1 text-xs text-[#00BFA5]">
                                    <PixLogo size={14} />
                                    R$ {payment.valorPix.toLocaleString('pt-BR')} (PIX)
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default AnalysisListModal;