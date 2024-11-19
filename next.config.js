/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/404',
        destination: '/_not-found',
        permanent: false,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 