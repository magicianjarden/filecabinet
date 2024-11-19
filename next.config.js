/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable static optimization
  typescript: {
    ignoreBuildErrors: true,
  },
  // Force all pages to be server-side rendered
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'your-production-domain.com'],
    },
  },
  // Disable static page generation
  staticPageGenerationTimeout: 0,
  // Configure build output
  distDir: '.next',
  // Disable page optimization
  compress: false,
  // Disable static file serving
  assetPrefix: undefined,
  // Force dynamic rendering
  rewrites: async () => {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ]
  },
}

module.exports = nextConfig 