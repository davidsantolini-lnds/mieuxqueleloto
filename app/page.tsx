import Comparator from "@/components/Comparator";
import { CATALOG } from "@/lib/catalog";
import { expandedCount } from "@/lib/expander";

const LOTO_PRETTY = (19_068_840).toLocaleString("fr-FR");

export default function Home() {
  const baseCount = CATALOG.length;
  const effective = expandedCount();

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-28 pt-12 md:pt-20">
      {/* Hero */}
      <section className="animate-fade-up w-full max-w-2xl text-center">
        <span className="inline-block rounded-full border border-ink/10 bg-white/50 px-4 py-1.5 text-xs font-semibold tracking-wide text-muted">
          🎰 La calculette anti-Loto
        </span>

        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
          Vaut mieux faire <span className="brand-text">ça</span>
          <br className="hidden sm:block" /> ou jouer au Loto ?
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-lg text-muted">
          Tape une activité. On calcule tes vraies chances de devenir{" "}
          <strong className="text-ink">millionnaire</strong>, et on les compare
          au Loto&nbsp;
          <span className="whitespace-nowrap">
            (1 chance sur {LOTO_PRETTY})
          </span>
          .
        </p>
      </section>

      {/* Champ + résultat */}
      <section className="mt-9 w-full">
        <Comparator />
      </section>

      {/* Footer minimal */}
      <footer className="mt-auto w-full max-w-2xl px-2 pt-16 text-center text-xs text-muted">
        <p>
          {baseCount} activités de base, ~{effective.toLocaleString("fr-FR")}{" "}
          combinaisons calculées. Probabilités sourcées ou estimées honnêtement
          — à prendre avec humour, pas comme un conseil financier.
        </p>
        <p className="mt-2">
          Fait avec 🎰 pour rappeler qu'à peu près tout est mieux que le Loto.
        </p>
      </footer>
    </main>
  );
}
