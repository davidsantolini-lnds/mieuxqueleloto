"use client";

import type { MatchResult } from "@/lib/types";
import { LOTO_DENOMINATOR } from "@/lib/types";
import { formatOdds, formatRatio } from "@/lib/format";
import ShareButtons from "./ShareButtons";

const MIN_DENOM = 1.2;
const MAX_DENOM = 139_838_160; // EuroMillions = la barre la plus vide

/** Position sur une échelle log : 0% = quasi impossible, 100% = quasi sûr. */
function logFill(denominator: number): number {
  if (denominator <= 0) return 0;
  const d = Math.min(Math.max(denominator, MIN_DENOM), MAX_DENOM);
  const pct =
    ((Math.log(MAX_DENOM) - Math.log(d)) /
      (Math.log(MAX_DENOM) - Math.log(MIN_DENOM))) *
    100;
  return Math.max(3, Math.min(100, pct));
}

function lotoFill() {
  return logFill(LOTO_DENOMINATOR);
}

export default function ResultCard({
  result,
  query,
}: {
  result: MatchResult;
  query: string;
}) {
  const isPoetic = result.quality === "poetic";
  const fill = logFill(result.denominator);
  const better = result.ratioVsLoto >= 1;

  return (
    <div className="animate-reveal glass mx-auto mt-8 w-full max-w-xl rounded-3xl p-6 md:p-8">
      <p className="text-sm font-medium text-muted">
        {isPoetic ? "Verdict" : `Devenir millionnaire en : ${result.label}`}
      </p>

      {!isPoetic && (
        <div className="mt-3">
          <div className="text-3xl font-extrabold leading-tight md:text-4xl">
            <span className="brand-text">{formatOdds(result.denominator)}</span>
          </div>
          <p
            className={`mt-2 text-lg font-bold ${
              better ? "text-violet" : "text-muted"
            }`}
          >
            {formatRatio(result.ratioVsLoto)}
          </p>
        </div>
      )}

      {/* Phrase / message (peut être de la mauvaise foi) */}
      <p className="mt-4 text-base leading-relaxed text-ink/90">
        {result.message}
      </p>

      {result.badFaith && (
        <span className="mt-2 inline-block rounded-full bg-pink/15 px-3 py-1 text-xs font-semibold text-pink">
          🤥 réponse de mauvaise foi
        </span>
      )}

      {result.disclaimer && (
        <p className="mt-3 text-xs italic text-muted">{result.disclaimer}</p>
      )}

      {/* Barre log : ton activité vs le Loto */}
      {!isPoetic && (
        <div className="mt-6">
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className="animate-bar brand-bg h-full rounded-full"
              style={{ width: `${fill}%` }}
            />
            {/* Repère Loto */}
            <div
              className="absolute top-1/2 h-5 w-[3px] -translate-y-1/2 rounded bg-ink/60"
              style={{ left: `calc(${lotoFill()}% - 1.5px)` }}
              title="Niveau du Loto"
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted">
            <span>impossible</span>
            <span>↑ Loto</span>
            <span>quasi sûr</span>
          </div>
        </div>
      )}

      {result.source && (
        <p className="mt-4 text-[11px] text-muted">
          Source / base d'estimation : {result.source}
          {result.estimate ? " · estimation" : ""}
        </p>
      )}
      {!result.source && result.estimate && !isPoetic && (
        <p className="mt-4 text-[11px] text-muted">
          Estimation honnête (pas de stat publique parfaite pour ça).
        </p>
      )}

      <ShareButtons result={result} query={query} />
    </div>
  );
}
