/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { hostname: "sessions.arbisoft.com" },
      { hostname: "www.google.com" },
      { hostname: "localhost" },
      { hostname: "loremflickr.com" },
    ],
  },
  reactStrictMode: true,
  swcMinify: true, // Faster and smaller output
  compress: true, // Enable gzip compression
  productionBrowserSourceMaps: false, // Remove source maps in production
};

module.exports = nextConfig;
