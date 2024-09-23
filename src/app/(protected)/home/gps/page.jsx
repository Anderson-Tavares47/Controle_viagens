"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import Loading from '@/components/load/loading';
import Sidebar from '@/components/sidebar';
import styles from './styles.module.css';

const MapView = () => {
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [leaflet, setLeaflet] = useState(null);
  const [mapComponents, setMapComponents] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInsideFence, setIsInsideFence] = useState(false); // Estado para verificar se o marcador está dentro do raio

  const createFencePolygon = (coords, bufferDistance) => {
    if (!coords || coords.length < 2) {
      console.error("Não há coordenadas suficientes para criar um polígono.");
      return null;
    }

    const lineCoords = coords.map(coord => {
      if (Array.isArray(coord) && coord.length === 2) {
        const lat = parseFloat(coord[0]);
        const lon = parseFloat(coord[1]);

        if (!isNaN(lat) && !isNaN(lon)) {
          return [lon, lat]; // Turf.js espera [lon, lat]
        } else {
          return null;
        }
      } else {
        return null;
      }
    }).filter(Boolean); // Remove coordenadas inválidas (null)

    if (lineCoords.length < 2) {
      return null;
    }

    const distance = bufferDistance || 1; // Define o valor padrão de 1 km se bufferDistance for indefinido
    const line = turf.lineString(lineCoords);
    const buffered = turf.buffer(line, distance, { units: 'kilometers' });
    return buffered.geometry.coordinates[0];
  };

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        const [L, reactLeaflet] = await Promise.all([
          import('leaflet'),
          import('react-leaflet')
        ]);
        setLeaflet(L);
        setMapComponents(reactLeaflet);
      }
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    const routeData = localStorage.getItem('gps');
    if (routeData) {
      const parsedData = JSON.parse(routeData);

      if (parsedData.routes && Array.isArray(parsedData.routes)) {
        setSavedRoutes(parsedData.routes);
      } else {
        setSavedRoutes([parsedData]); // Caso tenha apenas uma rota
      }
    } else {
      alert('Nenhuma rota salva encontrada.');
    }
  }, []);

  useEffect(() => {
    if (savedRoutes.length > 0) {
      // Verifica se o ponto está dentro de qualquer uma das rotas
      const staticLocation = [-0.2201641, -78.5123274]; // Localização fixa do marcador
      const insideAnyRoute = savedRoutes.some(route => {
        const polygonCoords = createFencePolygon(route.coordinates, route.radius);
        if (!polygonCoords) return false;

        const point = turf.point(staticLocation);
        const polygon = turf.polygon([polygonCoords]);

        return turf.booleanPointInPolygon(point, polygon);
      });
      setIsInsideFence(insideAnyRoute);
    }
  }, [savedRoutes]);

  if (!leaflet || !mapComponents || savedRoutes.length === 0) {
    return <Loading />;
  }

  const { MapContainer, TileLayer, Polyline, Polygon, Marker, Tooltip } = mapComponents;

  const mapCenter = savedRoutes[0].coordinates.length > 0 
    ? savedRoutes[0].coordinates[0] 
    : [-30.0346, -51.2177];

  const staticLocation = [-0.2201641, -78.5123274];

  // Definindo o ícone do marcador com base na posição do ponto
  const markerIcon = leaflet.icon({
    iconUrl: isInsideFence 
      ? 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'
      : 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`${styles.container} ${
          isSidebarOpen ? styles['with-sidebar-open'] : styles['with-sidebar-closed']
        }`}
      >
        <h2 style={{ color: 'white' }}>Visualização das Rotas</h2>
        <MapContainer center={mapCenter} zoom={6} style={{ height: '100vh', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Itera sobre todas as rotas salvas e desenha no mapa */}
          {savedRoutes.map((route, routeIndex) => (
            <React.Fragment key={routeIndex}>
              <Polyline positions={route.coordinates.map(coord => [coord[0], coord[1]])} color="blue" />
              {route.coordinates.length > 1 && (
                <Polygon 
                  positions={createFencePolygon(route.coordinates, route.radius)?.map(coord => [coord[1], coord[0]])} 
                  pathOptions={{ color: 'red', fillOpacity: 0.2 }} 
                />
              )}
            </React.Fragment>
          ))}

          {/* Exibe um marcador fixo com a cor dependente do raio */}
          <Marker position={staticLocation} icon={markerIcon}>
            <Tooltip direction="top" offset={[0, -30]} opacity={1}>
              Localização Estática
            </Tooltip>
          </Marker>
        </MapContainer>
      </div>
    </>
  );
};

export default MapView;
