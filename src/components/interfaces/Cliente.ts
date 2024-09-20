export interface Cliente {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
}

export interface CadastroClienteProps {
  onClienteCadastrado: () => void; 
}
