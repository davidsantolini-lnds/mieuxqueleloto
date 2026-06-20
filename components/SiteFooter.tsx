"use client";

import { resetConsent } from "./ConsentBanner";

export default function SiteFooter() {
  return (
    <footer className="mt-auto w-full px-2 pt-6 pb-2 text-center text-[11px] text-muted/70 sm:pt-10">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span>© 2026 — Mieux que le Loto&nbsp;?</span>
        <a href="/legal" className="hover:text-ink">
          Mentions légales
        </a>
        <button
          type="button"
          onClick={resetConsent}
          className="hover:text-ink"
        >
          Gérer mes cookies
        </button>
      </div>
    </footer>
  );
}
