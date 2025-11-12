// src/components/SubmitPaymentModal/SubmitPaymentModal.jsx
import React, { useState } from 'react';
import './SubmitPaymentModal.css';
import { X, UploadSimple } from 'phosphor-react';
import { storage, db } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore'; // <-- 1. IMPORTE O 'getIdToken'

const SubmitPaymentModal = ({ user, paymentItem, onClose }) => {
    const [file, setFile] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!file) {
            setError('Por favor, anexe um comprovante.');
            return;
        }

        setIsLoading(true);

        try {
            // 4. PASSO 1: Fazer o upload para o Firebase Storage

            // Limpa o nome do pagamento para usar no arquivo
            const paymentNameForFile = paymentItem.name.replace(/ /g, '_'); 
            // O novo nome do arquivo: [Nome do Usuário] - [Nome do Pagamento] - [ID do Pagamento]
            const newFileName = `[${user.nome}]-${paymentNameForFile}-${paymentItem.id}`;
            // O caminho do storage agora é muito mais legível
            const storagePath = `comprovantes/${user.uid}/${newFileName}`;

            const storageRef = ref(storage, storagePath);
            const uploadResult = await uploadBytes(storageRef, file);
            
            // 5. PASSO 2: Pegar a URL do arquivo que acabamos de enviar
            const downloadURL = await getDownloadURL(uploadResult.ref);

            // 6. PASSO 3: Atualizar o documento no Firestore
            const paymentDocRef = doc(db, "pagamentos", paymentItem.id);
            await updateDoc(paymentDocRef, {
                statusPagamento: "em análise", // O seu novo status!
                urlComprovante: downloadURL,
                dataEnvio: new Date(), // Salva a data de hoje
                atletaNome: user.nome, // Salva o nome do atleta
            });

            // 7. DEU CERTO!
            console.log("Pagamento enviado para análise!");
            onClose(); // Fecha o modal

        } catch (err) {
            console.error("Erro ao enviar pagamento: ", err);
            setError("Erro ao enviar comprovante. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    {/* 7. Título dinâmico */}
                    <h2>Pagar: {paymentItem.name}</h2>
                    <button onClick={onClose} className="close-button">
                        <X size={24} />
                    </button>
                </header>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <p>Anexe o comprovante de pagamento (JPG, PNG ou PDF).</p>
                    
                    {/* 8. O novo formulário de upload */}
                    <label htmlFor="file-upload" className="file-upload-label">
                        <UploadSimple size={20} />
                        <span>{file ? file.name : 'Escolher arquivo'}</span>
                    </label>
                    <input 
                        id="file-upload" 
                        type="file" 
                        accept="image/png, image/jpeg, application/pdf"
                        onChange={handleFileChange}
                    />
                    
                    {error && <p className="error-message">{error}</p>}
                    
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Enviando...' : 'Confirmar Pagamento'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitPaymentModal;

// refactor(admin): improve data readability in storage and firestore

// Adds 'atletaNome' to the payment document in Firestore and includes the athlete's name in the Storage filename.

// This makes it significantly easier for an admin to identify which user a payment
// or file belongs to directly from the Firebase console, improving debuggability.

