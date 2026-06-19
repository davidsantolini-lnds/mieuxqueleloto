// Types partagés pour le moteur « Mieux que le Loto »

export type Category =
  | "hasard"
  | "investissement"
  | "entrepreneuriat"
  | "createur"
  | "artiste"
  | "sport"
  | "metier"
  | "speculatif";

/** Facteurs sur lesquels l'expander génère des variations d'une entrée. */
export type SpinFactor = "lieu" | "specialisation" | "echelle" | "canal";

export type CatalogEntry = {
  id: string;
  /** Libellé humain affichable, ex: « Ouvrir une boulangerie rentable 5 ans ». */
  label: string;
  /** Mots-clés normalisés/normalisables servant au matching. */
  keywords: string[];
  /** Numérateur de la probabilité (presque toujours 1). */
  oddsNumerator: number;
  /** Dénominateur : « 1 chance sur N ». */
  oddsDenominator: number;
  category: Category;
  /** Référence publique (INSEE, BPI, Forbes, étude…). */
  source?: string;
  /** true si la proba est une estimation honnête plutôt qu'une donnée sourcée. */
  estimate?: boolean;
  /** Facteurs d'expansion (lieu, spécialisation…) pour générer des variantes. */
  spinFactors?: SpinFactor[];
};

/** Une entrée du catalogue après expansion (variante générée). */
export type ExpandedEntry = CatalogEntry & {
  /** id de l'entrée de base dont dérive cette variante. */
  baseId: string;
  /** Étiquettes des modulateurs appliqués, ex: ["à Paris", "en niche"]. */
  modifiers: string[];
};

export const LOTO_DENOMINATOR = 19_068_840; // 1 chance sur 19 068 840 — FDJ Loto
export const EUROMILLIONS_DENOMINATOR = 139_838_160; // 1 chance — EuroMillions

export type MatchQuality = "strong" | "weak" | "category" | "poetic";

export type MatchResult = {
  /** Probabilité finale : 1 / denominator. */
  denominator: number;
  /** Combien de fois plus (ou moins) de chances qu'au Loto. >1 = mieux. */
  ratioVsLoto: number;
  /** Libellé de l'activité retenue. */
  label: string;
  category: Category | null;
  quality: MatchQuality;
  source?: string;
  estimate?: boolean;
  /** Score de matching brut (Jaccard pondéré), pour debug. */
  score: number;
  /** Phrase prête à afficher (peut être de la mauvaise foi). */
  message: string;
  /** true si la réponse a été remplacée par une punchline de mauvaise foi. */
  badFaith: boolean;
  /** Disclaimer optionnel (match faible). */
  disclaimer?: string;
};
