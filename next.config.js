/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
  // Image optimization
  images: {
    domains: ['your-domain.com'], // Add your image domains
    unoptimized: false,
  },
  // Cache optimization
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },
  // Disable unnecessary features
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure build output
  distDir: '.next',
  // Prevent 404 page generation
  async redirects() {
    return [
      {
        source: '/404',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig 