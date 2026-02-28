import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'http://46.225.29.192:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
