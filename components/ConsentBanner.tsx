"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "mql-consent";
export type ConsentValue = "granted" | "denied";

export const CONSENT_EVENT = "mql-consent-change";

/** Lit le consent stocké (null si jamais demandé). */
export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

/** Pour le bouton « Gérer mes cookies » du footer : remet à zéro et ré-ouvre le banner. */
export function resetConsent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

function writeConsent(v: ConsentValue) {
  window.localStorage.setItem(STORAGE_KEY, v);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: v }));
}

/**
 * Bandeau RGPD minimal. Aucun cookie/script tiers chargé tant que l'utilisateur
 * n'a pas cliqué « Tout accepter ». Boutons accept/refuse symétriques.
 */
export default function ConsentBanner() {
  // Caché tant qu'on ne sait pas s'il faut l'afficher (évite un flash au load).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => setVisible(readConsent() === null);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies publicitaires"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-6 sm:pb-6"
    >
      <div className="glass mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-ink/10 p-4 text-sm shadow-2xl sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <p className="flex-1 text-ink/90">
          On utilise des cookies pour la pub (AdSense / Adsterra) et la mesure
          d&apos;audience anonyme. Tu peux refuser : le site marche pareil, juste
          sans pub personnalisée.{" "}
          <a href="/legal" className="underline hover:text-ink">
            En savoir plus
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => writeConsent("denied")}
            className="rounded-xl border border-ink/15 bg-white/70 px-4 py-2 text-sm font-semibold text-ink/80 transition hover:bg-white"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => writeConsent("granted")}
            className="brand-bg rounded-xl px-4 py-2 text-sm font-bold text-white shadow transition hover:brightness-105"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
