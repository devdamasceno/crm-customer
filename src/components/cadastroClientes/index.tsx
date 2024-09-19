import React, { useState, ChangeEvent, FocusEvent } from 'react';
import { auth, firestore } from '../../services/firebaseConection'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
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
  ruaNumero: string;
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
    ruaNumero: ''
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
    ruaNumero: ''
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
    ruaNumero: false
  });

  // Função para validar CPF
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

  // Função para validar email
  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Função para formatar telefone (99) 99999-9999
  const formatTelefone = (telefone: string) => {
    const cleaned = telefone.replace(/\D/g, ''); // Remove tudo que não for número
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return telefone;
  };

  // Função para formatar CPF para 11 dígitos e somente números
  const formatCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, ''); // Remove tudo que não for número
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cleaned;
  };

  // Função para formatar CEP no formato 00000-000
  const formatCEP = (cep: string) => {
    const cleaned = cep.replace(/\D/g, ''); // Remove tudo que não for número
    if (cleaned.length <= 8) { // Permite até 8 dígitos
      return cleaned.length === 8 ? `${cleaned.slice(0, 5)}-${cleaned.slice(5)}` : cleaned;
    }
    return cep;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
    } else if (name === 'telefone') {
      formattedValue = formatTelefone(value);
    }

    setFormData({ ...formData, [name]: formattedValue });

    let isValid = true;
    switch (name) {
      case 'cpf':
        const cleanedCPF = formattedValue.replace(/\D/g, '');
        if (cleanedCPF.length === 11) {
          if (!isValidCPF(cleanedCPF)) {
            setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
            isValid = false;
          } else {
            setErrors(prev => ({ ...prev, cpf: '' }));
          }
        } else {
          setErrors(prev => ({ ...prev, cpf: 'CPF deve ter 11 dígitos' }));
          isValid = false;
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
      case 'cep':
        if (formattedValue.length === 9) { // Incluindo o hífen
          fetchAddressByCep(formattedValue.replace('-', ''));
        } else {
          setErrors(prev => ({ ...prev, cep: 'CEP deve ter 8 dígitos' }));
          isValid = false;
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
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prevFormData => ({
            ...prevFormData,
            estado: prevFormData.estado || data.uf, // Não sobrescrever se já estiver preenchido
            cidade: prevFormData.cidade || data.localidade, // Não sobrescrever se já estiver preenchido
            bairro: prevFormData.bairro || data.bairro, // Não sobrescrever se já estiver preenchido
            ruaNumero: prevFormData.ruaNumero || data.logradouro // Não sobrescrever se já estiver preenchido
          }));
          setErrors(prevErrors => ({ ...prevErrors, cep: '' }));
        } else {
          setErrors(prevErrors => ({ ...prevErrors, cep: 'CEP inválido' }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setErrors(prevErrors => ({ ...prevErrors, cep: 'Erro ao buscar CEP' }));
      }
    }
  };

  const handleAddCliente = async () => {
    const { nome, email, cpf, telefone, estado, cidade, ruaNumero } = formData;

    const allValid = Object.values(validFields).every(value => value);
    if (allValid && nome && email && cpf && telefone && estado && cidade && ruaNumero) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, cpf);

        await addDoc(collection(firestore, 'clientes'), {
          nome,
          email,
          cpf,
          telefone,
          estado,
          cidade,
          ruaNumero,
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
          ruaNumero: ''
        });

        alert('Cliente cadastrado com sucesso!');
        onClienteCadastrado();
      } catch (error) {
        console.error("Erro ao cadastrar cliente:", error);
        alert('Erro ao cadastrar cliente.');
      }
    } else {
      alert('Preencha todos os campos corretamente.');
    }
  };

  return (
    <div className={styles.form}>
      <h2>Adicionar Cliente</h2>
      <input
        type="text"
        name="nome"
        placeholder="Nome"
        value={formData.nome}
        onChange={handleInputChange}
        className={`${styles.input} ${validFields.nome ? styles.inputValid : errors.nome ? styles.inputError : ''}`}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleInputChange}
        className={`${styles.input} ${validFields.email ? styles.inputValid : errors.email ? styles.inputError : ''}`}
      />
      <input
        type="text"
        name="cpf"
        maxLength={14}
        minLength={14}
        placeholder="CPF"
        value={formData.cpf}
        onChange={handleInputChange}
        onBlur={handleBlur} 
        className={`${styles.input} ${validFields.cpf ? styles.inputValid : errors.cpf ? styles.inputError : ''}`}
      />
      <input
        type="text"
        name="telefone"
        placeholder="(99)99999-9999"
        maxLength={15}
        minLength={14}
        value={formData.telefone}
        onChange={handleInputChange}
        className={`${styles.input} ${validFields.telefone ? styles.inputValid : errors.telefone ? styles.inputError : ''}`}
      />
      <input
        type="text"
        name="cep"
        placeholder="CEP"
        maxLength={9}
        minLength={8}
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
        onChange={handleInputChange}
        className={`${styles.input} ${validFields.estado ? styles.inputValid : errors.estado ? styles.inputError : ''}`}
      />
      <input
        type="text"
        name="cidade"
        placeholder="Cidade"
        value={formData.cidade}
        onChange={handleInputChange}
        className={`${styles.input} ${validFields.cidade ? styles.inputValid : errors.cidade ? styles.inputError : ''}`}
      />
      <input
        type="text"
        name="bairro"
        placeholder="Bairro"
        value={formData.bairro}
        onChange={handleInputChange}
        className={`${styles.input} ${validFields.bairro ? styles.inputValid : errors.bairro ? styles.inputError : ''}`}
      />
      <input
        type="text"
        name="ruaNumero"
        placeholder="Rua / Numero"
        value={formData.ruaNumero}
        onChange={handleInputChange}
        className={`${styles.input} ${validFields.ruaNumero ? styles.inputValid : errors.ruaNumero ? styles.inputError : ''}`}
      />
      <button onClick={handleAddCliente} className={styles.button}>
        Incluir Cliente
      </button>
    </div>
  );
};
