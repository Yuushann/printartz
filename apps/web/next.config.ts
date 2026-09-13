import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Consume the workspace TS packages directly (no separate build step).
  transpilePackages: ["@printartz/shared", "@printartz/db", "@printartz/ai"],
  // Let Prisma's engine-free runtime (+ its WASM query compiler) load from
  // node_modules at runtime instead of being bundled.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
};

export default nextConfig;
