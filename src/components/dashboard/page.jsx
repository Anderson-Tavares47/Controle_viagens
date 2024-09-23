'use client';

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { getCoordinates, getRoutes } from './action';
import DynamicMap from './DynamicMap';
import styles from './styles.module.css';
import Sidebar from '@/components/sidebar';
import Loading from '@/components/load/loading';

const AddressForm = () => {
  const [start, setStart] = useState('');
  const [destinations, setDestinations] = useState(['']);
  const [radius, setRadius] = useState(3);
  const [routes, setRoutes] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]); // Para seleção múltipla de segmentos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [vehicle, setVehicle] = useState(''); // Novo estado para veículos
  const [startTimeExpected, setStartTimeExpected] = useState(''); // Novo estado para data e hora de início previsto
  const [endTimeExpected, setEndTimeExpected] = useState(''); // Novo estado para data e hora de fim previsto
  const [startTime, setStartTime] = useState(''); // Novo estado para data e hora de início
  const [endTime, setEndTime] = useState(''); // Novo estado para data e hora de fim
  const [status, setStatus] = useState(''); // Novo estado para status
  const [invoice, setInvoice] = useState(''); // Novo estado para notas fiscais
  const [saveCompleteRoute, setSaveCompleteRoute] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const customStyles = (isSidebarOpen) => ({
    content: {
      left: isSidebarOpen ? 'calc(25% + 120px)' : '10%',
      width: '100%',
      maxWidth: isSidebarOpen ? '800px' : '1500px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    },
  });

  useEffect(() => {
    const loadDrivers = async () => {
      const driverList = [
        { id: '1', name: 'João Silva' },
        { id: '2', name: 'Maria Oliveira' },
        { id: '3', name: 'Carlos Souza' }
      ];
      setDrivers(driverList);
    };

    loadDrivers();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && document.getElementById('__next')) {
      Modal.setAppElement('#__next');
    }
  }, []);

  const handleAddDestination = () => {
    setDestinations([...destinations, '']);
  };

  const handleDestinationChange = (index, value) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDriver) {
      alert('Por favor, selecione um motorista.');
      return;
    }

    try {
      setLoading(true);
      const allRoutes = [];
      const startCoordinates = await getCoordinates(start);

      let previousCoordinates = startCoordinates;

      for (const destination of destinations) {
        if (destination) {
          const endCoordinates = await getCoordinates(destination);
          const segmentRoutes = await getRoutes(previousCoordinates, endCoordinates);
          allRoutes.push(...segmentRoutes);
          previousCoordinates = endCoordinates;
        }
      }

      setRoutes(allRoutes);
      setSelectedSegments([0]); // Seleciona o primeiro segmento por padrão
      setIsModalOpen(true);
    } catch (error) {
      console.error('Erro ao obter as coordenadas:', error);
      alert('Não foi possível obter as coordenadas ou calcular as rotas. Por favor, verifique os endereços e tente novamente.');
    } finally {
      setLoading(false); // Desativa o loading após a operação
    }
  };

  const handleSegmentChange = (index) => {
    setSelectedSegments(prevSelectedSegments =>
      prevSelectedSegments.includes(index)
        ? prevSelectedSegments.filter(i => i !== index) // Remove o segmento se já estiver selecionado
        : [...prevSelectedSegments, index] // Adiciona o segmento se não estiver selecionado
    );
  };

  // const saveSelectedRoutes = () => {
  //   let dataToSave;

  //   if (saveCompleteRoute) {
  //     // Salva a rota completa
  //     dataToSave = {
  //       driver: selectedDriver,
  //       vehicle: vehicle, // Adiciona veículo
  //       startTimeExpected: startTimeExpected, // Adiciona data e hora de início previsto
  //       endTimeExpected: endTimeExpected, // Adiciona data e hora de fim previsto
  //       startTime: startTime, // Adiciona data e hora de início
  //       endTime: endTime, // Adiciona data e hora de fim
  //       status: status, // Adiciona status
  //       invoice: invoice, // Adiciona notas fiscais
  //       radius: radius,
  //       routes: [{
  //         coordinates: routes.flatMap(route => route.coordinates),
  //         duration: routes.reduce((total, route) => total + route.duration, 0),
  //       }]
  //     };
  //   } else {
  //     // Salva os segmentos selecionados
  //     if (selectedSegments.length > 0) {
  //       const segmentsToSave = selectedSegments.map(index => ({
  //         coordinates: routes[index].coordinates,
  //         duration: routes[index].duration,
  //       }));
  //       dataToSave = {
  //         driver: selectedDriver,
  //         vehicle: vehicle,
  //         startTimeExpected: startTimeExpected,
  //         endTimeExpected: endTimeExpected,
  //         startTime: startTime,
  //         endTime: endTime,
  //         status: status,
  //         invoice: invoice,
  //         radius: radius,
  //         routes: segmentsToSave,
  //       };
  //     } else {
  //       alert('Por favor, selecione pelo menos um segmento.');
  //       return;
  //     }
  //   }

  //   localStorage.setItem('selectedRoutes', JSON.stringify(dataToSave));
  //   alert('Rotas, motorista, veículo e raio salvos no localStorage!');
  //   closeModal();
  // };

  const saveSelectedRoutes = () => {
    let dataToSave;

    if (saveCompleteRoute) {
        // Salva a rota completa
        dataToSave = {
            driver: selectedDriver,
            vehicle: vehicle,
            startTimeExpected: startTimeExpected,
            endTimeExpected: endTimeExpected,
            startTime: startTime,
            endTime: endTime,
            status: status,
            invoice: invoice,
            radius: radius,
            startCity: start, // Nome da cidade de início
            endCity: destinations[destinations.length - 1], // Nome da cidade de fim
            additionalDestinations: destinations.slice(0, -1), // Destinos adicionais, se houver
            routes: [{
                coordinates: routes.flatMap(route => route.coordinates),
                duration: routes.reduce((total, route) => total + route.duration, 0),
            }]
        };
    } else {
        // Salva os segmentos selecionados
        if (selectedSegments.length > 0) {
            const segmentsToSave = selectedSegments.map(index => ({
                coordinates: routes[index].coordinates,
                duration: routes[index].duration,
            }));
            dataToSave = {
                driver: selectedDriver,
                vehicle: vehicle,
                startTimeExpected: startTimeExpected,
                endTimeExpected: endTimeExpected,
                startTime: startTime,
                endTime: endTime,
                status: status,
                invoice: invoice,
                radius: radius,
                startCity: start, // Nome da cidade de início
                endCity: destinations[destinations.length - 1], // Nome da cidade de fim
                additionalDestinations: destinations.slice(0, -1), // Destinos adicionais, se houver
                routes: segmentsToSave,
            };
        } else {
            alert('Por favor, selecione pelo menos um segmento.');
            return;
        }
    }

    // Recupera os dados existentes de selectedRoutes ou inicializa como um objeto
    let savedRoutes = JSON.parse(localStorage.getItem('selectedRoutes')) || { routes: [] };

    // Verifica se 'routes' dentro de 'savedRoutes' é um array
    if (!Array.isArray(savedRoutes.routes)) {
        alert('Erro: o formato dos dados salvos está incorreto.');
        return;
    }

    // Adiciona a nova rota ao array de rotas existente
    savedRoutes.routes.push(dataToSave);

    // Salva o objeto atualizado no localStorage
    localStorage.setItem('selectedRoutes', JSON.stringify(savedRoutes));
    alert('Rota salva com sucesso!');
    closeModal();
};




  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {loading && <Loading message="Carregando..." />}
      {/* <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> */}
      {/* <div
        className={`${styles.container} ${
          isSidebarOpen ? styles['with-sidebar-open'] : styles['with-sidebar-closed']
        }`}
      > */}
        {!loading && (
          <form onSubmit={handleSubmit}>
            <div className={styles['form-row']}>
              <label>
                Selecione o Motorista:
                <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
                  <option value="">Selecione um motorista</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

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
                Data e Hora de Início Previsto:
                <input
                  type="datetime-local"
                  value={startTimeExpected}
                  onChange={(e) => setStartTimeExpected(e.target.value)}
                />
              </label>
            </div>

            <div className={styles['form-row']}>
              <label>
                Data e Hora de Fim Previsto:
                <input
                  type="datetime-local"
                  value={endTimeExpected}
                  onChange={(e) => setEndTimeExpected(e.target.value)}
                />
              </label>
            </div>

            <div className={styles['form-row']}>
              <label>
                Data e Hora de Início:
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>
            </div>

            <div className={styles['form-row']}>
              <label>
                Data e Hora de Fim:
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </label>
            </div>

            <div className={styles['form-row']}>
              <label>
                Status:
                <input
                  type="text"
                  placeholder="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
              </label>
            </div>

            <div className={styles['form-row']}>
              <label>
                Notas Fiscais:
                <input
                  type="text"
                  placeholder="Insira as Notas Fiscais"
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                />
              </label>
            </div>
            
            <div className={styles['form-row']}>
              <label>
                Início:
                <input
                  type="text"
                  placeholder="Endereço de início"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
            </div>
    
            {destinations.map((destination, index) => (
              <div className={styles['form-row']} key={index}>
                <label>
                  Destino {index + 1}:
                  <input
                    type="text"
                    placeholder={`Endereço de destino ${index + 1}`}
                    value={destination}
                    onChange={(e) => handleDestinationChange(index, e.target.value)}
                  />
                </label>
              </div>
            ))}
    
            <div className={styles['button-row']}>
              <button type="button" onClick={handleAddDestination}>Adicionar Destino</button>
            </div>
    
            <div className={styles['form-row']}>
              <label>
                Raio (km):
                <input
                  type="number"
                  placeholder="Raio em km"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                />
              </label>
            </div>
    
            <div className={styles['button-row']}>
              <button type="submit">Obter Rotas</button>
            </div>
          </form>
        )}
        
        <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customStyles(isSidebarOpen)} ariaHideApp={false}>
          <h2 className={styles.titleModal}>Rotas Calculadas</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '20px',
            }}
          >
            <div>
              <div>
                <label className={styles.labelModal}>Selecione os Segmentos da Rota:</label>
                <div>
                  {routes.map((route, index) => (
                    <div key={index} className={styles.inputLabelContainer}>
                      <input
                        type="checkbox"
                        checked={selectedSegments.includes(index)}
                        onChange={() => handleSegmentChange(index)}
                        className={styles.inputModal}
                      />
                      <label className={styles.labelModalRota}> {`Rota ${index + 1}`}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <button onClick={saveSelectedRoutes} className={styles.buttonModal}>Salvar Rotas</button>
                <button onClick={closeModal} className={styles.buttonModalClose}>Fechar</button>
              </div>
            </div>
            <div style={{
              minHeight:'800px'
            }}>
              {selectedSegments.length > 0 && (
                <DynamicMap allRoutes={selectedSegments.map(index => routes[index])} radius={radius} />
              )}
            </div>
          </div>
        </Modal>
      {/* </div> */}
    </>
  );
};

export default AddressForm;
