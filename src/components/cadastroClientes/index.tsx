import React, { useState, ChangeEvent, FocusEvent } from 'react';
import { auth, firestore } from '../../services/firebaseConection';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import styles from './Cadastro.module.css';
import { formatCPF, formatTelefone, formatCEP } from '../regex/Formatters';
import { Cliente, CadastroClienteProps } from '../interfaces/Cliente';
import Button from '../button';

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

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ message: '', success: false });

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
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const handleAddCliente = async () => {

    const { nome, email, cpf, telefone, estado, cidade, bairro, rua, numero } = formData;

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

      setModalContent({ message: 'Cliente cadastrado com sucesso!', success: true });
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
      <h2>📝 Cadastro de clientes</h2>
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
          className={styles.input}
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
          className={styles.input}
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

      <Button label="Incluir" onClick={handleAddCliente} />

      {modalVisible && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p>{modalContent.message}</p>
            {modalContent.success && (
              <Button label="Enviar Email de Acesso" onClick={handleSendEmail} />
            )}

            <Button label="Fechar" onClick={() => setModalVisible(false)} variant="secondary" />
          </div>
        </div>
      )}
    </div>
  );
};
