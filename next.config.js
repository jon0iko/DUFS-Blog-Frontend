/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['localhost'], // Add any external domains you'll use for images
      unoptimized: process.env.NODE_ENV === 'development' ? true : true,
    },
    output: 'export', // Set for static site generation
    trailingSlash: true, // Useful for CPanel deployments
    typescript: {
      // Check TypeScript during builds
      ignoreBuildErrors: process.env.NODE_ENV === 'development' ? true : false,
    },
  }
  
  module.exports = nextConfig