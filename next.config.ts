import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Site 100% statique : matching et catalogue bundlés côté client, zéro API.
  output: "export",
  images: {
    unoptimized: true,
  },
  // Évite l'ambiguïté de racine due aux multiples lockfiles du workspace parent.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
