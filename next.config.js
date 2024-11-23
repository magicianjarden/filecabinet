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
      'pdf-lib',
      'mammoth',
      'jszip'
    ],
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: (config, { isServer }) => {
    // Handle FFmpeg and other client-side modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ffmpeg/ffmpeg': '@ffmpeg/ffmpeg/dist/ffmpeg.min.js',
      '@ffmpeg/util': '@ffmpeg/util/dist/util.min.js',
    };

    // Handle server-side externals
    if (isServer) {
      config.externals.push(
        'cross-spawn',
        'spawn-sync',
        'adm-zip',
        'tar',
        'sharp',
        'pdf-lib',
        'mammoth',
        'jszip'
      );
    }

    return config;
  },
  // Add CORS headers for FFmpeg WASM
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
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