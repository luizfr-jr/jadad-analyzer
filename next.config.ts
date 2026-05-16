import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow large PDF uploads (up to 32MB body)
  experimental: {
    serverActions: {
      bodySizeLimit: '32mb',
    },
  },
  api: {
    bodyParser: false,
  },
} as NextConfig;

export default nextConfig;
