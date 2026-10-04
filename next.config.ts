import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...((process.env.NEXTPIER_DESKTOP ?? process.env.MYNEXTJS_DESKTOP) === '1'
    ? {
        output: 'standalone',
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
