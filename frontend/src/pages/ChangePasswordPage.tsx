import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Lock, Eye, EyeSlash } from 'phosphor-react';

interface ChangePasswordPageProps {
  userUid: string;
  onPasswordChanged: () => void;
}

const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ userUid, onPasswordChanged }) => {
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

      // 1. Atualiza no Auth
      await updatePassword(user, newPassword);

      // 2. Atualiza no Firestore para liberar o acesso
      const userDocRef = doc(db, "usuarios", userUid);
      await updateDoc(userDocRef, {
        precisaMudarSenha: false
      });

      onPasswordChanged();
    } catch (err: any) {
      console.error(err);
      setError("Erro ao atualizar senha. Tente fazer login novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <div className="bg-[#252525] p-8 rounded-2xl border border-[#333] w-full max-w-md shadow-xl">
        <div className="bg-[#FFD600]/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Lock size={32} className="text-[#FFD600]" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Primeiro Acesso</h2>
        <p className="text-[#a0a0a0] mb-6">
          Para sua segurança, escolha uma nova senha antes de continuar.
        </p>

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 text-left">
          <div className="relative">
            <label className="text-sm text-[#a0a0a0] mb-1 block">Nova Senha</label>
            <input 
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-4 bg-[#333] border border-[#444] rounded-xl text-white focus:border-[#FFD600] outline-none"
              placeholder="••••••••"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-10 text-[#a0a0a0] cursor-pointer"
            >
              {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div>
            <label className="text-sm text-[#a0a0a0] mb-1 block">Confirmar Senha</label>
            <input 
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 bg-[#333] border border-[#444] rounded-xl text-white focus:border-[#FFD600] outline-none"
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
            {isLoading ? "Atualizando..." : "Definir Nova Senha"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;