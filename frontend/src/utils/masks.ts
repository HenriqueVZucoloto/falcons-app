export const formatCurrency = (value: string) => {
  // 1. Remove tudo que não for dígito
  const cleanValue = value.replace(/\D/g, "");

  // 2. Converte para número e divide por 100 (para tratar como centavos)
  const numberValue = Number(cleanValue) / 100;

  // 3. Formata para string brasileira (ex: "50,00")
  const displayValue = numberValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    raw: numberValue,       // O número real (ex: 50.00) para cálculos
    display: displayValue,  // A string (ex: "50,00") para o input
  };
};