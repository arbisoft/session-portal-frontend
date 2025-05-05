/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ["src", "playwright-tests"],
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
