import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';

interface ChangePasswordFormProps {
    userUid: string;
    onSuccess: () => void;
    isFirstAccess?: boolean;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ userUid, onSuccess, isFirstAccess = false }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Usuário não autenticado.");

            await updatePassword(user, newPassword);

            const userDocRef = doc(db, "usuarios", userUid);
            await updateDoc(userDocRef, {
                precisaMudarSenha: false
            });

            onSuccess();
            if (!isFirstAccess) alert("Senha alterada com sucesso!");

        } catch (err: unknown) {
            console.error(err);
            if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'auth/requires-recent-login') {
                setError("Para segurança, faça login novamente antes de mudar a senha.");
            } else {
                setError("Erro ao atualizar dados. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const texts = isFirstAccess ? {
        btn: "Definir Nova Senha",
    } : {
        btn: "Salvar Nova Senha",
    };

    return (
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 text-left">
            <div className="relative">
                <label className="text-sm text-[#a0a0a0] mb-1 block">Nova Senha</label>
                <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 bg-[#333] border border-[#444] rounded-xl text-white focus:border-[#FFD600] outline-none"
                    placeholder="••••••••"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-9 text-[#a0a0a0] cursor-pointer hover:text-white"
                >
                    {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                </button>
            </div>

            <div>
                <label className="text-sm text-[#a0a0a0] mb-1 block">Confirmar Senha</label>
                <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 bg-[#333] border border-[#444] rounded-xl text-white focus:border-[#FFD600] outline-none"
                    placeholder="••••••••"
                    required
                />
            </div>

            {error && <p className="text-[#ffaaaa] text-sm text-center bg-red-500/10 p-2 rounded">{error}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#FFD600] text-[#1A1A1A] font-bold rounded-xl mt-2 cursor-pointer disabled:bg-[#555] hover:bg-[#e6c200] transition-colors active:scale-[0.98]"
            >
                {isLoading ? "Processando..." : texts.btn}
            </button>
        </form>
    );
};

export default ChangePasswordForm;
