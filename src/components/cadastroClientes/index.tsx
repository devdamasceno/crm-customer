import React, { useState, ChangeEvent, FocusEvent, useEffect } from 'react';
import { auth, firestore } from '../../services/firebaseConection';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import styles from './Cadastro.module.css';
import { formatCPF, formatTelefone, formatCEP } from '../regex/Formatters';
import { Cliente, CadastroClienteProps } from '../interfaces/Cliente';
import Button from '../button';

// Função para validar CPF
const isValidCPF = (cpf: string): boolean => {
  const onlyNumbers = cpf.replace(/\D/g, '');
  if (onlyNumbers.length !== 11) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(onlyNumbers)) return false;

  let sum = 0;
  let remainder;

  // Calcular o primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(onlyNumbers.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(onlyNumbers.substring(9, 10))) return false;

  // Calcular o segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(onlyNumbers.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(onlyNumbers.substring(10, 11));
};

// Função para validar o formato do e-mail
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função para verificar se o CPF já existe no Firestore
const isCPFExists = async (cpf: string): Promise<boolean> => {
  const q = query(collection(firestore, 'clientes'), where('cpf', '==', cpf));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// Função para verificar se o e-mail já existe no Firestore
const isEmailExists = async (email: string): Promise<boolean> => {
  const q = query(collection(firestore, 'clientes'), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const CadastroCliente: React.FC<CadastroClienteProps> = ({ onClienteCadastrado, cliente }) => {

  const [formData, setFormData] = useState<Cliente>({
    id: '',
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

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ message: '', success: false });
  const [cpfError, setCpfError] = useState(false); // Para indicar erro de CPF
  const [cpfExistsError, setCpfExistsError] = useState(false); // Para indicar CPF já existente
  const [emailError, setEmailError] = useState(false); // Para indicar erro de e-mail
  const [emailExistsError, setEmailExistsError] = useState(false); // Para indicar e-mail já existente

  useEffect(() => {
    if (cliente) {
      setFormData(cliente);
    } else {
      setFormData({
        id: '',
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
    }
  }, [cliente]);

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = formatCPF(value);
      setFormData(prevFormData => ({ ...prevFormData, [name]: formattedValue }));

      const cpfUnformatted = formattedValue.replace(/\D/g, '');

      if (cpfUnformatted.length === 11) {
        // Valida CPF em tempo real
        if (!isValidCPF(cpfUnformatted)) {
          setCpfError(true);
        } else {
          setCpfError(false);

          // Verifica se o CPF já existe
          const exists = await isCPFExists(cpfUnformatted);
          setCpfExistsError(exists);
        }
      } else {
        setCpfError(true);
      }

    } else if (name === 'email') {
      setFormData(prevFormData => ({ ...prevFormData, [name]: formattedValue }));

      // Valida o formato do e-mail em tempo real
      if (!isValidEmail(formattedValue)) {
        setEmailError(true);
      } else {
        setEmailError(false);

        // Verifica se o e-mail já existe
        const exists = await isEmailExists(formattedValue);
        setEmailExistsError(exists);
      }
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
      if (formattedValue.length === 9) {
        fetchAddressByCep(formattedValue.replace('-', ''));
      }
    } else if (name === 'telefone') {
      formattedValue = formatTelefone(value);
    }

    setFormData(prevFormData => ({ ...prevFormData, [name]: formattedValue }));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setFormData(prev => ({ ...prev, cpf: formatCPF(value) }));
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
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const handleAddOrUpdateCliente = async () => {
    const { nome, email, cpf, telefone, cep, estado, cidade, bairro, rua, numero } = formData;

    // O CPF já está formatado, então não há necessidade de remover a formatação
    const cpfFormatted = formatCPF(cpf);// Formata para garantir o padrão 718.209.800-81

    // Verifica se o CPF é válido
    if (!isValidCPF(cpf.replace(/\D/g, ''))) { // Valida sem formatação
      setModalContent({ message: 'Atenção! CPF é inválido.', success: false });
      setModalVisible(true);
      return;
    }

    // Verifica se o CPF já existe
    const cpfExists = await isCPFExists(cpf.replace(/\D/g, ''));

    // Se for edição, permitir que o CPF seja mantido o mesmo
    if (cpfExists && (!cliente || cliente.cpf !== cpfFormatted)) {
      setModalContent({ message: 'CPF já cadastrado.', success: false });
      setModalVisible(true);
      return;
    }

    // Verifica se o e-mail é válido
    if (!isValidEmail(email)) {
      setModalContent({ message: 'E-mail inválido.', success: false });
      setModalVisible(true);
      return;
    }

    // Verifica se o e-mail já existe
    const emailExists = await isEmailExists(email);
    if (emailExists) {
      setModalContent({ message: 'E-mail já cadastrado.', success: false });
      setModalVisible(true);
      return;
    }

    try {
      let uid;
      if (cliente) {
        uid = cliente.id;
        await setDoc(doc(firestore, 'clientes', uid), {
          nome,
          email,
          cpf: cpfFormatted,  // CPF salvo formatado
          telefone,
          cep,
          estado,
          cidade,
          bairro,
          rua,
          numero
        });
        setModalContent({ message: 'Cliente atualizado com sucesso!', success: true });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, cpfFormatted.replace(/\D/g, ''));
        uid = userCredential.user.uid;
        await addDoc(collection(firestore, 'clientes'), {
          nome,
          email,
          cpf: cpfFormatted,  // CPF salvo formatado
          telefone,
          cep,
          estado,
          cidade,
          bairro,
          rua,
          numero,
          id: uid
        });
        setModalContent({ message: 'Cliente cadastrado com sucesso!', success: true });
      }

      setFormData({
        id: '',
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

      setModalVisible(true);
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
          default:
            errorMessage = 'Erro desconhecido ao cadastrar cliente.';
            break;
        }
      }

      setModalContent({ message: errorMessage, success: false });
      setModalVisible(true);
    }
  };

  const handleSendEmail = () => {
    alert('Email enviado com sucesso!');
  };

  return (
    <div className={styles.form}>
      <h2>{cliente ? '📝 Editar cliente' : '📝 Cadastro de clientes'}</h2>
      <div className={styles.row}>
        <input
          type="text"
          name="nome"
          placeholder="Nome"
          value={formData.nome}
          onChange={handleInputChange}
          className={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          className={`${styles.input} ${emailError || emailExistsError ? styles.inputError : ''}`} // Aplica borda vermelha se erro
        />
      </div>
      <div className={styles.row}>
        <input
          type="text"
          name="cpf"
          maxLength={14}
          placeholder="CPF"
          value={formData.cpf}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`${styles.input} ${cpfError || cpfExistsError ? styles.inputError : ''}`}
        />
        <input
          type="text"
          name="telefone"
          placeholder="(99)99999-9999"
          value={formData.telefone}
          onChange={handleInputChange}
          className={styles.input}
        />
        <input
          type="text"
          name="cep"
          placeholder="CEP"
          value={formData.cep}
          onChange={handleInputChange}
          className={styles.input}
        />
      </div>
      <div className={styles.row}>
        <input
          type="text"
          name="estado"
          placeholder="Estado"
          value={formData.estado}
          readOnly
          className={styles.input}
        />
        <input
          type="text"
          name="cidade"
          placeholder="Cidade"
          value={formData.cidade}
          readOnly
          className={styles.input}
        />
      </div>
      <div className={styles.row}>
        <input
          type="text"
          name="bairro"
          placeholder="Bairro"
          value={formData.bairro}
          readOnly
          className={styles.input}
        />
        <input
          type="text"
          name="rua"
          placeholder="Rua"
          value={formData.rua}
          readOnly
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
      </div>

      <Button label={cliente ? "Atualizar" : "Incluir"} onClick={handleAddOrUpdateCliente} />

      {modalVisible && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p>{modalContent.message}</p>
            {modalContent.success && (
              <>
                <p>Informações do cliente:</p>
                <p>Nome: {formData.nome}</p>
                <p>Email: {formData.email}</p>
                <p>CPF: {formData.cpf}</p>
                <p>Telefone: {formData.telefone}</p>
                <p>CEP: {formData.cep}</p>
                <p>Estado: {formData.estado}</p>
                <p>Cidade: {formData.cidade}</p>
                <p>Bairro: {formData.bairro}</p>
                <p>Rua: {formData.rua}</p>
                <p>Número: {formData.numero}</p>
                <Button label="Enviar Email de Acesso" onClick={handleSendEmail} />
              </>
            )}
            <Button label="Fechar" onClick={() => setModalVisible(false)} variant="secondary" />
          </div>
        </div>
      )}
    </div>
  );
};
