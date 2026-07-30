import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  eslint: {
    // Monorepo: deps live at repo root; skip ESLint during Vercel builds.
    ignoreDuringBuilds: true,
  },
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
