import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://localhost:3000/api/:path*', // بيمشي الطلب من خلال Next.js
        },
      ]
    },
};

export default nextConfig;
