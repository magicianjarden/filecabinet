/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  images: {
    domains: ['fonts.googleapis.com']
  }
}

module.exports = nextConfig 