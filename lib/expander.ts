import type { Axis, CatalogEntry } from "./types";
import { CATALOG } from "./catalog";

// =============================================================================
// EXPANDER — scale algorithmique
// -----------------------------------------------------------------------------
// On NE matérialise PAS les ~100k variantes (ce serait 20 Mo de bundle + mort
// du matching). À la place : une base hand-curatée + des AXES de modulation.
// Le matcher (lib/matcher.ts) matche d'abord la BASE (rapide, précis), puis
// applique les modulateurs détectés dans la requête. L'espace combinatoire
// complet est donc *calculable* (voir effectiveCount) mais généré à la volée.
//
// Chaque modulateur applique un multiplicateur au dénominateur :
//   facteur < 1 → plus facile (dénominateur plus petit)
//   facteur > 1 → plus dur   (dénominateur plus grand)
// =============================================================================

export type Modulator = {
  /** Étiquette ajoutée au label, ex: « à Paris ». */
  label: string;
  /** Mots-clés (FR) qui déclenchent ce modulateur dans la requête. */
  keywords: string[];
  /** Multiplicateur appliqué au dénominateur. */
  factor: number;
  /** Suffixe d'id stable. */
  idSuffix: string;
};

// --- LIEU : ~50 villes / régions / pays (modulation densité de marché) -------
const VILLES: [string, string[], number, string][] = [
  ["à Paris", ["paris", "parisien", "parisienne", "capitale"], 0.85, "paris"],
  ["à Lyon", ["lyon", "lyonnais"], 0.92, "lyon"],
  ["à Marseille", ["marseille", "marseillais"], 1.0, "marseille"],
  ["à Toulouse", ["toulouse", "toulousain"], 0.98, "toulouse"],
  ["à Nice", ["nice", "nicois", "niçois"], 1.0, "nice"],
  ["à Nantes", ["nantes", "nantais"], 0.95, "nantes"],
  ["à Bordeaux", ["bordeaux", "bordelais"], 0.95, "bordeaux"],
  ["à Lille", ["lille", "lillois"], 0.98, "lille"],
  ["à Strasbourg", ["strasbourg", "strasbourgeois"], 1.0, "strasbourg"],
  ["à Rennes", ["rennes", "rennais"], 0.98, "rennes"],
  ["à Montpellier", ["montpellier", "montpellierain"], 1.0, "montpellier"],
  ["à Grenoble", ["grenoble", "grenoblois"], 1.0, "grenoble"],
  ["à Rouen", ["rouen", "rouennais"], 1.05, "rouen"],
  ["à Reims", ["reims", "remois"], 1.05, "reims"],
  ["à Saint-Étienne", ["saint etienne", "stephanois"], 1.1, "saint-etienne"],
  ["au Havre", ["le havre", "havrais"], 1.1, "le-havre"],
  ["à Toulon", ["toulon", "toulonnais"], 1.05, "toulon"],
  ["à Dijon", ["dijon", "dijonnais"], 1.05, "dijon"],
  ["à Angers", ["angers", "angevin"], 1.05, "angers"],
  ["à Nîmes", ["nimes", "nimois"], 1.08, "nimes"],
  ["à Clermont-Ferrand", ["clermont ferrand", "clermont"], 1.08, "clermont"],
  ["à Tours", ["tours", "tourangeau"], 1.05, "tours"],
  ["à Brest", ["brest", "brestois"], 1.1, "brest"],
  ["à Annecy", ["annecy", "annecien"], 0.95, "annecy"],
  ["à Aix-en-Provence", ["aix en provence", "aixois"], 0.95, "aix"],
  ["en banlieue", ["banlieue", "peripherie", "périphérie", "zone commerciale"], 1.1, "banlieue"],
  ["à la campagne", ["campagne", "rural", "village", "province", "campagnard"], 1.6, "campagne"],
  ["en bord de mer", ["bord de mer", "littoral", "cote", "côte", "plage", "balneaire"], 0.95, "mer"],
  ["à la montagne", ["montagne", "station", "ski", "alpes", "pyrenees"], 1.1, "montagne"],
  ["en Bretagne", ["bretagne", "breton"], 1.05, "bretagne"],
  ["en Provence", ["provence", "provencal"], 0.98, "provence"],
  ["en Alsace", ["alsace", "alsacien"], 1.0, "alsace"],
  ["en Normandie", ["normandie", "normand"], 1.05, "normandie"],
  ["en Corse", ["corse"], 1.15, "corse"],
  ["dans le Sud", ["sud", "midi"], 0.98, "sud"],
  ["en Île-de-France", ["ile de france", "region parisienne", "francilien"], 0.88, "idf"],
  ["aux Antilles", ["antilles", "guadeloupe", "martinique", "outre mer", "dom tom"], 1.15, "antilles"],
  ["à l'étranger", ["etranger", "expat", "international"], 1.25, "etranger"],
  ["à Londres", ["londres", "london", "uk", "angleterre"], 1.0, "londres"],
  ["à New York", ["new york", "nyc", "usa", "etats unis", "amerique"], 1.1, "newyork"],
  ["à Dubaï", ["dubai", "dubaï", "emirats"], 0.85, "dubai"],
  ["à Berlin", ["berlin", "allemagne"], 1.05, "berlin"],
  ["à Barcelone", ["barcelone", "espagne"], 1.05, "barcelone"],
  ["à Bruxelles", ["bruxelles", "belgique"], 1.05, "bruxelles"],
  ["à Genève", ["geneve", "genève", "suisse"], 0.8, "geneve"],
  ["à Lisbonne", ["lisbonne", "portugal"], 1.1, "lisbonne"],
  ["à Singapour", ["singapour", "singapore", "asie"], 0.9, "singapour"],
  ["à Montréal", ["montreal", "montréal", "quebec", "canada"], 1.05, "montreal"],
  ["à Bali", ["bali", "indonesie"], 1.2, "bali"],
  ["en ville moyenne", ["ville moyenne", "centre ville", "agglomeration"], 1.0, "ville"],
];

