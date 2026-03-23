import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://api.greyhound-predictor.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
