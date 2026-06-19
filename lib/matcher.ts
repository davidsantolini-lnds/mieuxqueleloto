import type { Category, ExpandedEntry, MatchResult } from "./types";
import { LOTO_DENOMINATOR } from "./types";
import { getExpandedCatalog } from "./expander";
import {
  classifyCategory,
  CATEGORY_FALLBACK_LABEL,
  randomPoetic,
} from "./fallback";
import { generateBadFaith, shouldBeBadFaith } from "./badFaith";

// =============================================================================
// MATCHER (100% client-side, zéro appel réseau)
// -----------------------------------------------------------------------------
// 1. Normalise l'input (minuscule, sans accents, sans mots vides FR).
// 2. Score chaque entrée par chevauchement de mots-clés (overlap pondéré).
// 3. Seuils : >0.3 fort · 0.15-0.3 faible (+disclaimer) · sinon classifier de
//    catégorie · sinon fallback poétique.
// 4. 1 réponse sur 4 → mauvaise foi.
// =============================================================================

// Mots vides FR à retirer.
const STOP_WORDS = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "d", "au", "aux", "à", "a",
  "et", "ou", "où", "en", "dans", "pour", "par", "sur", "avec", "sans", "son",
  "sa", "ses", "mon", "ma", "mes", "ton", "ta", "tes", "notre", "nos", "votre",
  "vos", "leur", "leurs", "ce", "cet", "cette", "ces", "qui", "que", "quoi",
  "dont", "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "se",
  "me", "te", "ne", "pas", "plus", "est", "suis", "es", "sont", "comme", "si",
  "the", "to", "of", "in", "my",
]);

// Mots génériques d'action : signal faible (poids réduit).
const GENERIC_WEIGHT_WORDS = new Set([
  "ouvrir", "lancer", "creer", "monter", "devenir", "faire", "gagner", "vivre",
  "etre", "avoir", "tenter", "essayer", "idee", "projet", "activite", "travail",
  "job", "metier", "argent", "riche", "millionnaire", "million", "fortune",
  "reussir", "percer", "gens", "vendre",
]);

const GENERIC_WEIGHT = 0.3;
const STRONG_WEIGHT = 1;

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type WeightedToken = { word: string; weight: number };

export function tokenize(text: string): WeightedToken[] {
  const norm = normalize(text);
  if (!norm) return [];
  const seen = new Set<string>();
  const tokens: WeightedToken[] = [];
  for (const raw of norm.split(/[\s-]+/)) {
    if (raw.length < 2) continue;
    if (STOP_WORDS.has(raw)) continue;
    if (seen.has(raw)) continue;
    seen.add(raw);
    tokens.push({
      word: raw,
      weight: GENERIC_WEIGHT_WORDS.has(raw) ? GENERIC_WEIGHT : STRONG_WEIGHT,
    });
  }
  return tokens;
}

// --- Index des entrées : tokens de mots-clés précalculés ---------------------

type IndexedEntry = {
  entry: ExpandedEntry;
  tokenSet: Set<string>;
  tokens: string[];
  phrases: string[]; // mots-clés multi-mots normalisés (pour bonus de phrase)
};

let _index: IndexedEntry[] | null = null;

function buildIndex(): IndexedEntry[] {
  if (_index) return _index;
  _index = getExpandedCatalog().map((entry) => {
    const tokenSet = new Set<string>();
    const phrases: string[] = [];
    for (const kw of entry.keywords) {
      const normKw = normalize(kw);
      if (normKw.includes(" ")) phrases.push(normKw);
      for (const part of normKw.split(/[\s-]+/)) {
        if (part.length >= 2 && !STOP_WORDS.has(part)) tokenSet.add(part);
      }
    }
    return { entry, tokenSet, tokens: [...tokenSet], phrases };
  });
  return _index;
}

function tokenMatches(word: string, idx: IndexedEntry): boolean {
  if (idx.tokenSet.has(word)) return true;
  // Match par préfixe pour les pluriels/genres/déclinaisons uniquement
  // (« boulanger » ~ « boulangerie »). On exige un préfixe d'au moins 4
  // caractères ET un écart de longueur faible, sinon « foot » avalerait
  // « footballeur » ou « prof » avalerait « professionnel ».
  if (word.length >= 4) {
    for (const t of idx.tokens) {
      if (t.length < 4) continue;
      const [short, long] = word.length <= t.length ? [word, t] : [t, word];
      if (long.startsWith(short) && long.length - short.length <= 3) return true;
    }
  }
  return false;
}

