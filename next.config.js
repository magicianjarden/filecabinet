/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle ffmpeg on client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
      }
    }
    // Ignore ffmpeg modules in client bundle
    config.module.rules.push({
      test: /node_modules\/@ffmpeg-installer\/ffmpeg|node_modules\/@ffprobe-installer\/ffprobe|node_modules\/fluent-ffmpeg/,
      use: 'null-loader'
    })
    return config
  }
}

module.exports = nextConfig 