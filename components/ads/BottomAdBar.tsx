"use client";

import AdSenseBanner, { isAdSenseEnabled } from "./AdSenseBanner";
import AdsterraBanner, { isAdsterraEnabled } from "./AdsterraBanner";

const ADSENSE_SLOT = process.env.NEXT_PUBLIC_ADSENSE_BOTTOM_SLOT;

/**
 * Strip pub sticky en bas d'écran (~60px mobile / ~80px desktop).
 * Priorité : AdSense → Adsterra → message placeholder (dev only).
 */
export default function BottomAdBar() {
  let content: React.ReactNode;

  if (isAdSenseEnabled) {
    content = (
      <AdSenseBanner
        slot={ADSENSE_SLOT}
        format="horizontal"
        style={{ height: "100%", width: "100%" }}
      />
    );
  } else if (isAdsterraEnabled) {
    content = <AdsterraBanner width={728} height={90} />;
  } else {
    content = (
      <span className="text-xs text-muted/80">
        Emplacement publicitaire — actif après configuration AdSense / Adsterra
      </span>
    );
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 mt-2 sm:mt-8">
      <div className="glass flex h-[60px] w-full items-center justify-center overflow-hidden border-x-0 border-b-0 px-3 md:h-[80px]">
        {content}
      </div>
    </div>
  );
}
