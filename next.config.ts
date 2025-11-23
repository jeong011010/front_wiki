import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 환경 변수 로딩 확인
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
