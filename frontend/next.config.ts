import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.26"],
  output: "export",
  basePath: "/bwai-stock-research",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
