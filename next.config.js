/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
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
  compress: true, // Enable gzip compression
  productionBrowserSourceMaps: false, // Remove source maps in production
  compiler: {
    // For other options, see https://nextjs.org/docs/architecture/nextjs-compiler#emotion
    emotion: true,
  },
};

module.exports = nextConfig;
