import { firestore } from '@/src/services/firebaseConection';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';

// Função para validar CPF
export const isValidCPF = (cpf: string): boolean => {
  // Lógica de validação do CPF
  // Retorne true se for válido, false caso contrário
  cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos

  if (cpf.length !== 11) return false;

  // Verificação dos dígitos verificadores
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.charAt(i - 1)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.charAt(i - 1)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf.charAt(10));
};

// Função para checar se o CPF já existe (simulação de chamada de API)
export const isCPFExists = async (cpf: string): Promise<boolean> => {

  const docRef = doc(firestore, 'clientes', cpf);
  const docSnap = await getDoc(docRef);

  return docSnap.exists();
};

// Função para validar email
export const isValidEmail = (email: string): boolean => {
  // Expressão regular para validar email
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Função para checar se o email já existe (simulação de chamada de API)
export const isEmailExists = async (email: string): Promise<boolean> => {
  const clientesRef = collection(firestore, 'clientes');
  const q = query(clientesRef, where('email', '==', email));

  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty; 
};
