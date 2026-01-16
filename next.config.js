/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://ecommerce-backend-qm1k.onrender.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;