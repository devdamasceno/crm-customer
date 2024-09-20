import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faClose, faEdit } from '@fortawesome/free-solid-svg-icons';
import { firestore } from '../../services/firebaseConection';
import { collection, onSnapshot } from 'firebase/firestore';
import styles from './Clientes.module.css';
import { CadastroCliente } from '../cadastroClientes';
import { Cliente } from '../interfaces/Cliente';
import Modal from '../modal';

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [searchCpf, setSearchCpf] = useState<string>(''); // Estado para busca
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'clientes'), (snapshot) => {
      const clientesAtualizados = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id
        } as Cliente;
      });
      setClientes(clientesAtualizados);
    });

    return () => unsubscribe();
  }, []);

  const handleClienteCadastrado = () => {
    setIsFormVisible(false);
    setClienteEditando(null); // Limpar o cliente editando após o cadastro
    setCurrentPage(1); // Resetar para a primeira página após adicionar um cliente
  };

  const handleEditCliente = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setIsFormVisible(true);
  };

  // Filtrar clientes com base no CPF
  const filteredClientes = clientes.filter(cliente =>
    cliente.cpf.includes(searchCpf)
  );

  // Paginação
  const indexOfLastCliente = currentPage * itemsPerPage;
  const indexOfFirstCliente = indexOfLastCliente - itemsPerPage;
  const currentClientes = filteredClientes.slice(indexOfFirstCliente, indexOfLastCliente);
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

  return (
    <div className={styles.clientes}>
      {isFormVisible && (
        <Modal onClose={() => setIsFormVisible(false)}>
          <CadastroCliente
            onClienteCadastrado={handleClienteCadastrado}
            cliente={clienteEditando} // Passar o cliente a ser editado
          />
        </Modal>
      )}

      <div className={styles.Header}>
        <h2 className={styles.titulo}>📝 Lista de clientes</h2>
        <input
          type="text"
          placeholder="Buscar por CPF"
          value={searchCpf}
          onChange={(e) => setSearchCpf(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <table className={styles.clientesTable}>
        <thead>
          <tr>
            <th className={styles.acoesNome}>Nome</th>
            <th className={styles.acoesEmail}>Email</th>
            <th className={styles.acoesCpf}>CPF</th>
            <th className={styles.acoes}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentClientes.map(cliente => (
            <tr key={cliente.id} className={styles.clienteItem}>
              <td>{cliente.nome}</td>
              <td>{cliente.email}</td>
              <td>{cliente.cpf}</td>
              <td>
                <button onClick={() => handleEditCliente(cliente)} className={styles.editButton}>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      <div className={styles.pagination}>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Próxima
        </button>
      </div>

      <button
        className={styles.addButton}
        onClick={() => {
          setClienteEditando(null); 
          setIsFormVisible(!isFormVisible);
        }}
      >
        {isFormVisible ? (
          <FontAwesomeIcon icon={faClose} size="1x" color='#FFF' />
        ) : (
          <FontAwesomeIcon icon={faAdd} size="1x" color='#FFF' />
        )}
      </button>
    </div>
  );
};
