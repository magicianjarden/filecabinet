/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable page optimization
  swcMinify: false,
  // Disable static optimization
  optimizeFonts: false,
  // Configure build output
  experimental: {
    // Disable trace analytics
    instrumentationHook: false,
    // Disable static page optimization
    optimizePackageImports: [],
    // Force server components
    serverComponentsExternalPackages: ['*']
  }
}

module.exports = nextConfig 