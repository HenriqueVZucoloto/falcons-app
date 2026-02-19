/**
 * Formata uma string de valor monetário para o padrão brasileiro (BRL).
 *
 * Trata a entrada como centavos (divide por 100) para permitir input sem separadores.
 *
 * @param value - String contendo dígitos do valor (ex: "5000" → R$ 50,00)
 * @returns Objeto com `raw` (número para cálculos) e `display` (string formatada para exibição)
 *
 * @example
 * formatCurrency("5000") // { raw: 50.00, display: "50,00" }
 * formatCurrency("123")  // { raw: 1.23, display: "1,23" }
 */
export const formatCurrency = (value: string) => {
  const cleanValue = value.replace(/\D/g, "");
  const numberValue = Number(cleanValue) / 100;

  const displayValue = numberValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    raw: numberValue,
    display: displayValue,
  };
};

/**
 * Aplica máscara de telefone brasileiro: `(XX) XXXXX-XXXX`.
 *
 * @param value - String com dígitos do telefone
 * @returns String formatada com a máscara aplicada
 *
 * @example
 * formatPhone("11999887766") // "(11) 99988-7766"
 */
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").substring(0, 11);

  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};