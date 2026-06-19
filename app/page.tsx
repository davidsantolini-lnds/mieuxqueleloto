import Comparator from "@/components/Comparator";
import { effectiveCount } from "@/lib/expander";
import { BASELINE_DENOMINATOR } from "@/lib/types";

const BASELINE_PRETTY = BASELINE_DENOMINATOR.toLocaleString("fr-FR");
// Compteur calculé dynamiquement depuis l'espace combinatoire de l'expander.
const EFFECTIVE_PRETTY = effectiveCount().toLocaleString("fr-FR");

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-28 pt-12 md:pt-20">
      {/* Hero */}
      <section className="animate-fade-up w-full max-w-2xl text-center">
        <span className="inline-block rounded-full border border-ink/10 bg-white/50 px-4 py-1.5 text-xs font-semibold tracking-wide text-muted">
          🎰 {EFFECTIVE_PRETTY} activités comparées
        </span>

        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
          Vaut mieux faire <span className="brand-text">ça</span>
          <br className="hidden sm:block" /> ou jouer au Loto ?
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-lg text-muted">
          Tape une activité. On calcule tes vraies chances de devenir{" "}
          <strong className="text-ink">millionnaire</strong>, et on les compare
          au Loto + MyMillion&nbsp;
          <span className="whitespace-nowrap">
            (1 chance sur {BASELINE_PRETTY})
          </span>
          .
        </p>
      </section>

      {/* Champ + résultat */}
      <section className="mt-9 w-full">
        <Comparator />
      </section>

      {/* Footer ultra-minimal — aucun détail sur le fonctionnement interne. */}
      <footer className="mt-auto w-full px-2 pt-16 text-center text-[11px] text-muted/70">
        © 2026 — Mieux que le Loto&nbsp;?
      </footer>
    </main>
  );
}
