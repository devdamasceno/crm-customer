import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faClose } from '@fortawesome/free-solid-svg-icons';
import { firestore } from '../../services/firebaseConection'; 
import { collection, onSnapshot } from 'firebase/firestore';
import styles from './Clientes.module.css';
import { CadastroCliente } from '../cadastroClientes'; 
import Modal from '../modal'; // Importe o componente Modal

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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'clientes'), (snapshot) => {
      const clientesAtualizados = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as unknown as Cliente[];
      setClientes(clientesAtualizados);
    });

    return () => unsubscribe();
  }, []);

  const handleClienteCadastrado = () => {
    setIsFormVisible(false);
  };

  return (
    <div className={styles.clientes}>
      {isFormVisible && (
        <Modal onClose={() => setIsFormVisible(false)}>
          <CadastroCliente onClienteCadastrado={handleClienteCadastrado} />
        </Modal>
      )}

      <h2>Lista de Clientes</h2>
      <ul className={styles.clientesList}>
        {clientes.map((cliente, index) => (
          <li key={index} className={styles.clienteItem}>
            {cliente.nome} - {cliente.email}
          </li>
        ))}
      </ul>

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
  );
};
