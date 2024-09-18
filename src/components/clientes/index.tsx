import React, { useState, ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faClose, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './Clientes.module.css';

interface Cliente {
  nome: string;
  email: string;
}

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

  const handleAddCliente = () => {
    if (nome && email) {
      const novoCliente: Cliente = { nome, email };
      setClientes([...clientes, novoCliente]);
      setNome('');
      setEmail('');
      setIsFormVisible(false);
    } else {
      alert('Preencha todos os campos');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'nome') setNome(value);
    if (name === 'email') setEmail(value);
  };

  return (
    <div className={styles.clientes}>
      <div className={styles.header}>
 
        <button
          className={styles.addButton}
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          {isFormVisible ? (
            <FontAwesomeIcon icon={faClose} size='1x' />
          ) : (
            <FontAwesomeIcon icon={faAdd} size='1x'/>
          )}
        </button>
      </div>

      {isFormVisible && (
        <div className={styles.form}>
          <h2>Adicionar</h2>
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={nome}
            onChange={handleInputChange}
            className={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={handleInputChange}
            className={styles.input}
          />
          <button onClick={handleAddCliente} className={styles.button}>
            Incluir
          </button>
        </div>
      )}

      <h2>Lista de clientes</h2>
      <ul className={styles.clientesList}>
        {clientes.map((cliente, index) => (
          <li key={index} className={styles.clienteItem}>
            {cliente.nome} - {cliente.email}
          </li>
        ))}
      </ul>
    </div>
  );
};
