import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Enable Bun's optimizations for specific packages
    optimizePackageImports: ['react-icons', '@dnd-kit/core', '@dnd-kit/sortable'],
  },
  // Use Bun's runtime for server components (moved from experimental)
  serverExternalPackages: [] as string[],
  // Optimize for Bun's runtime
  reactStrictMode: true,
  // swcMinify is now enabled by default in Next.js 15+
};

export default nextConfig;
