"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import type { MatchResult } from "@/lib/types";
import ResultCard from "./ResultCard";

const PLACEHOLDERS = [
  "ouvrir une boulangerie",
  "devenir streamer Twitch",
  "écrire un livre best-seller",
  "lancer une appli pour se garer",
  "ouvrir un food truck",
  "investir en bourse",
  "devenir footballeur pro",
  "monter une startup IA",
  "vendre des bougies",
  "gagner Top Chef",
  "devenir youtubeur",
  "ouvrir un kebab",
];

const EXAMPLES = [
  "Ouvrir une boulangerie",
  "Devenir streamer",
  "Lancer un SaaS",
  "Investir en immobilier",
  "Devenir influenceur",
  "Gagner Roland-Garros",
];

export default function Comparator() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [submitted, setSubmitted] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  // Deep-link : ?q=... pré-remplit et lance la comparaison (liens partageables).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      setQuery(q);
      void run(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Le moteur (catalogue + matcher) est chargé à la demande : il sort ainsi
  // du JS de premier rendu et n'impacte pas le LCP.
  async function run(value: string) {
    const v = value.trim();
    if (!v) return;
    setSubmitted(v);
    const { match } = await import("@/lib/matcher");
    setResult(match(v));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    run(query);
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-xl">
        <div className="glass flex flex-col gap-3 rounded-3xl p-3 sm:flex-row sm:items-center sm:p-2.5">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ex : ${PLACEHOLDERS[placeholderIdx]}…`}
            aria-label="Décris ton activité"
            className="w-full flex-1 rounded-2xl bg-white/60 px-5 py-4 text-lg text-ink outline-none placeholder:text-muted/70 focus:bg-white/90"
          />
          <button
            type="submit"
            className="brand-bg rounded-2xl px-7 py-4 text-lg font-bold text-white shadow-lg transition hover:brightness-105 active:scale-95"
          >
            Comparer
          </button>
        </div>
      </form>

      {/* Exemples cliquables */}
      <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setQuery(ex);
              run(ex);
            }}
            className="rounded-full border border-ink/10 bg-white/50 px-3 py-1.5 text-sm text-muted transition hover:bg-white/80 hover:text-ink"
          >
            {ex}
          </button>
        ))}
      </div>

      {result && <ResultCard result={result} query={submitted} />}
    </div>
  );
}
