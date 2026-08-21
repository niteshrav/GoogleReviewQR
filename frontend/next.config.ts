import type { NextConfig } from "next";
import path from "path";
import { loadRootEnv } from "../backend/lib/load-root-env";

loadRootEnv();

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
