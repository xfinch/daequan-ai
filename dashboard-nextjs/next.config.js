/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://daequanai.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
