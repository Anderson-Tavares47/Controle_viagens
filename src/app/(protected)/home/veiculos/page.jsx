'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import Modal from 'react-modal';
import styles from './styles.module.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Veiculos() {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [vehicleData, setVehicleData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vehicle, setVehicle] = useState('');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [trackerCode, setTrackerCode] = useState('');
  const [renavam, setRenavam] = useState('');
  const [tara, setTara] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const router = useRouter();

  const openAddressForm = () => {
    setIsAddressFormOpen(true);
  };

  const closeAddressForm = () => {
    setIsAddressFormOpen(false);
    updateVehicleData();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const updateVehicleData = () => {
    const storedVehicleData = JSON.parse(localStorage.getItem('vehicleData')) || [];
    setVehicleData(storedVehicleData);
  };

  useEffect(() => {
    updateVehicleData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newVehicle = {
      vehicle,
      plate,
      brand,
      model,
      trackerCode,
      renavam,
      tara,
      vehicleType,
    };

    const updatedVehicleData = [...vehicleData, newVehicle];
    localStorage.setItem('vehicleData', JSON.stringify(updatedVehicleData));
    alert('Dados do veículo salvos no localStorage!');
    setIsAddressFormOpen(false);
    updateVehicleData();
  };

  const exportToExcel = () => {
    const dataToExport = vehicleData.map((vehicle) => ({
      Veículo: vehicle.vehicle,
      Placa: vehicle.plate,
      Marca: vehicle.brand,
      Modelo: vehicle.model,
      Rastreador: vehicle.trackerCode,
      Renavam: vehicle.renavam,
      Tara: vehicle.tara,
      'Tipo de Veículo': vehicle.vehicleType,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Veículos');
    XLSX.writeFile(wb, 'veiculos.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF('portrait');
    doc.setFillColor('white');
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

    autoTable(doc, {
      margin: { top: 10, right: 5, bottom: 10, left: 5 },
      head: [['Veículo', 'Placa', 'Marca', 'Modelo', 'Rastreador', 'Renavam', 'Tara', 'Tipo de Veículo']],
      body: vehicleData.map((vehicle) => [
        vehicle.vehicle,
        vehicle.plate,
        vehicle.brand,
        vehicle.model,
        vehicle.trackerCode,
        vehicle.renavam,
        vehicle.tara,
        vehicle.vehicleType,
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

    doc.save('veiculos.pdf');
  };

  const filteredVehicleData = vehicleData.filter((vehicle) => {
    return (
      vehicle.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
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
            <button onClick={openAddressForm} className={styles.openButton}>
              Adicionar Veículo
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
          isOpen={isAddressFormOpen}
          onRequestClose={closeAddressForm}
          className={styles.content}
          overlayClassName={styles.overlay}
          ariaHideApp={false}
        >
          <div className={styles.modalContent}>
            <form onSubmit={handleSubmit}>
              <div className={styles['form-row']}>
                <label>
                  Veículo:
                  <input
                    type="text"
                    placeholder="Veículo"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                  />
                </label>
              </div>

              <div className={styles['form-row']}>
                <label>
                  Placa:
                  <input
                    type="text"
                    placeholder="Placa"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                  />
                </label>
              </div>

              <div className={styles['form-row']}>
                <label>
                  Marca:
                  <input
                    type="text"
                    placeholder="Marca"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </label>
              </div>

              <div className={styles['form-row']}>
                <label>
                  Modelo:
                  <input
                    type="text"
                    placeholder="Modelo"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </label>
              </div>

              <div className={styles['form-row']}>
                <label>
                  Código do Rastreador:
                  <input
                    type="text"
                    placeholder="Código do Rastreador"
                    value={trackerCode}
                    onChange={(e) => setTrackerCode(e.target.value)}
                  />
                </label>
              </div>

              <div className={styles['form-row']}>
                <label>
                  Renavam:
                  <input
                    type="text"
                    placeholder="Renavam"
                    value={renavam}
                    onChange={(e) => setRenavam(e.target.value)}
                  />
                </label>
              </div>

              <div className={styles['form-row']}>
                <label>
                  Tara:
                  <input
                    type="text"
                    placeholder="Tara"
                    value={tara}
                    onChange={(e) => setTara(e.target.value)}
                  />
                </label>
              </div>

              <div className={styles['form-row']}>
                <label>
                  Tipo de Veículo:
                  <input
                    type="text"
                    placeholder="Tipo de Veículo"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                  />
                </label>
              </div>

              <div className={styles['button-row']}>
                <button type="submit">Adicionar Veículo</button>
              </div>
            </form>
          </div>
          <div className={styles.footer}>
            <button className={styles.button} onClick={closeAddressForm}>
              Fechar
            </button>
          </div>
        </Modal>

        {filteredVehicleData.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Veículo</th>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Rastreador</th>
                <th>Renavam</th>
                <th>Tara</th>
                <th>Tipo de Veículo</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicleData.map((vehicle, index) => (
                <tr key={index}>
                  <td>{vehicle.vehicle}</td>
                  <td>{vehicle.plate}</td>
                  <td>{vehicle.brand}</td>
                  <td>{vehicle.model}</td>
                  <td>{vehicle.trackerCode}</td>
                  <td>{vehicle.renavam}</td>
                  <td>{vehicle.tara}</td>
                  <td>{vehicle.vehicleType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.center}>Nenhum Veículo Encontrado</p>
        )}
      </div>
    </>
  );
}
