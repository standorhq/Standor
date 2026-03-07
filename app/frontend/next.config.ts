import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@react-three/drei'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  webpack(config) {
    // Silence critical dependency warnings from monaco-editor
    config.module?.exprContextCritical && (config.module.exprContextCritical = false);
    return config;
  },
};

export default nextConfig;
