/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://13.209.4.64:8080/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
