/** @type {import('next').NextConfig} */
const nextConfig = {
  // 환경 변수 설정 추가
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "/api", // 프록시를 통한 API 호출용
  },

  // 기존 프록시 설정 유지
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
