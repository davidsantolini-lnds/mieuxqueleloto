import type { Category } from "./types";

// =============================================================================
// FALLBACKS
// -----------------------------------------------------------------------------
// 1) Classifier par familles de mots → catégorie (quand le matching échoue).
// 2) Punchlines poétiques quand vraiment rien ne matche.
// =============================================================================

// Familles de mots → catégorie. Premier match gagne (ordre = priorité).
const CATEGORY_PATTERNS: { category: Category; pattern: RegExp }[] = [
  {
    category: "hasard",
    pattern:
      /\b(loto|loterie|tirage|grattage|gratter|casino|roulette|pari|paris|hasard|chance|jeu de hasard|tombola|cailloux|des|pile|face)\b/i,
  },
  {
    category: "investissement",
    pattern:
      /\b(invest|bourse|action|crypto|bitcoin|trading|trader|epargne|épargne|immobilier|placement|dividende|rente|etf|pea|or|forex|patrimoine|spéculer|speculer)\b/i,
  },
  {
    category: "createur",
    pattern:
      /\b(youtube|twitch|tiktok|instagram|insta|influenceur|influenceuse|stream|blog|podcast|contenu|créateur|createur|abonnés|abonnes|followers|onlyfans|newsletter|chaine|chaîne|vlog)\b/i,
  },
  {
    category: "artiste",
    pattern:
      /\b(artiste|peintre|peinture|musicien|musique|chanteur|chanson|écrire|ecrire|écrivain|ecrivain|livre|roman|auteur|film|cinéma|cinema|réalisateur|realisateur|comédien|comedien|acteur|danse|danseur|sculpteur|illustr|dessin|photo|humoriste)\b/i,
  },
  {
    category: "sport",
    pattern:
      /\b(sport|foot|football|tennis|rugby|basket|cyclisme|vélo|velo|nage|natation|athl|olympique|jo|champion|boxe|mma|esport|golf|course|marathon|judo|hand)\b/i,
  },
  {
    category: "speculatif",
    pattern:
      /\b(politique|député|depute|maire|président|president|élection|election|télé|tele|émission|emission|candidat|réalité|realite|koh|star ac|top chef|the voice|épouser|epouser)\b/i,
  },
  {
    category: "entrepreneuriat",
    pattern:
      /\b(entreprise|business|boîte|boite|société|societe|startup|start-up|commerce|boutique|magasin|ouvrir|lancer|monter|vendre|vente|créer|creer|fonder|franchise|saas|agence|restaurant|artisan|atelier|marque|service)\b/i,
  },
  {
    category: "metier",
    pattern:
      /\b(métier|metier|devenir|carrière|carriere|médecin|medecin|avocat|notaire|prof|professeur|ingénieur|ingenieur|pilote|fonctionnaire|salarié|salarie|employé|employe|cadre|infirmier|dentiste|pharmacien|kiné|kine|architecte)\b/i,
  },
];

/** Devine une catégorie à partir d'un texte normalisé/brut, ou null. */
export function classifyCategory(input: string): Category | null {
  for (const { category, pattern } of CATEGORY_PATTERNS) {
    if (pattern.test(input)) return category;
  }
  return null;
}

// Phrase de cadrage par catégorie (utilisée quand on ne tombe que sur la cat).
export const CATEGORY_FALLBACK_LABEL: Record<Category, string> = {
  hasard: "Tenter sa chance dans les jeux de hasard",
  investissement: "Faire fructifier son argent par l'investissement",
  entrepreneuriat: "Se lancer dans l'entrepreneuriat",
  createur: "Vivre de la création de contenu",
  artiste: "Percer en tant qu'artiste",
  sport: "Réussir dans le sport de haut niveau",
  metier: "Bâtir une carrière dans un métier porteur",
  speculatif: "Tenter une voie spectaculaire (télé, politique…)",
  absurde: "Réussir ce petit défi de la vie",
};

// Punchlines poétiques quand rien ne matche du tout.
export const POETIC_FALLBACKS: string[] = [
  "Difficile à chiffrer… mais l'univers récompense parfois les idées que personne n'avait osé compter.",
  "Aucune statistique pour ça. C'est exactement le genre de pari que les millionnaires adorent raconter après coup.",
  "Le hasard n'a pas de case pour ton idée. C'est peut-être bon signe : les pionniers font leurs propres tables de probabilité.",
  "On n'a pas de chiffre. Mais entre nous, le Loto non plus n'avait rien promis à personne.",
  "Inclassable. Et l'inclassable, statistiquement, c'est là que se cachent les plus belles surprises.",
  "Pas de données. Juste une certitude : à ne rien tenter, la probabilité est rigoureusement nulle.",
  "Ton idée échappe à nos grilles. Galilée aussi échappait aux grilles de son époque.",
  "Aucune référence. Soit c'est génial, soit c'est absurde — et souvent, la frontière rapporte gros.",
  "On sèche. Mais une chose est sûre : c'est déjà plus original que de cocher six numéros au hasard.",
  "Le calcul renvoie « ¯\\_(ツ)_/¯ ». Traduction officielle : fonce, on verra bien.",
  "Pas de proba connue. Le destin improvise parfois ses meilleurs scénarios sans prévenir personne.",
  "Inconnu au bataillon des statistiques. Et les plus grandes fortunes ont commencé exactement comme ça.",
];

export function randomPoetic(): string {
  return POETIC_FALLBACKS[Math.floor(Math.random() * POETIC_FALLBACKS.length)];
}
