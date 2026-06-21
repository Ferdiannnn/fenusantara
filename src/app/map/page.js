'use client';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div id="loader">
      <div className="spinner"></div>
      <div style={{ fontWeight: 800, color: '#6366f1', letterSpacing: '1px', fontSize: '1rem', textTransform: 'uppercase' }}>
        Memuat Peta Nusantara...
      </div>
    </div>
  ),
});

export default function MapPage() {
  return <MapComponent />;
}
