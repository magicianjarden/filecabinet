/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: [
      'cross-spawn',
      'spawn-sync',
      'adm-zip',
      'tar',
      'sharp',
      '@ffmpeg/ffmpeg',
      '@ffmpeg/util',
      '@ffmpeg/core',
      '@ffmpeg/core-mt',
      '@ffmpeg-installer/ffmpeg',
      'pdf-lib',
      'mammoth',
      'jszip'
    ],
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ffmpeg/ffmpeg': '@ffmpeg/ffmpeg/dist/ffmpeg.min.js',
      '@ffmpeg/util': '@ffmpeg/util/dist/util.min.js',
    };
    return config;
  },
  // Add CORS headers for FFmpeg WASM
  async headers() {
    return [
      {
        // Add headers for all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          }
        ],
      },
    ];
  },
  // KV configuration
  kv: {
    database: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  },
  // Image configuration for Sharp
  images: {
    domains: ['*'],
    formats: ['image/avif', 'image/webp'],
  }
};

module.exports = nextConfig;