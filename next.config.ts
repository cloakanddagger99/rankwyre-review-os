import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    return [{ source: "/:path*", destination: "/" }];
  },
};

export default nextConfig;
