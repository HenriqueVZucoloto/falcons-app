export const FINANCE_CONFIG = {
    // Chave PIX (CPF, Email, Telefone ou Aleatória)
    // Recomendado: Adicionar VITE_PIX_KEY no arquivo .env
    PIX_KEY: import.meta.env.VITE_PIX_KEY,

    // Nome do Beneficiário (Deve ser igual ao do banco)
    PIX_MERCHANT_NAME: import.meta.env.VITE_PIX_MERCHANT_NAME,

    // Cidade do Beneficiário
    PIX_MERCHANT_CITY: import.meta.env.VITE_PIX_MERCHANT_CITY,

    // Identificador único da transação ( Prefixo )
    PIX_TXID_PREFIX: import.meta.env.VITE_PIX_TXID_PREFIX
};