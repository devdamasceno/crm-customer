import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faTruck, faCalendarAlt, faSignOutAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons'; // Adicionado faTimes
import { signOut } from 'firebase/auth';
import { auth } from '@/src/services/firebaseConection';
import styles from './Dashboard.module.css';
import '@/src/lib/fontAwesome';
import { toast } from 'react-toastify';
import { Clientes } from '../clientes';  

const Dashboard: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('home');  // Estado para controlar a navegação
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);  // Sidebar aberta por padrão no desktop
  const [isMobile, setIsMobile] = useState<boolean>(false); // Estado para detectar mobile

  // Função para detectar o tamanho da tela
  const handleResize = () => {
    if (window.innerWidth <= 700) {
      setIsMobile(true);
      setIsSidebarOpen(false); // Fecha o menu por padrão em mobile
    } else {
      setIsMobile(false);
      setIsSidebarOpen(true); // Sidebar aberta por padrão em desktop
    }
  };

  // Detecta o tamanho da tela quando o componente carrega
  useEffect(() => {
    handleResize(); // Chama a função de detecção quando o componente é montado
    window.addEventListener('resize', handleResize); // Adiciona o event listener para redimensionamento da janela
    return () => {
      window.removeEventListener('resize', handleResize); // Remove o listener ao desmontar o componente
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Até mais 👋');
    } catch (error) {
      toast.error('Ocorreu um erro, tente mais tarde!');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);  
  };

  return (
    <div className={styles.dashboard}>
      {isMobile && (
        <button className={styles.hamburger} onClick={toggleSidebar}>
          <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} /> 
        </button>
      )}

      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.logo}>
          <span>Logo</span>
        </div>
        <ul className={styles.menuList}>
          <li onClick={() => { setActivePage('home'); if (isMobile) setIsSidebarOpen(false); }}>
            <FontAwesomeIcon icon={faHome} />
            <span>Início</span>
          </li>
          <li onClick={() => { setActivePage('clientes'); if (isMobile) setIsSidebarOpen(false); }}>
            <FontAwesomeIcon icon={faUsers} />
            <span>Clientes</span>
          </li>
          <li onClick={() => { setActivePage('fornecedores'); if (isMobile) setIsSidebarOpen(false); }}>
            <FontAwesomeIcon icon={faTruck} />
            <span>Fornecedores</span>
          </li>
          <li onClick={() => { setActivePage('agendamentos'); if (isMobile) setIsSidebarOpen(false); }}>
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
