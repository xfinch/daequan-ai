/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'mongodb', '@auth/mongodb-adapter'],
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Exclude separate Next.js apps from build
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/dashboard-nextjs/**', '**/daequan-nextjs/**'],
    };
    return config;
  },
};

module.exports = nextConfig;
