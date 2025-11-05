// src/pages/AdminPage/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import './AdminPage.css'; // Vamos criar este arquivo para estilizar
import { db } from '../../lib/firebase'; // Nosso conector do Firestore
import { collection, getDocs } from 'firebase/firestore'; // Funções para buscar uma coleção

const AdminPage = () => {
    // 1. States para guardar a lista de atletas e controlar o loading
    const [athletes, setAthletes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 2. useEffect para buscar os dados APENAS UMA VEZ, quando a página carregar
    useEffect(() => {
        const fetchAthletes = async () => {
            try {
                // Pega a referência da nossa coleção "usuarios"
                const usersCollectionRef = collection(db, "usuarios");
                
                // Executa a consulta (puxa todos os documentos)
                const querySnapshot = await getDocs(usersCollectionRef);
                
                // 3. Mapeia os resultados e formata para o nosso state
                const athletesList = querySnapshot.docs.map(doc => ({
                    id: doc.id,       // O ID do documento (que é o User UID)
                    ...doc.data() // Pega o resto dos dados (ex: { roles: [...] })
                }));
                
                setAthletes(athletesList); // Guarda a lista no state

            } catch (error) {
                console.error("Erro ao buscar usuários: ", error);
            } finally {
                setIsLoading(false); // Termina o loading (mesmo se der erro)
            }
        };

        fetchAthletes();
    }, []); // O array vazio [] garante que isso rode só uma vez

    // Ação para o futuro: navegar para a página de detalhes
    const handleUserClick = (athleteName) => {
        console.log("Clicou no usuário:", athleteName);
        // No futuro: navigate(`/admin/usuario/${athleteId}`);
    };

    // 4. A parte visual (o "Render")
    return (
        <div className="admin-container">
            <h1>Painel do Administrador</h1>
            
            <section className="admin-section">
                <div className="section-header">
                    <h2>Gestão de Usuários</h2>
                    <button className="add-button">+ Novo Atleta</button>
                </div>
                
                {isLoading ? (
                    <p>Carregando atletas...</p>
                ) : (
                    // 1. Adeus <table>, olá <div>!
                    <div className="user-list">
                        {athletes.map(athlete => (
                            // 2. Cada item é um <button> clicável
                            <button 
                                key={athlete.id} 
                                className="user-card" 
                                onClick={() => handleUserClick(athlete.nome)}
                            >
                                {/* 3. Informações da esquerda (Nome/Email) */}
                                <div className="user-card-info">
                                    <span className="user-name">{athlete.nome || 'Sem Nome'}</span>
                                    <span className="user-email">{athlete.email || 'Sem E-mail'}</span>
                                </div>
                                
                                {/* 4. Informações da direita (Saldo) */}
                                <div className="user-card-balance">
                                    <span className="balance-label">Saldo</span>
                                    {/* Usamos .toFixed(2) para formatar como dinheiro 
                                      e .replace('.', ',') para o formato brasileiro
                                    */}
                                    <span className="balance-value">
                                      R$ { (athlete.saldo || 0).toFixed(2).replace('.', ',') }
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminPage;