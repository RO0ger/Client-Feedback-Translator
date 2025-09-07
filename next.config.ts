import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@planetscale/database', 'postgres', 'drizzle-orm'],
  },
  // Force all API routes to use Node.js runtime for database compatibility
  runtime: 'nodejs',
};

export default nextConfig;
