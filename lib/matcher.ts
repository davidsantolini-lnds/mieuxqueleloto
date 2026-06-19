import type { Axis, Category, CatalogEntry, MatchResult } from "./types";
import { BASELINE_DENOMINATOR } from "./types";
import { CATALOG } from "./catalog";
import { AXES, AXIS_ORDER, applyModulators, type Modulator } from "./expander";
import {
  classifyCategory,
  CATEGORY_FALLBACK_LABEL,
  randomPoetic,
} from "./fallback";
import { generateBadFaith, shouldBeBadFaith } from "./badFaith";
import { formatOdds, formatRatio } from "./format";

export { formatOdds, formatRatio } from "./format";

// =============================================================================
// MATCHER (100% client-side, zéro appel réseau)
// -----------------------------------------------------------------------------
// Stratégie « base + modulateurs » pour scaler à 100k+ sans dégrader le match :
//   1. Normalise l'input (minuscule, sans accents, sans mots vides FR).
//   2. Matche la BASE (~300 entrées) via un INVERTED INDEX mot-clé → entrées,
//      donc coût ~O(mots de la requête), pas O(taille de l'espace).
//   3. Détecte les modulateurs (lieu / spécialisation / échelle / format /
//      stade) présents dans la requête, cohérents avec l'entrée, et les
//      applique → variante générée à la volée.
//   4. Seuils + fallbacks (classifier de catégorie, poétique) + mauvaise foi.
// =============================================================================

const STOP_WORDS = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "d", "au", "aux", "à", "a",
  "et", "ou", "où", "en", "dans", "pour", "par", "sur", "avec", "sans", "son",
  "sa", "ses", "mon", "ma", "mes", "ton", "ta", "tes", "notre", "nos", "votre",
  "vos", "leur", "leurs", "ce", "cet", "cette", "ces", "qui", "que", "quoi",
  "dont", "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "se",
  "me", "te", "ne", "pas", "plus", "est", "suis", "es", "sont", "comme", "si",
  "the", "to", "of", "in", "my",
]);

const GENERIC_WEIGHT_WORDS = new Set([
  "ouvrir", "lancer", "creer", "monter", "devenir", "faire", "gagner", "vivre",
  "tenir", "obtenir", "reussir", "trouver", "arriver", "garder",
  "jouer", "finir", "comprendre", "expliquer",
  "etre", "avoir", "tenter", "essayer", "idee", "projet", "activite", "travail",
  "job", "metier", "argent", "riche", "millionnaire", "million", "fortune",
  "reussir", "percer", "gens", "vendre", "carriere", "profession",
]);

const GENERIC_WEIGHT = 0.3;
const STRONG_WEIGHT = 1;
// Poids des mots qui sont des modulateurs d'axe (lieu, « niche », « haut de
// gamme », « franchise »…). On les sous-pondère pour le match de BASE : ils
// servent surtout à moduler, pas à choisir l'activité. Ainsi « boulangerie haut
// de gamme à Lyon » matche bien « boulangerie » (et pas « marque de luxe »).
const AXIS_WEIGHT = 0.4;

let _axisTokens: Set<string> | null = null;
function axisTokens(): Set<string> {
  if (_axisTokens) return _axisTokens;
  const s = new Set<string>();
  for (const axis of AXIS_ORDER) {
    for (const mod of AXES[axis]) {
      for (const kw of mod.keywords) {
        for (const part of normalize(kw).split(/[\s-]+/)) {
          if (part.length >= 2 && !STOP_WORDS.has(part)) s.add(part);
        }
      }
    }
  }
  _axisTokens = s;
  return s;
}

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
    const weight = GENERIC_WEIGHT_WORDS.has(raw)
      ? GENERIC_WEIGHT
      : axisTokens().has(raw)
        ? AXIS_WEIGHT
        : STRONG_WEIGHT;
    tokens.push({ word: raw, weight });
  }
  return tokens;
}

// --- Index inversé sur la BASE -----------------------------------------------

type IndexedBase = {
  entry: CatalogEntry;
  tokenSet: Set<string>;
  tokens: string[];
  phrases: string[]; // mots-clés multi-mots normalisés
};

type Index = {
  bases: IndexedBase[];
  postings: Map<string, number[]>; // token → indices d'entrées de base
  allTokens: string[];
};

let _index: Index | null = null;

function buildIndex(): Index {
  if (_index) return _index;
  const bases: IndexedBase[] = [];
  const postings = new Map<string, number[]>();

  CATALOG.forEach((entry, i) => {
    const tokenSet = new Set<string>();
    const phrases: string[] = [];
    for (const kw of entry.keywords) {
      const normKw = normalize(kw);
      if (normKw.includes(" ")) phrases.push(normKw);
      for (const part of normKw.split(/[\s-]+/)) {
        if (part.length >= 2 && !STOP_WORDS.has(part)) tokenSet.add(part);
      }
    }
    for (const t of tokenSet) {
      let list = postings.get(t);
      if (!list) postings.set(t, (list = []));
      list.push(i);
    }
    bases.push({ entry, tokenSet, tokens: [...tokenSet], phrases });
  });

  _index = { bases, postings, allTokens: [...postings.keys()] };
  return _index;
}

function prefixMatch(a: string, b: string): boolean {
  if (a.length < 4 || b.length < 4) return false;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return long.startsWith(short) && long.length - short.length <= 3;
}

function tokenMatches(word: string, base: IndexedBase): boolean {
  if (base.tokenSet.has(word)) return true;
  if (word.length >= 4) {
    for (const t of base.tokens) {
      if (prefixMatch(word, t)) return true;
    }
  }
  return false;
}