function buildModulators(rows: [string, string[], number, string][]): Modulator[] {
  return rows.map(([label, keywords, factor, idSuffix]) => ({
    label,
    keywords,
    factor,
    idSuffix,
  }));
}

export const AXES: Record<Axis, Modulator[]> = {
  lieu: buildModulators(VILLES),

  specialisation: buildModulators([
    ["en niche", ["niche", "specialise", "spécialisé", "pointu", "expert", "specialiste"], 0.6, "niche"],
    ["en généraliste", ["generaliste", "généraliste", "tout public", "grand public", "polyvalent"], 1.4, "generaliste"],
    ["haut de gamme", ["haut de gamme", "premium", "qualite", "qualité", "gamme"], 0.8, "premium"],
    ["en version luxe", ["luxe", "luxueux", "prestige", "exclusif"], 0.7, "luxe"],
    ["en low cost", ["low cost", "pas cher", "discount", "economique", "abordable"], 1.25, "lowcost"],
    ["en bio", ["bio", "biologique", "naturel"], 0.95, "bio"],
    ["en vegan", ["vegan", "vegetal", "végétal", "vegetarien"], 1.0, "vegan"],
    ["en éco-responsable", ["eco responsable", "durable", "ecolo", "écolo", "vert", "ethique"], 0.95, "eco"],
    ["pour enfants", ["enfants", "kids", "bebe", "bébé", "jeunesse"], 1.0, "kids"],
    ["pour seniors", ["senior", "seniors", "personnes agees", "retraites"], 0.95, "senior"],
    ["en B2B", ["b2b", "entreprises", "professionnels"], 0.85, "b2b"],
    ["en B2C", ["b2c", "particuliers", "consommateurs"], 1.1, "b2c"],
    ["sur-mesure", ["sur mesure", "personnalise", "personnalisé", "custom"], 0.85, "surmesure"],
    ["en local", ["local", "circuit court", "terroir", "made in france"], 1.0, "local"],
    ["en artisanal", ["artisanal", "fait main", "handmade"], 1.05, "artisanal"],
    ["façon tech", ["techno", "innovant", "digitalise"], 0.85, "techspec"],
    ["orienté bien-être", ["bien etre", "wellness"], 0.95, "wellness"],
  ]),

  echelle: buildModulators([
    ["en solo", ["solo", "seul", "independant", "indépendant", "freelance", "auto entrepreneur"], 1.5, "solo"],
    ["en micro-entreprise", ["micro entreprise", "tres petite", "tpe"], 1.55, "microe"],
    ["en équipe", ["equipe", "équipe", "associes", "associés", "salaries", "salariés", "team"], 0.9, "equipe"],
    ["en franchise", ["franchise", "franchisé"], 0.5, "franchise"],
    ["en multi-sites", ["multi sites", "reseau", "réseau", "plusieurs", "chaine", "chaîne", "groupe"], 0.55, "multi"],
    ["à l'international", ["mondial", "global", "monde", "export"], 0.4, "intl"],
    ["en mode scale-up", ["scale up", "hypercroissance", "scaling"], 0.5, "scaleup"],
  ]),

  format: buildModulators([
    ["en ligne", ["en ligne", "online", "internet", "web", "digital", "e commerce", "ecommerce"], 0.7, "online"],
    ["en application", ["application", "appli", "mobile", "ios", "android"], 0.8, "app"],
    ["en marketplace", ["marketplace", "place de marche", "plateforme"], 0.75, "marketplace"],
    ["en abonnement", ["abonnement", "saas", "subscription", "recurrent", "membership"], 0.7, "abo"],
    ["en hybride", ["hybride", "phygital", "click and collect", "omnicanal"], 0.85, "hybride"],
    ["en boutique physique", ["physique", "pignon sur rue", "local commercial"], 1.2, "offline"],
  ]),

  stage: buildModulators([
    ["en le lançant", ["demarrer", "démarrer", "debuter", "débuter"], 1.0, "lancer"],
    ["en le faisant grossir", ["faire grossir", "developper", "développer", "grandir", "croitre"], 0.6, "grossir"],
    ["en rachetant un existant", ["racheter", "reprendre", "rachat", "reprise"], 0.7, "racheter"],
    ["en le revendant ensuite", ["revendre", "revente", "ceder", "céder", "sortie"], 0.6, "revendre"],
  ]),
};

