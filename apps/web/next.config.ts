import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Consume the workspace TS packages directly (no separate build step).
  transpilePackages: ["@printartz/shared"],
};

export default nextConfig;
