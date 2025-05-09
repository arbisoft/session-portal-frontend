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
};

module.exports = nextConfig;
