import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { UserProfile } from '../../types';
import { PlusIcon } from '@phosphor-icons/react';
import AddAthleteModal from '../../components/AddAthleteModal';

const AdminAthletesPage: React.FC = () => {
    const [athletes, setAthletes] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchAthletes = async () => {
            setIsLoading(true);
            try {
                const usersCollectionRef = collection(db, "usuarios");
                const usersSnapshot = await getDocs(usersCollectionRef);
                const athletesList = usersSnapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                })) as UserProfile[];
                setAthletes(athletesList);
            } catch (error) {
                console.error("Erro ao buscar atletas: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAthletes();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Atletas</h1>
                    <p className="text-[#a0a0a0]">Gerenciar elenco e saldos.</p>
                </div>
                <button
                    className="flex items-center gap-2 bg-[#FFD600] text-[#1A1A1A] px-6 py-3 rounded-xl font-bold hover:bg-[#e6c200] transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:shadow-[#FFD600]/40"
                    onClick={() => setIsModalOpen(true)}
                >
                    <PlusIcon size={20} weight="bold" />
                    Novo Atleta
                </button>
            </header>

            <section className="bg-[#252525] p-6 rounded-2xl border border-[#333]">
                {isLoading ? (
                    <p className="text-[#a0a0a0] animate-pulse">Carregando atletas...</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {athletes.map(athlete => (
                            <div
                                key={athlete.uid}
                                className="flex flex-col md:flex-row justify-between items-start md:items-center w-full bg-[#333] p-4 px-6 rounded-xl border border-[#444] hover:border-[#FFD600] transition-all group gap-4 md:gap-0"
                            >
                                <div className="flex flex-col text-left">
                                    <span className="font-semibold text-white text-lg group-hover:text-[#FFD600]">{athlete.nome || 'Sem Nome'}</span>
                                    <span className="text-sm text-[#a0a0a0]">{athlete.email || 'Sem E-mail'}</span>
                                </div>

                                <div className="flex flex-col items-start md:items-end w-full md:w-auto border-t border-[#444] md:border-none pt-2 md:pt-0 mt-2 md:mt-0">
                                    <span className="text-[10px] text-[#a0a0a0] uppercase tracking-widest">Saldo Atual</span>
                                    <span className={`font-bold text-xl ${athlete.saldo && athlete.saldo < 0 ? 'text-red-500' : 'text-[#FFD600]'}`}>
                                        R$ {(athlete.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {isModalOpen && (
                <AddAthleteModal
                    onClose={() => setIsModalOpen(false)}
                    onAthleteAdded={() => {
                        console.log("Atleta cadastrado!");
                        // Idealmente chamar o fetchAthletes() aqui novamente
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export default AdminAthletesPage;