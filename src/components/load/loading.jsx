import React from 'react';
import styles from './styles.module.css';

const Loading = ({ message = "Carregando..." }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>{message}</p>
    </div>
  );
};

export default Loading;
