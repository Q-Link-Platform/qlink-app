import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    outputFileTracingExcludes: {
      "*": [
        "./public/downloads/**/*",
        "./public/visuals/**/*.mp4",
        "./public/media/**/*.mp4",
      ],
    },
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret-key'
  }
};

export default nextConfig;
