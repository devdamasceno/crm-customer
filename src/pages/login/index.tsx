// pages/login.tsx
import React, { useState, useContext } from 'react';
import Input from '@/src/components/input';
import Button from '@/src/components/button';
import { AuthContext } from '@/src/contexts/AuthContext';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { handleLogin, loadingAuth } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await handleLogin(email, password);
    } catch (err) {
      setError('Failed to login. Please check your credentials and try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
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
        <Button label={loadingAuth ? 'Loading...' : 'Login'} type="submit" variant="primary" disabled={loadingAuth} />
      </form>
    </div>
  );
};

export default Login;
