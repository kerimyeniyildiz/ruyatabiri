import type { NextConfig } from "next";

const r2Base = process.env.R2_PUBLIC_BASE_URL;

let remotePatterns: NextConfig["images"]["remotePatterns"] = [];

if (r2Base) {
  try {
    const url = new URL(r2Base);
    remotePatterns = [
      {
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: `${url.pathname.replace(/\/$/, "") || ""}/**`,
      },
    ];
  } catch (error) {
    console.warn("Invalid R2_PUBLIC_BASE_URL:", error);
  }
}

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ["@ruyatabiri/database"],
  images: {
    remotePatterns,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  output: "standalone",
};

export default nextConfig;
