/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true
  },
  distDir: '.next',
  async redirects() {
    return [];
  }
}

module.exports = nextConfig 