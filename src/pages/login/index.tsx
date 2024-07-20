import React, { useState, useContext } from 'react';
import Input from '@/src/components/input';
import Button from '@/src/components/button';
import { AuthContext } from '@/src/contexts/AuthContext';
import styles from './Login.module.css';
import Head from 'next/head';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { handleLogin, loadingAuth } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmail('');
    setPassword('')
    try {
      await handleLogin(email, password, setEmail, setPassword);
    } catch (err) {
      setError('Falha ao fazer login. Verifique suas credenciais e tente novamente.');
    }
  };

  return (
    <>
      <Head>
        <title>Bem vindo - Login</title>
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Bem vindo 👋</h1>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ? error : ''}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error ? error : ''}
            required
          />
          {error && <div className={styles.error}>{error}</div>}
          <Button label={loadingAuth ? 'Entrando...' : 'Login'} type="submit" variant="primary" disabled={loadingAuth} loading={loadingAuth} />
        </form>
      </div>
    </>
  );
};

export default Login;
