/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: [
      'cross-spawn',
      'spawn-sync',
      'adm-zip',
      'tar'
    ],
  },
  eslint: {
    ignoreDuringBuilds: true  // Temporarily ignore ESLint during builds
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        'cross-spawn',
        'spawn-sync',
        'adm-zip',
        'tar'
      );
    }
    return config;
  }
}

module.exports = nextConfig