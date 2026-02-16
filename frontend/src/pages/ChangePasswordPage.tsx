import React from 'react';
import { LockIcon, PasswordIcon } from '@phosphor-icons/react';
import ChangePasswordForm from '../components/ChangePasswordForm';

interface ChangePasswordPageProps {
  userUid: string;
  onPasswordChanged: () => void;
  isFirstAccess?: boolean;
}

const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ userUid, onPasswordChanged, isFirstAccess = false }) => {
  const texts = isFirstAccess ? {
    title: "Primeiro Acesso",
    desc: "Para sua segurança, defina uma nova senha antes de continuar.",
    icon: <LockIcon size={32} className="text-[#FFD600]" />
  } : {
    title: "Alterar Senha",
    desc: "Digite sua nova senha abaixo para atualizar seu cadastro.",
    icon: <PasswordIcon size={32} className="text-[#FFD600]" />
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <div className="bg-[#252525] p-8 rounded-2xl border border-[#333] w-full max-w-md shadow-xl">
        <div className="bg-[#FFD600]/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          {texts.icon}
        </div>

        <h2 className="text-2xl font-bold mb-2 text-white">{texts.title}</h2>
        <p className="text-[#a0a0a0] mb-6 text-sm">
          {texts.desc}
        </p>

        <ChangePasswordForm
          userUid={userUid}
          onSuccess={onPasswordChanged}
          isFirstAccess={isFirstAccess}
        />
      </div>
    </div>
  );
};

export default ChangePasswordPage;