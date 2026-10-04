import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.MYNEXTJS_DESKTOP === '1'
    ? {
        output: 'standalone',
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
