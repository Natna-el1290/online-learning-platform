/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
    // keep experimental flags minimal
  },

  // External server packages (Next 16+)
  serverExternalPackages: ["@prisma/client"],

  transpilePackages: [],

  // Enforce type checking in production builds
  typescript: {
    ignoreBuildErrors: false,
  },

  // Optimize images for production (set domains as needed)
  images: {
    unoptimized: false,
  },

  // Enable compression for smaller builds
  compress: true,
  reactStrictMode: true,
};

export default nextConfig;
