/**
 * Configuração financeira centralizada para geração de PIX.
 * Valores lidos das variáveis de ambiente Vite (prefixo `VITE_`).
 */
export const FINANCE_CONFIG = {
    PIX_KEY: import.meta.env.VITE_PIX_KEY,
    PIX_MERCHANT_NAME: import.meta.env.VITE_PIX_MERCHANT_NAME,
    PIX_MERCHANT_CITY: import.meta.env.VITE_PIX_MERCHANT_CITY,
    PIX_TXID_PREFIX: import.meta.env.VITE_PIX_TXID_PREFIX
};