'use server'

import axios from 'axios';

export async function getCoordinates(address) {
  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: address,
      format: 'json',
      addressdetails: 1,
      limit: 1,
    },
    headers: {
      'User-Agent': 'MeuApp/1.0 (https://meusite.com; contato@meusite.com)',
    },
  });

  console.log(response, 'aqui response')

  if (response.data.length === 0) {
    throw new Error('Address not found');
  }

  const { lat, lon } = response.data[0];
  return [parseFloat(lat), parseFloat(lon)];
}

export async function getRoutes(start, end) {
  const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&alternatives=true&geometries=geojson`);
  const routes = response.data.routes.map(route => ({
    coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
    duration: route.duration // duração em segundos
  }));
  return routes;
}


// import { revalidatePath  } from "next/cache"
// import * as apis from '@/core/clients/drivers'

// export async function signin() {
//   revalidatePath('/teste/dashboard')
//   const response = await apis.teste()
//   return response
// }
