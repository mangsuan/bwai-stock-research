import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.26"],
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
