import React from 'react';
import { X, Clock, Wallet, PixLogo } from '@phosphor-icons/react'; // Ajuste conforme seus imports
import type { Payment } from '../types';

interface AnalysisListModalProps {
    payments: Payment[];
    onClose: () => void;
}

const AnalysisListModal: React.FC<AnalysisListModalProps> = ({ payments, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
            <div className="w-full max-w-120 bg-[#252525] rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-6 border-b border-[#333]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock size={24} className="text-[#FFD600]" />
                        Em Análise
                    </h2>
                    <button onClick={onClose} className="text-[#a0a0a0] hover:text-white cursor-pointer">
                        <X size={24} />
                    </button>
                </header>

                <div className="p-6 max-h-96 overflow-y-auto flex flex-col gap-4">
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

                <footer className="p-6 bg-[#1A1A1A] text-center">
                    <button 
                        onClick={onClose}
                        className="w-full p-3 bg-[#333] text-white rounded-xl font-bold hover:bg-[#444] transition-colors cursor-pointer"
                    >
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AnalysisListModal;