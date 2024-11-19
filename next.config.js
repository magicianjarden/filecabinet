/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return {
      fallback: [
        {
          source: '/:path*',
          destination: '/_not-found',
        },
      ],
    }
  },
}

module.exports = nextConfig 