import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://mieuxqueleloto.vercel.app";

// Site en `output: export` (statique) → sitemap pré-rendu au build.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/legal`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
