'use client';

import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./DynamicMap'), { ssr: false });

const MapWrapper = ({ allRoutes = [], radius }) => {
  return <DynamicMap allRoutes={allRoutes} radius={radius} />;
};

export default MapWrapper;
