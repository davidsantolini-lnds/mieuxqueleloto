"use client";

import { useEffect, useRef, useState } from "react";
import { CONSENT_EVENT, readConsent } from "../ConsentBanner";

const BANNER_KEY = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY;

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

/**
 * Bannière Adsterra. Ne s'affiche que si NEXT_PUBLIC_ADSTERRA_BANNER_KEY est défini
 * ET que l'utilisateur a explicitement consenti aux cookies publicitaires (RGPD).
 * Adsterra fonctionne en injectant `atOptions` puis un script `invoke.js` propre
 * à la zone. On le fait dans un conteneur isolé pour éviter les collisions.
 */
export default function AdsterraBanner({ width = 728, height = 90, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    const sync = () => setGranted(readConsent() === "granted");
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!BANNER_KEY || !granted || injected.current || !containerRef.current) return;
    injected.current = true;

    const conf = document.createElement("script");
    conf.type = "text/javascript";
    conf.innerHTML = `atOptions = { 'key':'${BANNER_KEY}','format':'iframe','height':${height},'width':${width},'params':{} };`;

    const invoke = document.createElement("script");
    invoke.type = "text/javascript";
    invoke.src = `//www.highperformanceformat.com/${BANNER_KEY}/invoke.js`;
    invoke.async = true;

    containerRef.current.appendChild(conf);
    containerRef.current.appendChild(invoke);
  }, [width, height, granted]);

  if (!BANNER_KEY) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width, height, maxWidth: "100%", overflow: "hidden" }}
    />
  );
}

export const isAdsterraEnabled = Boolean(BANNER_KEY);
