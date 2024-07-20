import React from 'react';
import { PulseLoader } from 'react-spinners';
import styles from './Button.module.css';

interface ButtonProps {
  label: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, type = 'button', variant = 'primary', disabled = false, loading = false, onClick }) => {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {loading ? <PulseLoader size={10} color="#ffffff" /> : label}
    </button>
  );
};

export default Button;
