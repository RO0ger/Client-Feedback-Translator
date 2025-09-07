import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@planetscale/database', 'postgres', 'drizzle-orm'],
};

export default nextConfig;
