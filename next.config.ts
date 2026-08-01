import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    // Tree-shake the GSAP barrel so the first load JS stays small.
    optimizePackageImports: ['gsap'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    // Gallery plates are decorative and fixed-ratio; these are the sizes we actually render.
    deviceSizes: [640, 828, 1080, 1200, 1920, 2560],
  },

  async headers() {
    return [
      {
        // Fonts + static chunks are content-hashed, cache them hard.
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
