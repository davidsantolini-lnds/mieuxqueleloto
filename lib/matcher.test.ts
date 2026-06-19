import { describe, it, expect } from "vitest";
import { match, normalize, tokenize } from "./matcher";
import { CATALOG } from "./catalog";
import { BASE_COUNT, effectiveCount, axisCardinality } from "./expander";

// Mauvaise foi désactivée pour des tests déterministes sur le matching.
const o = { disableBadFaith: true };

// Helper : matche et exige une catégorie précise.
function cat(q: string) {
  return match(q, o).category;
}

describe("normalize / tokenize", () => {
  it("retire accents, casse et garde la structure", () => {
    expect(normalize("Ouvrir une BOULANGERIE à Évry")).toBe(
      "ouvrir une boulangerie a evry",
    );
  });
  it("supprime les stop words et garde les mots forts", () => {
    const words = tokenize("ouvrir une boulangerie").map((t) => t.word);
    expect(words).toContain("boulangerie");
    expect(words).not.toContain("une");
  });
  it("renvoie une liste vide pour une entrée vide", () => {
    expect(tokenize("   ")).toEqual([]);
  });
});

describe("catalogue, scale & compteur", () => {
  it("la base hand-curatée est substantielle", () => {
    expect(BASE_COUNT).toBeGreaterThan(250);
    expect(CATALOG.length).toBe(BASE_COUNT);
  });
  it("l'espace effectif dépasse 100 000 combinaisons", () => {
    expect(effectiveCount()).toBeGreaterThanOrEqual(100_000);
  });
  it("l'axe lieu propose ~50 modulateurs", () => {
    expect(axisCardinality("lieu")).toBeGreaterThanOrEqual(45);
  });
  it("tous les dénominateurs de base sont valides", () => {
    for (const e of CATALOG) {
      expect(e.oddsDenominator).toBeGreaterThan(0);
      expect(Number.isFinite(e.oddsDenominator)).toBe(true);
    }
  });
  it("aucun id de base en double", () => {
    const ids = CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("matching — hasard", () => {
  it("jouer au loto", () => {
    const r = match("jouer au loto", o);
    expect(r.category).toBe("hasard");
    expect(r.denominator).toBe(19_068_840);
  });
  it("euromillions", () => expect(cat("tenter l'euromillions")).toBe("hasard"));
  it("paris sportifs", () => expect(cat("faire des paris sportifs")).toBe("hasard"));
  it("poker", () => expect(cat("gagner au poker")).toBe("hasard"));
  it("roulette casino", () => expect(cat("jouer à la roulette au casino")).toBe("hasard"));
});

describe("matching — investissement", () => {
  it("bourse s&p 500", () =>
    expect(cat("investir en bourse sur le s&p 500")).toBe("investissement"));
  it("bitcoin / crypto", () => expect(cat("acheter du bitcoin")).toBe("investissement"));
  it("immobilier locatif", () =>
    expect(cat("investir dans l'immobilier locatif")).toBe("investissement"));
  it("trading", () => expect(cat("vivre du trading")).toBe("investissement"));
  it("scpi", () => expect(cat("investir dans une scpi")).toBe("investissement"));
  it("assurance vie", () => expect(cat("épargner en assurance vie")).toBe("investissement"));
  it("le s&p 500 est très au-dessus du loto", () => {
    const r = match("épargner sur le s&p 500 pendant 30 ans", o);
    expect(r.ratioVsLoto).toBeGreaterThan(100_000);
  });
});

describe("matching — entrepreneuriat", () => {
  it("boulangerie", () => {
    const r = match("ouvrir une boulangerie", o);
    expect(r.category).toBe("entrepreneuriat");
    expect(r.label.toLowerCase()).toContain("boulangerie");
    expect(r.denominator).toBe(40); // base, sans modulateur
  });
  it("restaurant", () => expect(cat("ouvrir un restaurant")).toBe("entrepreneuriat"));
  it("food truck", () => expect(cat("lancer un food truck")).toBe("entrepreneuriat"));
  it("kebab", () => expect(cat("ouvrir un kebab")).toBe("entrepreneuriat"));
  it("salon de coiffure", () => expect(cat("ouvrir un salon de coiffure")).toBe("entrepreneuriat"));
  it("salle de sport", () => expect(cat("ouvrir une salle de sport")).toBe("entrepreneuriat"));
  it("startup IA", () => {
    const r = match("créer une startup IA", o);
    expect(r.category).toBe("entrepreneuriat");
    expect(r.label.toLowerCase()).toMatch(/startup|intelligence|ia/);
  });
  it("saas", () => expect(cat("lancer un saas")).toBe("entrepreneuriat"));
  it("dropshipping", () => expect(cat("faire du dropshipping")).toBe("entrepreneuriat"));
  it("agence marketing", () => expect(cat("monter une agence marketing")).toBe("entrepreneuriat"));
  it("fleuriste", () => expect(cat("ouvrir une boutique de fleuriste")).toBe("entrepreneuriat"));
  it("tatoueur", () => expect(cat("devenir tatoueur")).toBe("entrepreneuriat"));
  it("garage automobile", () => expect(cat("ouvrir un garage automobile")).toBe("entrepreneuriat"));
  it("marque de vêtements", () => expect(cat("lancer une marque de vêtements")).toBe("entrepreneuriat"));
});

describe("matching — créateurs de contenu", () => {
  it("youtube", () => expect(cat("devenir youtubeur")).toBe("createur"));
  it("twitch", () => {
    const r = match("devenir streamer sur twitch", o);
    expect(r.category).toBe("createur");
    expect(r.label.toLowerCase()).toContain("twitch");
  });
  it("tiktok", () => expect(cat("percer sur tiktok")).toBe("createur"));
  it("instagram", () => expect(cat("devenir influenceur instagram")).toBe("createur"));
  it("podcast", () => expect(cat("lancer un podcast")).toBe("createur"));
  it("onlyfans", () => expect(cat("créer un onlyfans")).toBe("createur"));
  it("blog", () => expect(cat("tenir un blog rentable")).toBe("createur"));
});

describe("matching — artistes", () => {
  it("livre", () => {
    const r = match("écrire un livre", o);
    expect(r.category).toBe("artiste");
    expect(r.label.toLowerCase()).toMatch(/livre|auteur/);
  });
  it("musicien", () => expect(cat("devenir musicien")).toBe("artiste"));
  it("dj", () => expect(cat("devenir dj")).toBe("artiste"));
  it("peintre", () => expect(cat("devenir peintre")).toBe("artiste"));
  it("réalisateur", () => expect(cat("devenir réalisateur de cinéma")).toBe("artiste"));
  it("comédien", () => expect(cat("devenir comédien")).toBe("artiste"));
  it("humoriste", () => expect(cat("devenir humoriste")).toBe("artiste"));
  it("photographe", () => expect(cat("vivre de la photographie")).toBe("artiste"));
});

describe("matching — sport", () => {
  it("footballeur", () => expect(cat("devenir footballeur professionnel")).toBe("sport"));
  it("roland garros / tennis", () => expect(cat("gagner roland garros")).toBe("sport"));
  it("tour de france", () => expect(cat("gagner le tour de france")).toBe("sport"));
  it("jo médaille", () => expect(cat("décrocher une médaille olympique")).toBe("sport"));
  it("mma", () => expect(cat("devenir combattant mma")).toBe("sport"));
  it("nba basket", () => expect(cat("jouer en nba")).toBe("sport"));
  it("rugby", () => expect(cat("devenir rugbyman")).toBe("sport"));
  it("esport", () => expect(cat("devenir joueur esport")).toBe("sport"));
});

describe("matching — métiers", () => {
  it("médecin", () => {
    const r = match("devenir médecin", o);
    expect(r.category).toBe("metier");
    expect(r.label.toLowerCase()).toContain("médecin");
  });
  it("avocat", () => expect(cat("devenir avocat")).toBe("metier"));
  it("notaire", () => expect(cat("devenir notaire")).toBe("metier"));
  it("pilote de ligne", () => expect(cat("devenir pilote de ligne")).toBe("metier"));
  it("dentiste", () => expect(cat("devenir dentiste")).toBe("metier"));
  it("ingénieur", () => expect(cat("faire carrière d'ingénieur")).toBe("metier"));
  it("architecte", () => expect(cat("devenir architecte")).toBe("metier"));
  it("vétérinaire", () => expect(cat("ouvrir une clinique vétérinaire")).toBe("metier"));
});

describe("matching — spéculatif", () => {
  it("top chef", () => {
    const r = match("gagner top chef", o);
    expect(r.category).toBe("speculatif");
    expect(r.label.toLowerCase()).toContain("top chef");
  });
  it("député", () => expect(cat("devenir député")).toBe("speculatif"));
  it("président", () => expect(cat("devenir président de la république")).toBe("speculatif"));
  it("star academy", () => expect(cat("gagner la star academy")).toBe("speculatif"));
  it("koh lanta", () => expect(cat("gagner koh lanta")).toBe("speculatif"));
});

describe("modulateurs (expander à la volée)", () => {
  it("food truck à Paris : variante lieu plus facile, label localisé", () => {
    const base = match("ouvrir un food truck", o);
    const paris = match("ouvrir un food truck à Paris", o);
    expect(paris.label).toMatch(/Paris/);
    expect(paris.denominator).toBeLessThan(base.denominator);
    expect(paris.modifiers).toContain("à Paris");
  });
  it("boulangerie à la campagne : variante lieu plus dure", () => {
    const r = match("ouvrir une boulangerie à la campagne", o);
    expect(r.label).toMatch(/campagne/);
    expect(r.denominator).toBeGreaterThan(40);
  });
  it("entreprise en franchise : échelle franchise plus facile", () => {
    const base = match("créer son entreprise", o);
    const fr = match("créer son entreprise en franchise", o);
    expect(fr.label).toMatch(/franchise/);
    expect(fr.denominator).toBeLessThan(base.denominator);
  });
  it("boulangerie en niche : spécialisation plus facile", () => {
    const niche = match("ouvrir une boulangerie en niche", o);
    expect(niche.label).toMatch(/niche/);
    expect(niche.denominator).toBeLessThan(40);
  });
  it("e-commerce en abonnement : format appliqué", () => {
    const base = match("lancer une boutique shopify", o);
    const abo = match("lancer une boutique shopify en abonnement", o);
    expect(abo.label).toMatch(/abonnement/);
    expect(abo.denominator).toBeLessThan(base.denominator);
  });
  it("food truck à Paris ne dérive PAS vers une entrée géographique random", () => {
    const r = match("ouvrir un food truck à Paris", o);
    expect(r.label.toLowerCase()).toContain("food truck");
    expect(r.category).toBe("entrepreneuriat");
  });
  it("cumul de modulateurs cohérents (lieu + spécialisation)", () => {
    const r = match("ouvrir une boulangerie haut de gamme à Lyon", o);
    expect(r.label).toMatch(/Lyon/);
    expect(r.label.toLowerCase()).toContain("boulangerie");
    expect((r.modifiers ?? []).length).toBeGreaterThanOrEqual(2);
  });
});

describe("fallbacks", () => {
  it("input hors-sujet → catégorie ou poétique", () => {
    const r = match("xyzqwk blorp foobar", o);
    expect(["category", "poetic"]).toContain(r.quality);
    expect(r.message.length).toBeGreaterThan(0);
  });
  it("input vide → fallback poétique", () => {
    const r = match("", o);
    expect(r.quality).toBe("poetic");
    expect(r.badFaith).toBe(false);
  });
  it("classifier : « monter un business » → entrepreneuriat", () => {
    expect(cat("monter un business quelconque truc")).toBe("entrepreneuriat");
  });
});

describe("mauvaise foi", () => {
  it("apparaît parfois sur plusieurs tirages", () => {
    let seen = false;
    for (let i = 0; i < 200; i++) {
      if (match("ouvrir une boulangerie").badFaith) {
        seen = true;
        break;
      }
    }
    expect(seen).toBe(true);
  });
  it("jamais quand désactivée", () => {
    for (let i = 0; i < 50; i++) {
      expect(match("ouvrir une boulangerie", o).badFaith).toBe(false);
    }
  });
});

describe("performance", () => {
  it("1000 matches s'exécutent largement sous la seconde", () => {
    const queries = [
      "ouvrir une boulangerie à Paris",
      "devenir streamer twitch",
      "créer une startup IA en franchise",
      "investir en bourse",
      "gagner au loto",
    ];
    const start = Date.now();
    for (let i = 0; i < 1000; i++) match(queries[i % queries.length], o);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });
});
