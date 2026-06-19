import { describe, it, expect } from "vitest";
import { match, normalize, tokenize } from "./matcher";
import { getExpandedCatalog, expandedCount } from "./expander";
import { CATALOG } from "./catalog";

// Mauvaise foi désactivée pour des tests déterministes sur le matching.
const opts = { disableBadFaith: true };

describe("normalize / tokenize", () => {
  it("retire accents, casse et mots vides", () => {
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

describe("catalogue & expansion", () => {
  it("le catalogue de base a une taille substantielle", () => {
    expect(CATALOG.length).toBeGreaterThan(100);
  });

  it("l'expander multiplie les entrées éligibles", () => {
    expect(expandedCount()).toBeGreaterThan(CATALOG.length);
  });

  it("toutes les entrées étendues ont un dénominateur valide", () => {
    for (const e of getExpandedCatalog()) {
      expect(e.oddsDenominator).toBeGreaterThan(0);
      expect(Number.isFinite(e.oddsDenominator)).toBe(true);
    }
  });
});

describe("matching direct", () => {
  it("« ouvrir une boulangerie » → entrée boulangerie", () => {
    const r = match("ouvrir une boulangerie", opts);
    expect(r.quality).not.toBe("poetic");
    expect(r.label.toLowerCase()).toContain("boulangerie");
    expect(r.category).toBe("entrepreneuriat");
  });

  it("« jouer au loto » → entrée loto", () => {
    const r = match("jouer au loto", opts);
    expect(r.label.toLowerCase()).toContain("loto");
    expect(r.category).toBe("hasard");
    expect(r.denominator).toBe(19_068_840);
  });

  it("« créer une startup IA » → entrepreneuriat / startup", () => {
    const r = match("créer une startup IA", opts);
    expect(r.category).toBe("entrepreneuriat");
    expect(r.label.toLowerCase()).toMatch(/startup|intelligence|ia/);
  });

  it("« devenir streamer twitch » → créateur", () => {
    const r = match("devenir streamer sur twitch", opts);
    expect(r.category).toBe("createur");
    expect(r.label.toLowerCase()).toContain("twitch");
  });

  it("« écrire un livre » → artiste / auteur", () => {
    const r = match("écrire un livre", opts);
    expect(r.category).toBe("artiste");
    expect(r.label.toLowerCase()).toMatch(/livre|auteur/);
  });

  it("« devenir médecin » → métier", () => {
    const r = match("devenir médecin", opts);
    expect(r.category).toBe("metier");
    expect(r.label.toLowerCase()).toContain("médecin");
  });

  it("« footballeur professionnel » → sport", () => {
    const r = match("devenir footballeur professionnel", opts);
    expect(r.category).toBe("sport");
  });

  it("« investir en bourse sur le s&p 500 » → investissement", () => {
    const r = match("investir en bourse sur le s&p 500", opts);
    expect(r.category).toBe("investissement");
  });

  it("« gagner top chef » → spéculatif", () => {
    const r = match("gagner top chef", opts);
    expect(r.category).toBe("speculatif");
    expect(r.label.toLowerCase()).toContain("top chef");
  });

  it("calcule un ratio vs Loto cohérent (boulangerie >> loto)", () => {
    const r = match("ouvrir une boulangerie", opts);
    expect(r.ratioVsLoto).toBeGreaterThan(1);
    expect(r.message).toMatch(/plus de chances qu'au Loto/);
  });

  it("le S&P 500 est bien plus facile que le Loto", () => {
    const r = match("épargner sur le s&p 500 pendant 30 ans", opts);
    expect(r.ratioVsLoto).toBeGreaterThan(100_000);
  });
});

describe("variantes (expander) via le lieu", () => {
  it("« ouvrir une boulangerie à la campagne » prend une variante lieu", () => {
    const r = match("ouvrir une boulangerie à la campagne", opts);
    expect(r.label.toLowerCase()).toContain("boulangerie");
    // La variante campagne doit être plus dure que la base (dénominateur plus grand).
    const base = match("ouvrir une boulangerie", opts);
    expect(r.denominator).toBeGreaterThanOrEqual(base.denominator);
  });
});

describe("fallbacks", () => {
  it("input totalement hors-sujet → catégorie ou poétique", () => {
    const r = match("xyzqwk blorp foobar", opts);
    expect(["category", "poetic"]).toContain(r.quality);
    expect(r.message.length).toBeGreaterThan(0);
  });

  it("input vide → fallback poétique", () => {
    const r = match("", opts);
    expect(r.quality).toBe("poetic");
    expect(r.message.length).toBeGreaterThan(0);
    expect(r.badFaith).toBe(false);
  });

  it("classifier de catégorie : « monter un business » → entrepreneuriat", () => {
    const r = match("monter un business quelconque truc", opts);
    expect(r.category).toBe("entrepreneuriat");
  });
});

describe("mauvaise foi", () => {
  it("produit parfois une réponse de mauvaise foi sur plusieurs tirages", () => {
    let badFaithSeen = false;
    for (let i = 0; i < 200; i++) {
      const r = match("ouvrir une boulangerie");
      if (r.badFaith) {
        badFaithSeen = true;
        break;
      }
    }
    expect(badFaithSeen).toBe(true);
  });

  it("jamais de mauvaise foi quand désactivée", () => {
    for (let i = 0; i < 50; i++) {
      const r = match("ouvrir une boulangerie", opts);
      expect(r.badFaith).toBe(false);
    }
  });
});
