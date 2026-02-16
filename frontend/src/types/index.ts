import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'atleta' | 'super_admin';

export interface UserProfile {
  uid: string;
  nome: string;
  apelido: string;
  email: string;
  roles: UserRole[];
  saldo: number;
  precisaMudarSenha?: boolean;
}

// NOVA INTERFACE: Representa as dívidas geradas pelo time
export interface Cobranca {
  id: string;
  atletaId: string;
  titulo: string;
  valor: number;
  dataVencimento: Timestamp; // Timestamp do Firebase
  status: 'pendente' | 'paga' | 'futura' | 'processando';
}

export type PaymentStatus = 'em análise' | 'aprovado' | 'rejeitado';

// INTERFACE REFINADA: Detalha como o valor está sendo pago
export interface Payment {
  id: string;
  atletaId: string;
  atletaNome: string;
  tituloCobranca: string;
  tipo: 'adicao_saldo' | 'pagamento_cobranca';
  cobrancaId?: string;
  valorTotal: number;    // Substituindo 'valor'
  valorPix: number;
  valorSaldo: number;
  statusPagamento: PaymentStatus;
  motivoRejeicao?: string;
  urlComprovante?: string;
  dataEnvio: Timestamp;
}