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
  axes: ["lieu", "specialisation"],
},
```

La base vit dans deux fichiers : `lib/catalog.ts` (cœur) et `lib/catalog.extra.ts`
(extension de couverture). Les deux sont concaténés dans l'export `CATALOG`.

## Scale : base + axes (pas de matérialisation)

On **ne stocke pas** les 100k+ variantes (20 Mo de bundle = mort du site). À la
place : une base hand-curatée (~350 entrées) + des **AXES** de modulation dans
`lib/expander.ts`. L'espace combinatoire est *calculable* (`effectiveCount()`,
≈ 490 000) mais **généré à la volée** par le matcher.

Chaque modulateur applique un **multiplicateur** au dénominateur (`< 1` = plus
facile, `> 1` = plus dur) :

| Axe              | Modulateurs (extrait)                          | Cardinalité |
| ---------------- | ---------------------------------------------- | ----------- |
| `lieu`           | Paris, Lyon, banlieue, campagne, étranger…     | ~50         |
| `specialisation` | niche, généraliste, haut de gamme, bio, luxe…  | ~17         |
| `echelle`        | solo, équipe, franchise, multi-sites, intl…    | 7           |
| `format`         | en ligne, app, marketplace, abonnement…        | 6           |
| `stage`          | lancer, faire grossir, racheter, revendre      | 4           |

Une entrée déclare les axes **cohérents** avec elle (`axes: [...]`) — une
boulangerie a un `lieu` mais pas de `format` « online » ; un SaaS a un `format`
mais pas de ville. C'est le filtre de cohérence.

`effectiveCount()` = somme, sur chaque entrée, du produit des `(cardinalité + 1)`
de ses axes. Exemple : « ouvrir une boulangerie **à la campagne** » → modulateur
lieu `campagne` (×1,6) → `40 × 1,6 = 1 chance sur 64`.

Les valeurs des modulateurs vivent dans la constante `AXES` de `lib/expander.ts`.

## Le matcher (résumé)

`lib/matcher.ts` — stratégie « base + modulateurs », coût ~O(mots de la requête)
grâce à un **index inversé** (mot-clé → entrées de base), donc indépendant de la
taille de l'espace (100k+) :

1. **Normalise** l'input (minuscules, sans accents, sans mots vides FR).
2. **Matche la BASE** (~350 entrées) par chevauchement de mots-clés pondéré
   (mots génériques « ouvrir/devenir » et mots d'axe « niche/à Paris » sous-pondérés,
   pour que le nom de l'activité l'emporte).
3. **Détecte les modulateurs** présents dans la requête (cohérents avec l'entrée)
   et les applique → variante générée à la volée. « ouvrir un food truck à Paris »
   = entrée *food truck* + modulateur lieu *Paris*, jamais une entrée géo random.
4. **Seuils** :
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
