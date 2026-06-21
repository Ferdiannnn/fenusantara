'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';

// Render SwaggerUI dynamically to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Determine the API URL depending on the environment
    const isProd = process.env.NODE_ENV === 'production';
    const baseUrl = isProd ? 'https://nusantara-self.vercel.app' : 'http://localhost:3000';
    setUrl(`${baseUrl}/api-docs.json`);
  }, []);

  if (!url) {
    return <div className="p-8 text-center text-white">Loading API Documentation...</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <SwaggerUI url={url} />
    </div>
  );
}
