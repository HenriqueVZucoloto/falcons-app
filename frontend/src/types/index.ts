import { Timestamp } from 'firebase/firestore';

/** Roles possíveis para um usuário no sistema. */
export type UserRole = 'admin' | 'atleta' | 'super_admin';

/** Perfil do usuário armazenado na coleção `usuarios`. */
export interface UserProfile {
  uid: string;
  nome: string;
  apelido: string;
  email: string;
  roles: UserRole[];
  saldo: number;
  precisaMudarSenha?: boolean;
  telefone?: string;
  dataNascimento?: string;
  fotoUrl?: string;
  cpf?: string;
}

/** Cobrança (dívida) gerada pelo time, armazenada na coleção `cobrancas`. */
export interface Cobranca {
  id: string;
  atletaId: string;
  titulo: string;
  valor: number;
  dataVencimento: Timestamp;
  status: 'pendente' | 'paga' | 'futura' | 'processando';
}

/** Status possíveis para um pagamento. */
export type PaymentStatus = 'em análise' | 'aprovado' | 'rejeitado';

/** Registro de pagamento na coleção `pagamentos`. Detalha como o valor está sendo pago. */
export interface Payment {
  id: string;
  atletaId: string;
  atletaNome: string;
  tituloCobranca: string;
  tipo: 'adicao_saldo' | 'pagamento_cobranca' | 'ajuste_admin';
  cobrancaId?: string;
  valorTotal: number;
  valorPix: number;
  valorSaldo: number;
  statusPagamento: PaymentStatus;
  motivoRejeicao?: string;
  urlComprovante?: string;
  dataEnvio: Timestamp;
  dataProcessamento?: Timestamp;
  realizadoPor?: string;
}

/** Item de pagamento formatado para exibição em listas (usado no HomePage e SubmitPaymentModal). */
export interface FormattedPayment {
  id: string;
  name: string;
  amount: string;
  dueDate: string;
}