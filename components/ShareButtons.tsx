"use client";

import { useState } from "react";
import type { MatchResult } from "@/lib/types";
import { formatOdds, formatRatio } from "@/lib/format";

function buildShareText(result: MatchResult, query: string): string {
  if (result.quality === "poetic") {
    return `J'ai demandé à « Mieux que le Loto ? » mes chances de devenir millionnaire avec « ${query} ». Verdict : ${result.message}`;
  }
  return `Devenir millionnaire en « ${result.label} » : ${formatOdds(
    result.denominator,
  )}. Soit ${formatRatio(result.ratioVsLoto)} 🎰 Teste ton idée :`;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://mieuxqueleloto.fr";

export default function ShareButtons({
  result,
  query,
}: {
  result: MatchResult;
  query: string;
}) {
  const [copied, setCopied] = useState(false);
  const text = buildShareText(result, query);
  const url = query
    ? `${SITE_URL}/?q=${encodeURIComponent(query)}`
    : SITE_URL;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text,
  )}&url=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${text} ${url}`,
  )}`;

  async function nativeOrCopy() {
    const shareData = { title: "Mieux que le Loto ?", text, url };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* annulé → on tombe sur la copie */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponible */
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-medium text-muted">Partager :</span>

      <button
        onClick={nativeOrCopy}
        className="brand-bg rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md transition active:scale-95"
      >
        {copied ? "Copié ✓" : "Partager"}
      </button>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white active:scale-95"
      >
        𝕏 / Twitter
      </a>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white active:scale-95"
      >
        WhatsApp
      </a>
    </div>
  );
}