function scoreBase(
  tokens: WeightedToken[],
  inputNorm: string,
  base: IndexedBase,
): number {
  let matched = 0;
  let total = 0;
  for (const t of tokens) {
    total += t.weight;
    if (tokenMatches(t.word, base)) matched += t.weight;
  }
  let score = total > 0 ? matched / total : 0;
  for (const phrase of base.phrases) {
    if (phrase.length >= 5 && inputNorm.includes(phrase)) {
      score = Math.min(1, score + 0.25);
      break;
    }
  }
  return score;
}

/** Ensemble des indices d'entrées candidates pour ces tokens (postings + préfixe). */
function gatherCandidates(tokens: WeightedToken[], idx: Index): Set<number> {
  const cand = new Set<number>();
  for (const t of tokens) {
    const exact = idx.postings.get(t.word);
    if (exact) {
      for (const i of exact) cand.add(i);
    } else if (t.word.length >= 4) {
      for (const it of idx.allTokens) {
        if (prefixMatch(t.word, it)) {
          for (const i of idx.postings.get(it)!) cand.add(i);
        }
      }
    }
  }
  return cand;
}

// --- Index des modulateurs (axes) --------------------------------------------

type IndexedMod = {
  mod: Modulator;
  tokens: Set<string>;
  phrases: string[];
};

let _modIndex: Record<Axis, IndexedMod[]> | null = null;

function buildModIndex(): Record<Axis, IndexedMod[]> {
  if (_modIndex) return _modIndex;
  const out = {} as Record<Axis, IndexedMod[]>;
  for (const axis of AXIS_ORDER) {
    out[axis] = AXES[axis].map((mod) => {
      const tokens = new Set<string>();
      const phrases: string[] = [];
      for (const kw of mod.keywords) {
        const n = normalize(kw);
        if (n.includes(" ")) phrases.push(n);
        else if (n.length >= 2) tokens.add(n);
      }
      return { mod, tokens, phrases };
    });
  }
  _modIndex = out;
  return out;
}

/**
 * Détecte, pour chaque axe cohérent avec l'entrée, le modulateur le plus
 * spécifique présent dans la requête. Ignore les tokens déjà « consommés »
 * par le match de base (pour éviter qu'« ouvrir une franchise » applique
 * deux fois « franchise »).
 */
function extractModifiers(
  entry: CatalogEntry,
  queryWords: Set<string>,
  inputNorm: string,
  consumed: Set<string>,
): { axis: Axis; mod: Modulator }[] {
  const axes = entry.axes;
  if (!axes || axes.length === 0) return [];
  const modIndex = buildModIndex();
  const applied: { axis: Axis; mod: Modulator }[] = [];

  for (const axis of AXIS_ORDER) {
    if (!axes.includes(axis)) continue;
    let best: Modulator | null = null;
    let bestLen = 0;
    for (const { mod, tokens, phrases } of modIndex[axis]) {
      let matchedLen = 0;
      for (const phrase of phrases) {
        if (phrase.length >= 4 && inputNorm.includes(phrase)) {
          matchedLen = Math.max(matchedLen, phrase.length);
        }
      }
      for (const tk of tokens) {
        if (queryWords.has(tk) && !consumed.has(tk)) {
          matchedLen = Math.max(matchedLen, tk.length);
        }
      }
      if (matchedLen > bestLen) {
        best = mod;
        bestLen = matchedLen;
      }
    }
    if (best) applied.push({ axis, mod: best });
  }
  return applied;
}

// --- Catégorie de repli ------------------------------------------------------

function geometricMeanDenominator(category: Category): number {
  const denoms = CATALOG.filter((e) => e.category === category).map(
    (e) => e.oddsDenominator,
  );
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

  if (tokens.length === 0) return poeticResult();

  const idx = buildIndex();
  const candidates = gatherCandidates(tokens, idx);

  let best: IndexedBase | null = null;
  let bestScore = 0;
  for (const i of candidates) {
    const base = idx.bases[i];
    const s = scoreBase(tokens, inputNorm, base);
    if (s > bestScore) {
      bestScore = s;
      best = base;
    }
  }

  if (best && bestScore >= WEAK_THRESHOLD) {
    const entry = best.entry;

    // Tokens consommés par le match de base (exclus de la détection modulateurs).
    const consumed = new Set<string>();
    for (const t of tokens) {
      if (tokenMatches(t.word, best)) consumed.add(t.word);
    }
    const queryWords = new Set(tokens.map((t) => t.word));
    const mods = extractModifiers(entry, queryWords, inputNorm, consumed);

    const { denominator, labels } = applyModulators(entry, mods);
    const label = labels.length
      ? `${entry.label} (${labels.join(", ")})`
      : entry.label;
    const ratioVsLoto = BASELINE_DENOMINATOR / denominator;
    const quality = bestScore >= STRONG_THRESHOLD ? "strong" : "weak";

    return finalize({
      denominator,
      ratioVsLoto,
      label,
      category: entry.category,
      quality,
      source: entry.source,
      estimate: entry.estimate,
      score: bestScore,
      modifiers: labels,
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
    const ratioVsLoto = BASELINE_DENOMINATOR / denominator;
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
  modifiers?: string[];
  opts: MatchOptions;
}): MatchResult {
  const { denominator, ratioVsLoto } = args;

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
      modifiers: args.modifiers,
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
    modifiers: args.modifiers,
  };
}
