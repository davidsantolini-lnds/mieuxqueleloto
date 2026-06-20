import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pas d'`output: export` : on a besoin d'une route serverless pour la
  // génération d'images OG dynamiques (cf. app/api/og/route.tsx).
  // Le reste des pages reste pré-rendu statiquement par Next (SSG) —
  // coût Vercel ~nul.
  images: {
    unoptimized: true,
  },
  // Évite l'ambiguïté de racine due aux multiples lockfiles du workspace parent.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
