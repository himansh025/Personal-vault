import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Add this line
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript checks
  }
};

export default nextConfig;