/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Only specify packages that should be bundled
    serverComponentsExternalPackages: [
      '@aws-sdk/client-s3',
      'sharp',
      'firebase-admin'
    ]
  }
}

module.exports = nextConfig 