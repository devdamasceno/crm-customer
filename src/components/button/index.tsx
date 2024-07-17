import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, variant = 'primary', ...props }) => {
  return (
    <button className={`${styles.button} ${styles[variant]}`} {...props}>
      {label}
    </button>
  );
};

export default Button;
