export const formatTelefone = (telefone: string) => {
  const cleaned = telefone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return telefone;
};

export const formatCPF = (value: string) => {

  const onlyNumbers = value.replace(/\D/g, '');

  return onlyNumbers.replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{2})$/, '$1-$2');
};

export const formatCEP = (cep: string) => {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8 ? `${cleaned.slice(0, 5)}-${cleaned.slice(5)}` : cleaned;
};
