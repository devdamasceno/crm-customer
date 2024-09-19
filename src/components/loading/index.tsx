import React from 'react';
import styles from './Loading.module.css';

const Loading: React.FC = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default Loading;