export const AXIS_ORDER: Axis[] = ["lieu", "specialisation", "echelle", "format", "stage"];

/** Borne le dénominateur pour rester crédible. */
export function clampDenominator(n: number): number {
  return Math.max(1.2, Math.round(n * 10) / 10);
}

export const BASE_COUNT = CATALOG.length;

/**
 * Taille de l'espace combinatoire généré à la volée.
 * Pour chaque entrée : produit, sur ses axes cohérents, de (cardinalité + 1)
 * — le « +1 » = l'option « cet axe non précisé ». La variante « tout vide » =
 * l'entrée de base elle-même, déjà comptée dans le produit.
 */
let _count: number | null = null;
export function effectiveCount(): number {
  if (_count !== null) return _count;
  let total = 0;
  for (const entry of CATALOG) {
    const axes = entry.axes ?? [];
    let combos = 1;
    for (const axis of axes) combos *= AXES[axis].length + 1;
    total += combos;
  }
  _count = total;
  return total;
}

/** Cardinalité d'un axe (utile pour les tests / la doc). */
export function axisCardinality(axis: Axis): number {
  return AXES[axis].length;
}

/** Applique des modulateurs à une entrée de base (utilisé par le matcher/tests). */
export function applyModulators(
  entry: CatalogEntry,
  mods: { axis: Axis; mod: Modulator }[],
): { denominator: number; labels: string[]; id: string } {
  let denom = entry.oddsDenominator;
  const labels: string[] = [];
  const idParts: string[] = [entry.id];
  for (const { mod } of mods) {
    denom *= mod.factor;
    labels.push(mod.label);
    idParts.push(mod.idSuffix);
  }
  return { denominator: clampDenominator(denom), labels, id: idParts.join("--") };
}
