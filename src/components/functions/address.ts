export const fetchAddressByCep = async (cep: string) => {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) {
      throw new Error('Erro ao buscar o endereço');
    }
    const data = await response.json();
    if (data.erro) {
      throw new Error('CEP inválido');
    }
    return data;
  } catch (error) {
    console.error('Erro ao buscar o endereço:', error);
    return null;
  }
};
