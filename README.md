# FalconsApp 🦅

Sistema de gestão financeira e administrativa para o time de Cheerleading **CAASO Falcons**. Este projeto foi refatorado para uma arquitetura moderna utilizando **React + TypeScript** no frontend e **Firebase** no backend.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19 + Vite**: Framework principal para uma interface rápida e reativa.
- **TypeScript**: Tipagem estática para maior segurança e produtividade.
- **Tailwind CSS v4**: Estilização moderna com utilitários de baixo nível.
- **Phosphor Icons**: Biblioteca de ícones consistente.
- **Firebase SDK**: Integração direta com serviços de autenticação e banco de dados.

### Backend (Firebase)
- **Authentication**: Gestão de acesso para Atletas e Administradores.
- **Firestore**: Banco de dados NoSQL para usuários e pagamentos.
- **Storage**: Armazenamento de comprovantes de pagamento (JPG, PNG, PDF).
- **Cloud Functions**: Lógica de servidor para criação segura de novos usuários.
- **Security Rules**: Regras granulares de permissão baseadas em funções (RBAC).

## 📂 Estrutura do Projeto

```text
.
├── frontend/               # Código do cliente (React + TypeScript)
│   ├── src/
│   │   ├── assets/         # Imagens e logotipos
│   │   ├── components/     # Componentes reutilizáveis (Modais, Cards)
│   │   ├── lib/            # Configuração do Firebase
│   │   ├── pages/          # Páginas principais (Home, Admin, Login)
│   │   └── types/          # Definições de interfaces TypeScript
│   └── ...
├── backend/                # Infraestrutura Firebase
│   ├── functions/          # Código das Cloud Functions (Node.js)
│   ├── firestore.rules     # Regras de segurança do Banco de Dados
│   └── storage.rules       # Regras de segurança do Armazenamento
└── firebase.json           # Configuração de deploy do Firebase
```
## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (v18+)
- Firebase CLI instalado (`npm install -g firebase-tools`)

### Configuração do Frontend
1. Entre na pasta do frontend:
   ```bash
   cd frontend

2. Instale as dependências:
   ```bash
   npm install

3. Configure as variáveis de ambiente no arquivo `.env` (use o `env.example` como base).

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev

### Configuração do Backend

1. Realize o login no Firebase:
   ```bash
   firebase login

2. Selecione o projeto do time:
   ```bash
   firebase use --add

3. Deploy das regras de segurança:
   ```bash
   firebase deploy --only firestore:rules,storage:rules

## 🛡️ Regras de Segurança

O sistema utiliza um modelo de permissão baseado em papéis (admin e atleta):

- Atletas: Podem ver apenas seus próprios pagamentos e enviar comprovantes.
- Admins: Podem visualizar todos os atletas, aprovar/rejeitar pagamentos e cadastrar novos membros via Cloud Functions.
