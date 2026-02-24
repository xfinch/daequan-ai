/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'mongodb', '@auth/mongodb-adapter'],
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;
