import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'render.albiononline.com',
        port: '',
        pathname: '/v1/item/**',
      },
    ],
  },
};

export default nextConfig;
