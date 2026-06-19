// Types partagés pour le moteur « Mieux que le Loto »

export type Category =
  | "hasard"
  | "investissement"
  | "entrepreneuriat"
  | "createur"
  | "artiste"
  | "sport"
  | "metier"
  | "speculatif"
  | "absurde";

/**
 * Axes d'expansion. Chaque entrée déclare les axes qui lui sont *cohérents*
 * (filtre logique : une boulangerie a un lieu mais pas de « format online » ;
 * un SaaS a un format mais pas de ville). L'expander combine ces axes pour
 * générer, à la volée, l'espace des variantes — sans jamais le matérialiser.
 */
export type Axis = "lieu" | "specialisation" | "echelle" | "format" | "stage";

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
  /** Axes d'expansion cohérents avec cette activité. */
  axes?: Axis[];
};

export const LOTO_DENOMINATOR = 19_068_840; // 1 chance sur 19 068 840 — FDJ Loto
export const EUROMILLIONS_DENOMINATOR = 139_838_160; // 1 chance — EuroMillions
export const MYMILLION_DENOMINATOR = 5_000_000; // 1 chance — code MyMillion (FDJ)

// Nouveau baseline de comparaison : Loto OU MyMillion (les deux à la fois).
// 1 / (1/19068840 + 1/5000000) ≈ 1 chance sur 3 961 313.
export const BASELINE_DENOMINATOR = Math.round(
  1 / (1 / LOTO_DENOMINATOR + 1 / MYMILLION_DENOMINATOR),
);
export const BASELINE_LABEL = "Loto + MyMillion";

export type MatchQuality = "strong" | "weak" | "category" | "poetic";

export type MatchResult = {
  /** Probabilité finale : 1 / denominator. */
  denominator: number;
  /** Combien de fois plus (ou moins) de chances qu'au Loto. >1 = mieux. */
  ratioVsLoto: number;
  /** Libellé de l'activité retenue (modulateurs inclus). */
  label: string;
  category: Category | null;
  quality: MatchQuality;
  source?: string;
  estimate?: boolean;
  /** Score de matching brut (overlap pondéré), pour debug. */
  score: number;
  /** Phrase prête à afficher (peut être de la mauvaise foi). */
  message: string;
  /** true si la réponse a été remplacée par une punchline de mauvaise foi. */
  badFaith: boolean;
  /** Disclaimer optionnel (match faible). */
  disclaimer?: string;
  /** Étiquettes des modulateurs appliqués, ex: ["à Paris", "en franchise"]. */
  modifiers?: string[];
};
