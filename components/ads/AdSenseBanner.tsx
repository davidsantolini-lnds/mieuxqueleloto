"use client";

import { useEffect, useRef } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

type Props = {
  /** Identifiant du bloc d'annonce AdSense (data-ad-slot). */
  slot?: string;
  /** Format AdSense (auto par défaut). */
  format?: string;
  className?: string;
  style?: React.CSSProperties;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Bloc AdSense. Ne s'affiche que si NEXT_PUBLIC_ADSENSE_CLIENT_ID est défini.
 * Le script global est chargé dans app/layout.tsx.
 */
export default function AdSenseBanner({ slot, format = "auto", className, style }: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT_ID || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense pas encore prêt — ignoré silencieusement.
    }
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <ins
      className={`adsbygoogle ${className ?? ""}`}
      style={{ display: "block", ...style }}
      data-ad-client={CLIENT_ID}
      data-ad-slot={slot ?? ""}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

export const isAdSenseEnabled = Boolean(CLIENT_ID);
