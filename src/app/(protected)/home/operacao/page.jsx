'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import Modal from 'react-modal';
import styles from './styles.module.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Operacoes() {
  const [isOperationFormOpen, setIsOperationFormOpen] = useState(false);
  const [operationData, setOperationData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [name, setName] = useState('');
  const [operation, setOperation] = useState('');
  const router = useRouter();

  const openOperationForm = () => {
    setIsOperationFormOpen(true);
  };

  const closeOperationForm = () => {
    setIsOperationFormOpen(false);
    updateOperationData();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const updateOperationData = () => {
    const storedOperationData = JSON.parse(localStorage.getItem('operationData')) || [];
    setOperationData(storedOperationData);
  };

  useEffect(() => {
    updateOperationData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newOperation = {
      name,
      operation,
    };

    const updatedOperationData = [...operationData, newOperation];
    localStorage.setItem('operationData', JSON.stringify(updatedOperationData));
    alert('Dados da operação salvos no localStorage!');
    setIsOperationFormOpen(false);
    updateOperationData();
  };

  const exportToExcel = () => {
    const dataToExport = operationData.map((operation) => ({
      Nome: operation.name,
      Operação: operation.operation,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Operações');
    XLSX.writeFile(wb, 'operacoes.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF('portrait');
    doc.setFillColor('white');
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

    autoTable(doc, {
      margin: { top: 10, right: 5, bottom: 10, left: 5 },
      head: [['Nome', 'Operação']],
      body: operationData.map((operation) => [
        operation.name,
        operation.operation,
      ]),
      theme: 'grid',
      startY: 20,
      styles: {
        fontSize: 8,
        cellPadding: 1,
        textColor: 0,
        fillColor: null,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: ['#091f33'],
        textColor: [255, 255, 255],
      },
    });

    doc.save('operacoes.pdf');
  };

  const filteredOperationData = operationData.filter((operation) => {
    return (
      operation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.operation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`${styles.container} ${isSidebarOpen ? styles['with-sidebar-open'] : styles['with-sidebar-closed']}`}
      >
        <div className={styles.searchContainer}>
          <span className={styles.searchLabel}>Buscar</span>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.buttonContainer}>
            <button onClick={openOperationForm} className={styles.openButton}>
              Adicionar Operação
            </button>
          </div>
          <div className={styles.buttonContainer}>
            <button onClick={exportToExcel} className={styles.exportButton}>
              Exportar para Excel
            </button>
            <button onClick={exportToPDF} className={styles.exportButton}>
              Exportar para PDF
            </button>
          </div>
        </div>

        <Modal
          isOpen={isOperationFormOpen}
          onRequestClose={closeOperationForm}
          className={styles.content}
          overlayClassName={styles.overlay}
          ariaHideApp={false}
        >
          <div className={styles.modalContent}>
            <form onSubmit={handleSubmit}>
              <div className={styles['form-row']}>
                <label>
                  Nome:
                  <input
                    type="text"
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              </div>

              <div className={styles['form-row']}>
                <label>
                  Operação:
                  <input
                    type="text"
                    placeholder="Operação"
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                  />
                </label>
              </div>

              <div className={styles['button-row']}>
                <button type="submit">Salvar Operação</button>
              </div>
            </form>
          </div>
          <div className={styles.footer}>
            <button className={styles.button} onClick={closeOperationForm}>
              Fechar
            </button>
          </div>
        </Modal>

        {filteredOperationData.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Operação</th>
              </tr>
            </thead>
            <tbody>
              {filteredOperationData.map((operation, index) => (
                <tr key={index}>
                  <td>{operation.name}</td>
                  <td>{operation.operation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.center}>Nenhuma Operação Encontrada</p>
        )}
      </div>
    </>
  );
}
