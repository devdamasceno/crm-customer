import React, { useState, ChangeEvent, FocusEvent } from 'react';
import { auth, firestore } from '../../services/firebaseConection'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import styles from './Cadastro.module.css';

interface Cliente {
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

interface CadastroClienteProps {
  onClienteCadastrado: () => void; 
}

export const CadastroCliente: React.FC<CadastroClienteProps> = ({ onClienteCadastrado }) => {
  const [formData, setFormData] = useState<Cliente>({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    cep: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: ''
  });

  const [errors, setErrors] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    cep: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: ''
  });

  const [validFields, setValidFields] = useState({
    nome: false,
    email: false,
    cpf: false,
    telefone: false,
    cep: false,
    estado: false,
    cidade: false,
    bairro: false,
    rua: false,
    numero: false
  });

  const isValidCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) sum += parseInt(cleaned.charAt(i - 1), 10) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(9), 10)) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cleaned.charAt(i - 1), 10) * (12 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cleaned.charAt(10), 10);
  };

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const formatTelefone = (telefone: string) => {
    const cleaned = telefone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return telefone;
  };

  const formatCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cleaned;
  };

  const formatCEP = (cep: string) => {
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.length === 8 ? `${cleaned.slice(0, 5)}-${cleaned.slice(5)}` : cleaned;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
      if (formattedValue.length === 9) {
        fetchAddressByCep(formattedValue.replace('-', ''));
      }
    } else if (name === 'telefone') {
      formattedValue = formatTelefone(value);
    }

    setFormData(prevFormData => ({ ...prevFormData, [name]: formattedValue }));

    let isValid = true;
    switch (name) {
      case 'nome':
        if (!value.trim()) {
          setErrors(prev => ({ ...prev, nome: 'Nome é obrigatório' }));
          isValid = false;
        } else {
          setErrors(prev => ({ ...prev, nome: '' }));
        }
        break;
      case 'cpf':
        const cleanedCPF = formattedValue.replace(/\D/g, '');
        if (!isValidCPF(cleanedCPF)) {
          setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
          isValid = false;
        } else {
          setErrors(prev => ({ ...prev, cpf: '' }));
        }
        break;
      case 'email':
        if (!isValidEmail(value)) {
          setErrors(prev => ({ ...prev, email: 'Email inválido' }));
          isValid = false;
        } else {
          setErrors(prev => ({ ...prev, email: '' }));
        }
        break;
      case 'telefone':
        if (formattedValue.length < 14) {
          setErrors(prev => ({ ...prev, telefone: 'Telefone inválido' }));
          isValid = false;
        } else {
          setErrors(prev => ({ ...prev, telefone: '' }));
        }
        break;
      default:
        break;
    }

    setValidFields(prev => ({ ...prev, [name]: isValid }));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      const formattedCPF = formatCPF(value);
      setFormData(prev => ({ ...prev, cpf: formattedCPF }));
    } else if (name === 'cep') {
      const formattedCEP = formatCEP(value);
      setFormData(prev => ({ ...prev, cep: formattedCEP }));
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prevFormData => ({
          ...prevFormData,
          estado: data.uf || prevFormData.estado,
          cidade: data.localidade || prevFormData.cidade,
          bairro: data.bairro || prevFormData.bairro,
          rua: data.logradouro || prevFormData.rua
        }));
        setErrors(prevErrors => ({ ...prevErrors, cep: '' }));
      } else {
        setErrors(prevErrors => ({ ...prevErrors, cep: 'CEP inválido' }));
      }
    } catch (error) {
      setErrors(prevErrors => ({ ...prevErrors, cep: 'Erro ao buscar CEP' }));
      toast.error('Erro ao buscar CEP');
    }
  };

  const handleAddCliente = async () => {
    const { nome, email, cpf, telefone, cep, estado, cidade, bairro, rua, numero } = formData;
  
    const allRequiredFilled = nome && email && cpf && telefone;
    const allValid = validFields.nome && validFields.email && validFields.cpf && validFields.telefone && validFields.cep;
  
    if (allRequiredFilled && allValid) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, cpf);
  
        await addDoc(collection(firestore, 'clientes'), {
          nome,
          email,
          cpf,
          telefone,
          estado,
          cidade,
          bairro,
          rua,
          numero,
          uid: userCredential.user.uid
        });
  
        setFormData({
          nome: '',
          email: '',
          cpf: '',
          telefone: '',
          cep: '',
          estado: '',
          cidade: '',
          bairro: '',
          rua: '',
          numero: ''
        });
  
        toast.success('Cliente cadastrado com sucesso!');
        onClienteCadastrado();
      } catch (error: any) {
        let errorMessage = 'Erro ao cadastrar cliente.';
        
        if (error.code) {
          switch (error.code) {
            case 'auth/weak-password':
              errorMessage = 'A senha é muito fraca.';
              break;
            case 'auth/email-already-in-use':
              errorMessage = 'O e-mail já está em uso.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'O e-mail fornecido é inválido.';
              break;
            case 'auth/operation-not-allowed':
              errorMessage = 'Operação não permitida.';
              break;
            case 'auth/user-not-found':
              errorMessage = 'Usuário não encontrado.';
              break;
            case 'auth/wrong-password':
              errorMessage = 'Senha incorreta.';
              break;
            default:
              errorMessage = 'Erro desconhecido ao cadastrar cliente.';
              break;
          }
        }
  
        toast.error(errorMessage);
      }
    } else {
      toast.error('Preencha todos os campos obrigatórios corretamente.');
    }
  };
  
  return (
    <div className={styles.form}>
      <h2>Adicionar Cliente</h2>
      <input
        type="text"
        name="nome"
        placeholder="Nome"
        required
        value={formData.nome}
        onChange={handleInputChange}
        className={`${styles.input} ${validFields.nome ? styles.inputValid : errors.nome ? styles.inputError : ''}`}
      />
      <input
        type="email"
        name="email"
        required
        placeholder="Email"
        value={formData.email}
        onChange={handleInputChange}
        className={`${styles.input} ${validFields.email ? styles.inputValid : errors.email ? styles.inputError : ''}`}
      />
      <input
        type="text"
        name="cpf"
        maxLength={14}
        placeholder="CPF"
        required
        value={formData.cpf}
        onChange={handleInputChange}
        onBlur={handleBlur} 
        className={`${styles.input} ${validFields.cpf ? styles.inputValid : errors.cpf ? styles.inputError : ''}`}
      />
      <input
        type="text"
        name="telefone"
        placeholder="(99)99999-9999"
        required
        maxLength={15}
        value={formData.telefone}
        onChange={handleInputChange}
        className={`${styles.input} ${validFields.telefone ? styles.inputValid : errors.telefone ? styles.inputError : ''}`}
      />
      <input
        type="text"
        name="cep"
        placeholder="CEP"
        value={formData.cep}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={`${styles.input} ${validFields.cep ? styles.inputValid : errors.cep ? styles.inputError : ''}`}
      />
      <input
        type="text"
        name="estado"
        placeholder="Estado"
        value={formData.estado}
        onChange={handleInputChange} // Allowing editing
        className={styles.input}
      />
      <input
        type="text"
        name="cidade"
        placeholder="Cidade"
        value={formData.cidade}
        onChange={handleInputChange} // Allowing editing
        className={styles.input}
      />
      <input
        type="text"
        name="bairro"
        placeholder="Bairro"
        value={formData.bairro}
        onChange={handleInputChange} // Allowing editing
        className={styles.input}
      />
      <input
        type="text"
        name="rua"
        placeholder="Rua"
        value={formData.rua}
        onChange={handleInputChange} // Allowing editing
        className={styles.input}
      />
      <input
        type="text"
        name="numero"
        placeholder="Número"
        value={formData.numero}
        onChange={handleInputChange}
        className={styles.input}
      />
      <button onClick={handleAddCliente} className={styles.button}>
        Incluir Cliente
      </button>
    </div>
  );
};
