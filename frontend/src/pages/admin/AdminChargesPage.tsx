import React, { useState } from 'react';
import { PlusIcon } from '@phosphor-icons/react';
import CreateChargeModal from '../../components/CreateChargeModal';
import { semearDadosTeste } from '../../lib/seed';

const AdminChargesPage: React.FC = () => {
    const [isCreateChargeModalOpen, setIsCreateChargeModalOpen] = useState(false);

    return (
        <div className="flex flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold text-white">Cobranças</h1>
                <p className="text-[#a0a0a0]">Mensalidades e taxas extras.</p>
            </header>

            <section className="bg-[#252525] p-6 rounded-2xl border border-[#333] flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-white">Nova Cobrança</h2>
                    <p className="text-sm text-[#a0a0a0] mt-1">Crie lançamentos para todo o time ou atletas específicos.</p>
                </div>
                <button
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#FFD600] text-[#1A1A1A] px-6 py-3 rounded-xl font-bold hover:bg-[#e6c200] transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:shadow-[#FFD600]/40"
                    onClick={() => setIsCreateChargeModalOpen(true)}
                >
                    <PlusIcon size={20} weight="bold" />
                    Criar Cobrança
                </button>
            </section>

            {/* Placeholder para lista futura de cobranças */}
            <div className="p-10 border-2 border-dashed border-[#333] rounded-2xl text-center text-[#555]">
                <p>O histórico de cobranças criadas aparecerá aqui em breve.</p>
            </div>

            {/* Botão DEV (Mudei pra cá pois é relacionado a gerar dados) */}
            <div className="mt-4 pt-4 border-t border-[#333]">
                <button
                    onClick={() => semearDadosTeste("SEU_UID_AQUI_OU_AUTOMATICO")}
                    className="text-xs text-[#555] hover:text-red-500 transition-colors"
                >
                    [DEV] Semear Dados de Teste
                </button>
            </div>

            {isCreateChargeModalOpen && (
                <CreateChargeModal
                    onClose={() => setIsCreateChargeModalOpen(false)}
                    onSuccess={() => {
                        alert("Cobranças criadas e enviadas para os atletas!");
                    }}
                />
            )}
        </div>
    );
};

export default AdminChargesPage;