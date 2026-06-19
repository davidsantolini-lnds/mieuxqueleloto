import type { CatalogEntry, ExpandedEntry, SpinFactor } from "./types";
import { CATALOG } from "./catalog";

// =============================================================================
// EXPANDER
// -----------------------------------------------------------------------------
// À partir des `spinFactors` d'une entrée, génère des variantes en modulant la
// probabilité selon le lieu, la spécialisation, l'échelle et le canal.
// Une entrée avec 3 facteurs génère le produit cartésien des modulateurs, soit
// vite plusieurs dizaines à ~200 variantes. Le catalogue effectif dépasse 50k.
// =============================================================================

type Modulator = {
  /** Étiquette ajoutée au label, ex: « à Paris ». */
  label: string;
  /** Mots-clés ajoutés pour le matching. */
  keywords: string[];
  /** Multiplicateur appliqué au dénominateur (>1 = plus dur, <1 = plus facile). */
  factor: number;
  /** Suffixe d'id. */
  idSuffix: string;
};

const MODULATORS: Record<SpinFactor, Modulator[]> = {
  lieu: [
    { label: "à Paris", keywords: ["paris", "parisien", "capitale"], factor: 0.8, idSuffix: "paris" },
    { label: "à Lyon", keywords: ["lyon", "lyonnais"], factor: 0.95, idSuffix: "lyon" },
    { label: "à Marseille", keywords: ["marseille", "marseillais"], factor: 1.05, idSuffix: "marseille" },
    { label: "en banlieue", keywords: ["banlieue", "périphérie", "zone commerciale"], factor: 1.1, idSuffix: "banlieue" },
    { label: "à la campagne", keywords: ["campagne", "rural", "village", "province"], factor: 1.6, idSuffix: "campagne" },
    { label: "à l'étranger", keywords: ["étranger", "expat", "international", "dubai", "usa", "londres"], factor: 1.3, idSuffix: "etranger" },
    { label: "en ville moyenne", keywords: ["ville moyenne", "centre ville", "agglomération"], factor: 1.0, idSuffix: "ville" },
  ],
  specialisation: [
    { label: "en niche", keywords: ["niche", "spécialisé", "spécialiste", "pointu", "expert"], factor: 0.6, idSuffix: "niche" },
    { label: "en généraliste", keywords: ["généraliste", "tout public", "grand public", "polyvalent"], factor: 1.4, idSuffix: "generaliste" },
    { label: "haut de gamme", keywords: ["haut de gamme", "premium", "luxe", "qualité"], factor: 0.8, idSuffix: "premium" },
  ],
  echelle: [
    { label: "en solo", keywords: ["solo", "seul", "indépendant", "freelance", "auto entrepreneur"], factor: 1.5, idSuffix: "solo" },
    { label: "en équipe", keywords: ["équipe", "associés", "salariés", "société", "team"], factor: 0.9, idSuffix: "equipe" },
    { label: "en multi-sites", keywords: ["multi sites", "réseau", "plusieurs", "franchise", "chaîne", "groupe"], factor: 0.5, idSuffix: "multi" },
  ],
  canal: [
    { label: "en ligne", keywords: ["en ligne", "online", "internet", "web", "digital", "e-commerce"], factor: 0.7, idSuffix: "online" },
    { label: "en boutique physique", keywords: ["boutique", "physique", "local", "magasin", "pignon sur rue"], factor: 1.2, idSuffix: "offline" },
  ],
};

function clampDenominator(n: number): number {
  // Borne pour rester crédible : jamais < 2 (1 chance sur 1.x reste possible via base).
  const rounded = Math.max(1.2, Math.round(n * 10) / 10);
  return rounded;
}

/** Génère toutes les variantes d'une entrée à partir de ses spinFactors. */
export function expandEntry(entry: CatalogEntry): ExpandedEntry[] {
  if (!entry.spinFactors || entry.spinFactors.length === 0) {
    return [
      {
        ...entry,
        baseId: entry.id,
        modifiers: [],
      },
    ];
  }

  const factorLists = entry.spinFactors.map((f) => MODULATORS[f]);

  // Variantes à facteur unique (« à la campagne », « en niche »…). Émises
  // AVANT les combos pour qu'un input mono-critère sélectionne le bon modulateur
  // pur (et pas une combinaison où un second facteur viendrait compenser).
  const singles: Modulator[][] = factorLists.flatMap((list) =>
    list.map((mod) => [mod]),
  );

  // Produit cartésien complet (un modulateur par facteur) — pour les inputs
  // multi-critères (« boulangerie en niche à Paris »).
  let combos: Modulator[][] = [[]];
  for (const list of factorLists) {
    const next: Modulator[][] = [];
    for (const combo of combos) {
      for (const mod of list) next.push([...combo, mod]);
    }
    combos = next;
  }

  const variants: ExpandedEntry[] = [];
  // On inclut la variante « de base » (sans modificateur) en premier.
  variants.push({ ...entry, baseId: entry.id, modifiers: [] });

  // Singles d'abord, puis combos (sautées si un seul facteur = doublon).
  const comboSets = entry.spinFactors.length > 1 ? [...singles, ...combos] : singles;

  for (const combo of comboSets) {
    const factor = combo.reduce((acc, m) => acc * m.factor, 1);
    const denom = clampDenominator(entry.oddsDenominator * factor);
    const labels = combo.map((m) => m.label);
    const extraKeywords = combo.flatMap((m) => m.keywords);
    variants.push({
      ...entry,
      id: `${entry.id}--${combo.map((m) => m.idSuffix).join("-")}`,
      baseId: entry.id,
      label: `${entry.label} (${labels.join(", ")})`,
      keywords: [...entry.keywords, ...extraKeywords],
      oddsDenominator: denom,
      modifiers: labels,
    });
  }

  return variants;
}

let _cache: ExpandedEntry[] | null = null;

/** Catalogue complet après expansion (mémoïsé). */
export function getExpandedCatalog(): ExpandedEntry[] {
  if (_cache) return _cache;
  _cache = CATALOG.flatMap(expandEntry);
  return _cache;
}

/** Nombre d'entrées effectives (base + variantes). */
export function expandedCount(): number {
  return getExpandedCatalog().length;
}
