/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
      {
        source: '/maps/:path*',
        destination: 'http://localhost:3000/maps/:path*',
      }
    ];
  }
};


export default nextConfig;
