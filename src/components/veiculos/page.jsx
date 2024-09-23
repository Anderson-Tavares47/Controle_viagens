'use client';

import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import Sidebar from '@/components/sidebar';
import Loading from '@/components/load/loading';

const AddressForm = () => {
  const [vehicle, setVehicle] = useState(''); 
  const [plate, setPlate] = useState(''); 
  const [brand, setBrand] = useState(''); 
  const [model, setModel] = useState(''); 
  const [trackerCode, setTrackerCode] = useState(''); 
  const [renavam, setRenavam] = useState(''); 
  const [tara, setTara] = useState(''); 
  const [vehicleType, setVehicleType] = useState(''); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSave = {
      vehicle,
      plate,
      brand,
      model,
      trackerCode,
      renavam,
      tara,
      vehicleType,
    };

    localStorage.setItem('vehicleData', JSON.stringify(dataToSave));
    alert('Dados do veículo salvos no localStorage!');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <>
      {loading && <Loading message="Carregando..." />}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`${styles.container} ${
          isSidebarOpen ? styles['with-sidebar-open'] : styles['with-sidebar-closed']
        }`}
      >
        {!loading && (
          <form onSubmit={handleSubmit}>

            <div className={styles['form-row']}>
              <label>
                Selecione o Veículo:
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
              <button type="submit">Salvar</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default AddressForm;