function scoreEntry(
  tokens: WeightedToken[],
  inputNorm: string,
  idx: IndexedEntry,
): number {
  let matched = 0;
  let total = 0;
  for (const t of tokens) {
    total += t.weight;
    if (tokenMatches(t.word, idx)) matched += t.weight;
  }
  let score = total > 0 ? matched / total : 0;
  // Bonus si un mot-clé multi-mots apparaît tel quel dans l'input.
  for (const phrase of idx.phrases) {
    if (phrase.length >= 5 && inputNorm.includes(phrase)) {
      score = Math.min(1, score + 0.25);
      break;
    }
  }
  return score;
}

// --- Formatage (réexporté depuis le module léger) ----------------------------

export { formatOdds, formatRatio } from "./format";
import { formatOdds, formatRatio } from "./format";

function geometricMeanDenominator(category: Category): number {
  const denoms = getExpandedCatalog()
    .filter((e) => e.category === category && !e.id.includes("--"))
    .map((e) => e.oddsDenominator);
  if (denoms.length === 0) return 10_000;
  const logSum = denoms.reduce((acc, d) => acc + Math.log(d), 0);
  return Math.exp(logSum / denoms.length);
}

// --- API principale ----------------------------------------------------------

const STRONG_THRESHOLD = 0.3;
const WEAK_THRESHOLD = 0.15;

export type MatchOptions = {
  /** Désactive la mauvaise foi (tests, debug). */
  disableBadFaith?: boolean;
};

export function match(input: string, opts: MatchOptions = {}): MatchResult {
  const tokens = tokenize(input);
  const inputNorm = normalize(input);

  // Input vide → fallback poétique direct.
  if (tokens.length === 0) {
    return poeticResult();
  }

  // Meilleur score sur tout le catalogue étendu.
  const index = buildIndex();
  let best: IndexedEntry | null = null;
  let bestScore = 0;
  for (const idx of index) {
    const s = scoreEntry(tokens, inputNorm, idx);
    if (s > bestScore) {
      bestScore = s;
      best = idx;
    }
  }

  if (best && bestScore >= WEAK_THRESHOLD) {
    const e = best.entry;
    const denominator = e.oddsDenominator;
    const ratioVsLoto = LOTO_DENOMINATOR / denominator;
    const quality = bestScore >= STRONG_THRESHOLD ? "strong" : "weak";
    return finalize({
      denominator,
      ratioVsLoto,
      label: e.label,
      category: e.category,
      quality,
      source: e.source,
      estimate: e.estimate,
      score: bestScore,
      disclaimer:
        quality === "weak"
          ? "Match approximatif — on a fait au mieux avec ce que tu as tapé."
          : undefined,
      opts,
    });
  }

  // Fallback catégorie via classifier de mots.
  const category = classifyCategory(inputNorm) ?? classifyCategory(input);
  if (category) {
    const denominator = geometricMeanDenominator(category);
    const ratioVsLoto = LOTO_DENOMINATOR / denominator;
    return finalize({
      denominator,
      ratioVsLoto,
      label: CATEGORY_FALLBACK_LABEL[category],
      category,
      quality: "category",
      score: bestScore,
      estimate: true,
      disclaimer:
        "Pas d'entrée précise, mais on a deviné la famille d'activité — estimation large.",
      opts,
    });
  }

  // Rien → poétique.
  return poeticResult();
}

function poeticResult(): MatchResult {
  return {
    denominator: 0,
    ratioVsLoto: 0,
    label: "Activité non répertoriée",
    category: null,
    quality: "poetic",
    score: 0,
    message: randomPoetic(),
    badFaith: false,
  };
}

function finalize(args: {
  denominator: number;
  ratioVsLoto: number;
  label: string;
  category: Category;
  quality: "strong" | "weak" | "category";
  source?: string;
  estimate?: boolean;
  score: number;
  disclaimer?: string;
  opts: MatchOptions;
}): MatchResult {
  const { denominator, ratioVsLoto } = args;

  // Mauvaise foi 1 fois sur 4.
  if (!args.opts.disableBadFaith && shouldBeBadFaith()) {
    const bf = generateBadFaith({ label: args.label, denominator, ratioVsLoto });
    return {
      denominator,
      ratioVsLoto,
      label: args.label,
      category: args.category,
      quality: args.quality,
      source: args.source,
      estimate: args.estimate,
      score: args.score,
      message: bf.text,
      badFaith: true,
      disclaimer: args.disclaimer,
    };
  }

  const message = `${formatOdds(denominator)}. Soit ${formatRatio(ratioVsLoto)}.`;
  return {
    denominator,
    ratioVsLoto,
    label: args.label,
    category: args.category,
    quality: args.quality,
    source: args.source,
    estimate: args.estimate,
    score: args.score,
    message,
    badFaith: false,
    disclaimer: args.disclaimer,
  };
}
