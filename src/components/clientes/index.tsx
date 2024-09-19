import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faClose } from '@fortawesome/free-solid-svg-icons';
import { firestore } from '../../services/firebaseConection'; 
import { collection, onSnapshot } from 'firebase/firestore';
import styles from './Clientes.module.css';
import { CadastroCliente } from '../cadastroClientes'; 

interface Cliente {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  estado: string;
  cidade: string;
  ruaNumero: string;
}

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

  // Atualiza a lista de clientes sempre que houver alterações na coleção Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'clientes'), (snapshot) => {
      const clientesAtualizados = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as unknown as Cliente[];
      setClientes(clientesAtualizados);
    });

    // Limpa o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  const handleClienteCadastrado = () => {
    // Aqui podemos realizar ações após o cliente ser cadastrado, como fechar o formulário
    setIsFormVisible(false);
  };

  return (
    <div className={styles.clientes}>
      <div className={styles.header}>
        <button
          className={styles.addButton}
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          {isFormVisible ? (
            <FontAwesomeIcon icon={faClose} size="1x" />
          ) : (
            <FontAwesomeIcon icon={faAdd} size="1x" />
          )}
        </button>
      </div>

      {isFormVisible && (
        <CadastroCliente onClienteCadastrado={handleClienteCadastrado} />
      )}

      <h2>Lista de Clientes</h2>
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
