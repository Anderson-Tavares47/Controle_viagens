'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';

const DynamicMap = ({ allRoutes = [], radius }) => {
  const [leaflet, setLeaflet] = useState(null);
  const [mapComponents, setMapComponents] = useState(null);
  const [fencePolygons, setFencePolygons] = useState([]);
  const [completeRoute, setCompleteRoute] = useState([]);

  // Array de cores para as rotas
  const routeColors = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'];

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        const [L, reactLeaflet] = await Promise.all([
          import('leaflet'),
          import('react-leaflet')
        ]);
        const defaultIcon = L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        L.Marker.prototype.options.icon = defaultIcon;
        setLeaflet(L);
        setMapComponents(reactLeaflet);
      }
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    const processRoutes = (routes) => {
      const polygons = routes.map(route => {
        const routeRadius = parseFloat(radius);
        return createFencePolygon(route.coordinates, routeRadius);
      });
      setFencePolygons(polygons);

      // Criando a rota completa
      const fullRoute = routes.flatMap(route => route.coordinates);
      setCompleteRoute(fullRoute);
    };

    if (allRoutes.length > 0) {
      processRoutes(allRoutes);
    }
  }, [allRoutes, radius]);

  const createFencePolygon = (coords, bufferDistance) => {
    if (!coords || coords.length < 2) return null;
    const lineCoords = coords.map(coord => [coord[1], coord[0]]);
    const line = turf.lineString(lineCoords);
    const buffered = turf.buffer(line, bufferDistance, { units: 'kilometers' });
    return buffered.geometry.coordinates[0];
  };

  if (!leaflet || !mapComponents) {
    return <div>Loading map...</div>;
  }

  const { MapContainer, TileLayer, Polygon, Polyline } = mapComponents;

  const defaultCenter = [-30.0346, -51.2177];
  const firstRoute = allRoutes[0] || {};
  const mapCenter = firstRoute.coordinates?.[0] || defaultCenter;

  return (
    <MapContainer center={mapCenter} zoom={6} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {allRoutes.map((route, index) => (
        <React.Fragment key={`route-group-${index}`}>
          {route.coordinates && (
            <Polyline
              positions={route.coordinates.map(coord => [coord[0], coord[1]])}
              color={routeColors[index % routeColors.length]} // Cor baseada no índice
            />
          )}
          {fencePolygons[index] && (
            <Polygon
              positions={fencePolygons[index].map(coord => [coord[1], coord[0]])}
              pathOptions={{ color: 'red', fillColor: 'none', fillOpacity: 0.5 }}
            />
          )}
        </React.Fragment>
      ))}

      {/* Adicionando a rota completa */}
      {completeRoute.length > 0 && (
        <Polyline positions={completeRoute.map(coord => [coord[0], coord[1]])} color="blue" />
      )}
    </MapContainer>
  );
};

export default DynamicMap;
