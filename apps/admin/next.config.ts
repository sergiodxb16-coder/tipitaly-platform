import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita che webpack bundlerizzi Prisma e i workspace packages lato server:
  // il native addon (.dylib.node) deve essere caricato da Node.js, non da webpack.
  serverExternalPackages: ["@prisma/client"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
