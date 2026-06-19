import { LOTO_DENOMINATOR } from "./types";

// =============================================================================
// MAUVAISE FOI
// -----------------------------------------------------------------------------
// 1 réponse sur 4 (≈25%) est remplacée par une punchline de mauvaise foi.
// 6 styles tournent au hasard. Chaque générateur reçoit le contexte (libellé,
// dénominateur, ratio vs Loto) et renvoie une phrase complète et autonome.
// =============================================================================

export type BadFaithContext = {
  label: string;
  denominator: number;
  ratioVsLoto: number;
};

function formatOdds(d: number): string {
  if (d < 2) return `quasi garanti (1 chance sur ${d.toFixed(1)})`;
  if (d < 1000) return `1 chance sur ${Math.round(d).toLocaleString("fr-FR")}`;
  return `1 chance sur ${Math.round(d).toLocaleString("fr-FR")}`;
}

function formatRatio(r: number): string {
  if (r >= 1) return `${Math.round(r).toLocaleString("fr-FR")}× plus de chances qu'au Loto`;
  return `${Math.round(1 / r).toLocaleString("fr-FR")}× moins de chances qu'au Loto`;
}

type BadFaithStyle = {
  id: string;
  generate: (ctx: BadFaithContext) => string;
};

export const BAD_FAITH_STYLES: BadFaithStyle[] = [
  // 1. Sarcasme
  {
    id: "sarcasme",
    generate: (c) =>
      `${formatOdds(c.denominator)}. Mais tu sais quoi ? Joue au Loto, c'est moins fatigant et tu peux le faire en pyjama.`,
  },
  // 2. Statistique bidon
  {
    id: "stat-bidon",
    generate: () => {
      const pct = (60 + Math.round(Math.random() * 39) + Math.random()).toFixed(1);
      return `${pct}% des millionnaires interrogés ont dit « non merci » au Loto. Coïncidence ? On ne pense pas.`;
    },
  },
  // 3. Ad absurdum
  {
    id: "ad-absurdum",
    generate: (c) => {
      const millions = Math.max(1, Math.round(67_000_000 / Math.max(2, c.denominator) / 1_000_000));
      return `C'est mathématique : si les 67 millions de Français s'y mettaient, on aurait ${millions} million(s) de millionnaires. Soit ${Math.max(
        1,
        Math.round(millions / 0.5),
      )}× la population de Marseille. Le pays exploserait.`;
    },
  },
  // 4. Biais d'autorité
  {
    id: "autorite",
    generate: (c) => {
      const fake = Math.max(2, Math.round(c.ratioVsLoto));
      return `Selon une étude Stanford-MIT-Harvard (qu'on a entièrement inventée à l'instant), c'est précisément ${fake.toLocaleString(
        "fr-FR",
      )}× mieux que le Loto. Les chercheurs sont formels (ils n'existent pas).`;
    },
  },
  // 5. Conseil contre-intuitif
  {
    id: "contre-intuitif",
    generate: (c) => {
      if (c.denominator > LOTO_DENOMINATOR) {
        return `Honnêtement ? À ce stade, le Loto est carrément plus rationnel. On dit ça, on dit rien.`;
      }
      return `${formatOdds(c.denominator)}. Soit ${formatRatio(
        c.ratioVsLoto,
      )}. Mais bon, le vrai courage, c'est de ne rien faire et d'attendre un héritage.`;
    },
  },
  // 6. Faux humour stoïcien
  {
    id: "stoicien",
    generate: (c) =>
      `${formatOdds(
        c.denominator,
      )}. Mais le vrai millionnaire, disait Marc Aurèle (jamais), c'est celui qui a trouvé la paix intérieure. Le reste n'est que pièces de monnaie.`,
  },
];

/** true ≈ 25% du temps. */
export function shouldBeBadFaith(): boolean {
  return Math.random() < 0.25;
}

/** Renvoie une punchline de mauvaise foi tirée au hasard. */
export function generateBadFaith(ctx: BadFaithContext): { style: string; text: string } {
  const style = BAD_FAITH_STYLES[Math.floor(Math.random() * BAD_FAITH_STYLES.length)];
  return { style: style.id, text: style.generate(ctx) };
}
