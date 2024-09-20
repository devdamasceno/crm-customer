export interface Cliente {
  id: string; // Adicione o ID
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
  ruaNumero?: string; // Se 'ruaNumero' for opcional, use 'ruaNumero?'
}

export interface CadastroClienteProps {
  onClienteCadastrado: () => void; 
  cliente?: Cliente | null;
}
