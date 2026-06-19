# 📚 Le catalogue

Le cœur du projet, c'est `lib/catalog.ts` : une liste d'activités, chacune avec
sa probabilité honnête de rendre millionnaire. Le moteur (`lib/expander.ts`)
multiplie ensuite les entrées éligibles en variantes, et `lib/matcher.ts`
retrouve la meilleure correspondance avec ce que l'utilisateur tape.

## Structure d'une entrée

```ts
type CatalogEntry = {
  id: string;                 // identifiant unique kebab-case, ex: "boulangerie"
  label: string;              // libellé affiché, ex: "Ouvrir une boulangerie rentable…"
  keywords: string[];         // mots-clés FR pour le matching (variantes, synonymes)
  oddsNumerator: number;      // numérateur (presque toujours 1)
  oddsDenominator: number;    // « 1 chance sur N » → ici N
  category: Category;         // hasard | investissement | entrepreneuriat |
                              // createur | artiste | sport | metier | speculatif
  source?: string;            // référence publique (INSEE, FDJ, AMF, Forbes…)
  estimate?: boolean;         // true si estimation honnête (pas de stat parfaite)
  spinFactors?: SpinFactor[]; // active l'expander : "lieu" | "specialisation"
                              //                     | "echelle" | "canal"
};
```

## Ajouter une entrée

1. Choisis un `id` unique en kebab-case.
2. Écris un `label` parlant (c'est ce qui s'affiche dans la carte résultat).
3. Mets des `keywords` **généreux et normalisables** : singulier/pluriel,
   masculin/féminin, synonymes, anglicismes courants. Le matcher normalise déjà
   (minuscules, sans accents) et gère les pluriels/genres par préfixe — mais
   plus tu couvres de formulations, mieux ça matche.
4. Donne un `oddsDenominator` réaliste. Cite une `source` publique si possible,
   sinon mets `estimate: true`.
5. (Optionnel) Ajoute des `spinFactors` pour générer des variantes
   automatiquement (voir ci-dessous).

Exemple :

```ts
{
  id: "boulangerie",
  label: "Ouvrir une boulangerie rentable qui dure 5 ans",
  keywords: ["boulangerie", "boulanger", "patisserie", "pain", "viennoiserie"],
  oddsNumerator: 1,
  oddsDenominator: 40,
  category: "entrepreneuriat",
  source: "INSEE / CGAD — boulangerie-pâtisserie, survie & marge",
  estimate: true,
  spinFactors: ["lieu", "specialisation"],
},
```

## L'expander (variantes)

Si une entrée a des `spinFactors`, `lib/expander.ts` génère :

- la variante **de base** (sans modificateur),
- une variante **par modulateur unique** (« à la campagne », « en niche »…),
- toutes les **combinaisons** des facteurs (« en niche à Paris »…).

Chaque modulateur applique un **multiplicateur** au dénominateur :

| Facteur          | Modulateurs (extrait)                          | Effet                       |
| ---------------- | ---------------------------------------------- | --------------------------- |
| `lieu`           | Paris, Lyon, banlieue, campagne, étranger…     | densité de marché           |
| `specialisation` | niche, généraliste, haut de gamme              | niche = plus facile         |
| `echelle`        | solo, équipe, multi-sites/franchise            | scaler = plus facile        |
| `canal`          | en ligne, boutique physique                    | online = plus facile        |

Exemple : « ouvrir une boulangerie **à la campagne** » → la variante `campagne`
(facteur 1,6) donne `40 × 1,6 = 1 chance sur 64` (plus dur qu'en ville).

Les valeurs des modulateurs vivent dans la constante `MODULATORS` de
`lib/expander.ts` — ajuste-les là si besoin.

## Le matcher (résumé)

`lib/matcher.ts` :

1. **Normalise** l'input (minuscules, sans accents, sans mots vides FR).
2. **Score** chaque entrée étendue par chevauchement de mots-clés pondéré
   (les mots génériques comme « ouvrir », « devenir » pèsent moins).
3. **Seuils** :
   - score **> 0,3** → réponse directe ;
   - **0,15–0,3** → match faible (+ disclaimer) ;
   - **< 0,15** → on tente le **classifier de catégorie** (familles de mots) ;
   - aucune catégorie → **fallback poétique** aléatoire.
4. **1 réponse sur 4** est remplacée par une punchline de **mauvaise foi**.

## Catégories disponibles

`hasard` · `investissement` · `entrepreneuriat` · `createur` · `artiste` ·
`sport` · `metier` · `speculatif`

Pour ajouter une catégorie : étends le type `Category` dans `lib/types.ts`, puis
ajoute son libellé de repli dans `CATEGORY_FALLBACK_LABEL` et un pattern dans
`CATEGORY_PATTERNS` (`lib/fallback.ts`).

## Sources

Les probabilités s'appuient quand c'est possible sur des données publiques
(FDJ/EuroMillions pour les jeux, INSEE/CGAD/CAPEB pour les commerces et
l'artisanat, AMF pour le trading, Notaires de France pour l'immobilier,
CB Insights pour les licornes…). Sinon, `estimate: true` signale une estimation
honnête mais non garantie. **Rien ici n'est un conseil financier.**

## Tests

Quand tu ajoutes/modifies des entrées, lance `npm test`. Le fichier
`lib/matcher.test.ts` vérifie que les inputs canoniques tombent sur la bonne
catégorie et que l'expansion/les fallbacks restent cohérents.
