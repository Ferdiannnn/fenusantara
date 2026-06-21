/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Gunakan URL backend Vercel jika di production, atau localhost saat dev
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://nusantara-self.vercel.app' 
      : 'http://localhost:3000';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/maps/:path*',
        destination: `${backendUrl}/maps/:path*`,
      }
    ];
  }
};


export default nextConfig;
