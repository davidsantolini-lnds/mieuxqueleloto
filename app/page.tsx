import type { Metadata } from "next";
import Comparator from "@/components/Comparator";
import { effectiveCount } from "@/lib/expander";
import { match } from "@/lib/matcher";
import { formatOdds } from "@/lib/format";
import { BASELINE_DENOMINATOR } from "@/lib/types";

const BASELINE_PRETTY = BASELINE_DENOMINATOR.toLocaleString("fr-FR");
// Compteur calculé dynamiquement depuis l'espace combinatoire de l'expander.
const EFFECTIVE_PRETTY = effectiveCount().toLocaleString("fr-FR");

/**
 * Quand un visiteur partage `/?q=...`, on calcule le match côté serveur et on
 * pousse une preview OpenGraph dynamique (image générée par /api/og). Sans
 * `?q`, on retombe sur la metadata par défaut de app/layout.tsx.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  if (!q) return {};

  const result = match(q);
  if (result.quality === "poetic") return {};

  const ogUrl = `/api/og?n=${result.denominator}&r=${result.ratioVsLoto}&l=${encodeURIComponent(result.label)}`;
  const title = `${formatOdds(result.denominator)} — ${result.label}`;
  const description = `${formatOdds(result.denominator)} de devenir millionnaire en « ${result.label} ». Comparé à l'EuroMillions sur mieuxqueleloto.fr.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      type: "website",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-4 pt-6 sm:pb-20 sm:pt-12 md:pt-16">
      {/* Hero */}
      <section className="animate-fade-up w-full max-w-2xl text-center">
        <span className="inline-block rounded-full border border-ink/10 bg-white/50 px-3 py-1 text-[11px] font-semibold tracking-wide text-muted sm:px-4 sm:py-1.5 sm:text-xs">
          🎰 {EFFECTIVE_PRETTY} activités comparées
        </span>

        <h1 className="mt-3 text-[1.75rem] font-extrabold leading-[1.08] tracking-tight sm:mt-5 sm:text-4xl md:text-6xl">
          Vaut mieux faire <span className="brand-text">ça</span>
          <br /> ou gagner à l&apos;EuroMillions&nbsp;?
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-base text-muted sm:mt-5 sm:text-lg">
          Tape une activité. On calcule tes vraies chances de devenir{" "}
          <strong className="text-ink">millionnaire</strong>, et on les compare
          à l&apos;EuroMillions&nbsp;
          <span className="whitespace-nowrap">
            (1 chance sur {BASELINE_PRETTY})
          </span>
          .
        </p>
      </section>

      {/* Champ + résultat */}
      <section className="mt-5 w-full sm:mt-8">
        <Comparator />
      </section>
    </main>
  );
}
