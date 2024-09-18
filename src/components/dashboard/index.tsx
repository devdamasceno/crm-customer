import React, { ReactNode, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faTruck, faCalendarAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/services/firebaseConection';
import styles from './Dashboard.module.css';
import '@/src/lib/fontAwesome';
import { toast } from 'react-toastify';
import { Clientes } from '../clientes';  

interface DashboardProps {
  children: ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const [activePage, setActivePage] = useState<string>('home');  // Estado para controlar a navegação

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Até mais 👋');
    } catch (error) {
      toast.error('Ocorreu um erro, tente mais tarde!');
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <span>Logo</span>
        </div>
        <ul className={styles.menuList}>
          <li onClick={() => setActivePage('home')}>
            <FontAwesomeIcon icon={faHome} />
            <span>Início</span>
          </li>
          <li onClick={() => setActivePage('clientes')}>
            <FontAwesomeIcon icon={faUsers} />
            <span>Clientes</span>
          </li>
          <li onClick={() => setActivePage('fornecedores')}>
            <FontAwesomeIcon icon={faTruck} />
            <span>Fornecedores</span>
          </li>
          <li onClick={() => setActivePage('agendamentos')}>
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Agendamentos</span>
          </li>
        </ul>
        <div className={styles.logoutButton} onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Sair</span>
        </div>
      </div>

      <div className={styles.content}>

        {activePage === 'home' && <h1>Bem-vindo!</h1>}
        {activePage === 'clientes' && <Clientes />}
        {activePage === 'fornecedores' && <h1>Fornecedores</h1>}
        {activePage === 'agendamentos' && <h1>Agendamentos</h1>}
      </div>
    </div>
  );
};

export default Dashboard;
