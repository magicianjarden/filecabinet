/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable static page generation
  generateStaticParams: false,
  // Disable static exports
  trailingSlash: false,
  // Force dynamic rendering
  dynamicParams: true,
}

module.exports = nextConfig 