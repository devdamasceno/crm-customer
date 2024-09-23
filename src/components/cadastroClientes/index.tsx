import React, { useState, ChangeEvent, FocusEvent, useEffect } from 'react';
import { firestore } from '../../services/firebaseConection';
import { doc, setDoc } from 'firebase/firestore';
import styles from './Cadastro.module.css';
import { formatCPF, formatTelefone, formatCEP } from '../regex/Formatters';
import { Cliente, CadastroClienteProps } from '../interfaces/Cliente';
import Button from '../button';
import { isValidCPF, isCPFExists, isValidEmail, isEmailExists } from '../functions/validationUtils';
import { fetchAddressByCep } from '../functions/address';

// Função auxiliar para formatação de valores
const formatField = (name: string, value: string): string => {
  switch (name) {
    case 'cpf': return formatCPF(value);
    case 'telefone': return formatTelefone(value);
    case 'cep': return formatCEP(value);
    default: return value;
  }
};

// Função para resetar o formulário
const resetForm = () => ({
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

// Função genérica para validação e erros
const handleValidation = async (name: string, value: string, setError: React.Dispatch<React.SetStateAction<boolean>>, setExistsError: React.Dispatch<React.SetStateAction<boolean>>) => {
  if (name === 'cpf') {
    const cpfUnformatted = value.replace(/\D/g, '');
    if (!isValidCPF(cpfUnformatted)) {
      setError(true);
      setExistsError(false);
    } else {
      setError(false);
      const exists = await isCPFExists(cpfUnformatted);
      setExistsError(exists);
    }
  } else if (name === 'email') {
    if (!isValidEmail(value)) {
      setError(true);
      setExistsError(false);
    } else {
      setError(false);
      const exists = await isEmailExists(value);
      setExistsError(exists);
    }
  }
};

// Função para salvar ou atualizar cliente
const saveCliente = async (cliente: Cliente, isEdit: boolean, onSuccess: () => void, onError: (message: string) => void) => {
  const { nome, email, cpf, telefone, cep, estado, cidade, bairro, rua, numero } = cliente;
  const cpfUnformatted = cpf.replace(/\D/g, '');

  try {
    // Verifica se o CPF já existe no Firestore
    const cpfExists = await isCPFExists(cpfUnformatted);

    if (!isEdit && cpfExists) {
      throw new Error('O CPF já está cadastrado.');
    }

    // Verifica se o e-mail já existe no Firestore
    const emailExists = await isEmailExists(email);

    if (!isEdit && emailExists) {
      throw new Error('O e-mail já está cadastrado.');
    }

    const clienteData = { nome, email, cpf: formatCPF(cpfUnformatted), telefone, cep, estado, cidade, bairro, rua, numero };

    // Usa o CPF como chave primária
    const docRef = doc(firestore, 'clientes', cpfUnformatted);
    await setDoc(docRef, clienteData);

    onSuccess();
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
    onError(errorMessage);
  }
};

export const CadastroCliente: React.FC<CadastroClienteProps> = ({ onClienteCadastrado, cliente }) => {
  const [formData, setFormData] = useState<Cliente>(resetForm());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ message: '', success: false });
  const [cpfError, setCpfError] = useState(false);
  const [cpfExistsError, setCpfExistsError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailExistsError, setEmailExistsError] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData(cliente);
    } else {
      setFormData(resetForm());
    }
  }, [cliente]);

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = formatField(name, value);

    if (name === 'cep' && formattedValue.length === 9) {
      const addressData = await fetchAddressByCep(formattedValue.replace('-', ''));
      if (addressData) {
        setFormData(prevFormData => ({
          ...prevFormData,
          estado: addressData.uf,
          cidade: addressData.localidade,
          bairro: addressData.bairro,
          rua: addressData.logradouro,
        }));
      }
    }

    setFormData(prevFormData => ({ ...prevFormData, [name]: formattedValue }));
  };

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      await handleValidation(name, value, setCpfError, setCpfExistsError);
    } else if (name === 'email') {
      await handleValidation(name, value, setEmailError, setEmailExistsError);
    }
  };

  const handleAddOrUpdateCliente = async () => {
    const { email, cpf } = formData;

    if (cpfError || cpfExistsError) {
      setModalContent({ message: 'Atenção! CPF é inválido ou já cadastrado.', success: false });
      setModalVisible(true);
      return;
    }

    if (emailError || emailExistsError) {
      setModalContent({ message: 'Atenção! E-mail inválido ou já cadastrado.', success: false });
      setModalVisible(true);
      return;
    }

    await saveCliente(formData, !!cliente, () => {
      setModalContent({ message: 'Cliente cadastrado com sucesso!', success: true });
      setModalVisible(true);
      setFormData(resetForm());
      onClienteCadastrado();
    }, (errorMessage) => {
      setModalContent({ message: errorMessage, success: false });
      setModalVisible(true);
    });
  };

  return (
    <div className={styles.form}>
      <h2>{cliente ? '📝 Editar cliente' : '📝 Cadastro de clientes'}</h2>
      <div className={styles.row}>
        <input type="text" name="nome" placeholder="Nome" value={formData.nome} onChange={handleInputChange} className={styles.input} />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className={`${styles.input} ${emailError || emailExistsError ? styles.inputError : ''}`} onBlur={handleBlur} disabled={!!cliente} />
      </div>
      <div className={styles.row}>
        <input type="text" name="cpf" maxLength={14} placeholder="CPF" value={formData.cpf} onChange={handleInputChange} onBlur={handleBlur} className={`${styles.input} ${cpfError || cpfExistsError ? styles.inputError : ''}`} disabled={!!cliente} />
        <input type="text" name="telefone" placeholder="(99)99999-9999" value={formData.telefone} onChange={handleInputChange} className={styles.input} />
        <input type="text" name="cep" placeholder="CEP" value={formData.cep} onChange={handleInputChange} className={styles.input} />
      </div>
      <div className={styles.row}>
        <input type="text" name="estado" placeholder="Estado" value={formData.estado} onChange={handleInputChange} className={styles.input} />
        <input type="text" name="cidade" placeholder="Cidade" value={formData.cidade} onChange={handleInputChange} className={styles.input} />
      </div>
      <div className={styles.row}>
        <input type="text" name="bairro" placeholder="Bairro" value={formData.bairro} onChange={handleInputChange} className={styles.input} />
        <input type="text" name="rua" placeholder="Rua" value={formData.rua} onChange={handleInputChange} className={styles.input} />
        <input type="text" name="numero" placeholder="Número" value={formData.numero} onChange={handleInputChange} className={styles.input} />
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
                <Button label="Enviar Email de Acesso" onClick={() => alert('Email enviado com sucesso!')} />
              </>
            )}
            <Button label="Fechar" onClick={() => setModalVisible(false)} variant="secondary" />
          </div>
        </div>
      )}
    </div>
  );
};
