import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Fotos de porciones subidas a Google Drive (la planilla tiene el link; lib/planilla lo convierte).
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/d/**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
