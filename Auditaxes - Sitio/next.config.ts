import type { NextConfig } from 'next';

const apiOrigin = 'http://127.0.0.1:4100';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/api/public/content/:siteId', destination: `${apiOrigin}/api/public/content/:siteId` },
      { source: '/api/public/publication-images/:filename', destination: `${apiOrigin}/api/public/publication-images/:filename` },
    ];
  },
};

export default nextConfig;
