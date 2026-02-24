/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Force MongoDB packages to be external (not bundled)
  serverExternalPackages: ['mongoose', 'mongodb', '@auth/mongodb-adapter'],
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Additional webpack config to exclude MongoDB from client bundles
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        dns: false,
        'fs/promises': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
