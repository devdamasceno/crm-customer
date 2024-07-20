import React, { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faTruck, faCalendarAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/services/firebaseConection';
import styles from './Dashboard.module.css';
import '@/src/lib/fontAwesome';
import { toast } from 'react-toastify';

interface DashboardProps {
  children: ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Até mais 👋')
    } catch (error) {
      toast.error('Ocorreu um erro, tente mais tarde!')
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.sidebar}>
        <ul className={styles.menuList}>
          <li>
            <FontAwesomeIcon icon={faHome} />
            <span>Início</span>
          </li>
          <li>
            <FontAwesomeIcon icon={faUsers} />
            <span>Clientes</span>
          </li>
          <li>
            <FontAwesomeIcon icon={faTruck} />
            <span>Fornecedores</span>
          </li>
          <li>
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Agendamentos</span>
          </li>
        </ul>
        <div className={styles.logoutButton} onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default Dashboard;
