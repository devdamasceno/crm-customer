export interface Cliente {
  id: string; 
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
  ruaNumero?: string; 
}

export interface CadastroClienteProps {
  onClienteCadastrado: () => void; 
  cliente?: Cliente | null;
}
