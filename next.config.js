/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ["src", "playwright-tests"],
  },
  images: {
    remotePatterns: [{ hostname: "www.google.com" }],
  },
};

module.exports = nextConfig;
