/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable static optimization
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