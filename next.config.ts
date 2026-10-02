import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactCompiler: true,
  outputFileTracingExcludes: {
    "*": [
      "./public/downloads/**/*",
      "./public/visuals/**/*",
      "./public/media/**/*",
      "./public/uploads/**/*",
      "./node_modules/@swc/**/*",
      "./node_modules/@esbuild/**/*",
      "./node_modules/webpack/**/*",
      "./node_modules/terser/**/*",
    ],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret-key'
  }
} as any;

export default nextConfig;
