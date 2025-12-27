// src/types/index.ts

// 1. Definimos os papéis possíveis no sistema
export type UserRole = 'admin' | 'atleta';

// 2. A estrutura do perfil do usuário no Firestore
export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  roles: UserRole[];
  saldo: number;
  precisaMudarSenha?: boolean;
}

// 3. Os três status que você sugeriu e validamos
export type PaymentStatus = 'pendente' | 'em análise' | 'pago';

// 4. A estrutura de um lançamento financeiro
export interface Payment {
  id: string;
  atletaId: string;
  atletaNome: string;
  despesaNome: string;
  valor: number;
  statusPagamento: PaymentStatus;
  dataVencimento: any; // Por enquanto 'any', depois usaremos o Timestamp do Firebase
  dataEnvio?: any;
  urlComprovante?: string;
}