/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ["src", "playwright-tests"],
  },
  images: {
    domains: ["www.google.com"],
  },
};

module.exports = nextConfig;
