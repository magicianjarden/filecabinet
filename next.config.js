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
    serverActions: true,
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
  },
  kv: {
    database: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  }
}

module.exports = nextConfig