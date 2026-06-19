# 🎰 Mieux que le Loto ?

Site une page, fun et viral : tu tapes une activité (« ouvrir une boulangerie »,
« devenir streamer », « lancer une appli pour se garer »…) et on te répond
instantanément avec **ta probabilité de devenir millionnaire**, comparée au
**Loto France (1 chance sur 19 068 840)**.

> « Devenir millionnaire en ouvrant une boulangerie : **1 chance sur 40**.
> Soit **476 721× plus de chances** qu'au Loto. »

- 🤓 ~350 activités de base hand-curatées, étendues à **490 000+ combinaisons**
  générées à la volée (axes : lieu, spécialisation, échelle, format, stade).
- 🤥 1 réponse sur 4 = **mauvaise foi** (6 styles d'humour qui tournent).
- 🪄 Fallback poétique quand rien ne matche.
- ⚡️ Matching **100 % côté client** — zéro appel API, page entièrement statique.
- 💸 Slots pub AdSense + Adsterra prêts à activer (voir
  [`MONETIZATION.md`](./MONETIZATION.md)).

## Stack

| Élément       | Choix                                            |
| ------------- | ------------------------------------------------ |
| Framework     | Next.js 16 (App Router, `output: 'export'`)      |
| Langage       | TypeScript                                       |
| Style         | Tailwind CSS v4 (gradient pêche → violet)        |
| Tests         | Vitest                                           |
| Déploiement   | Vercel (statique)                                |

JS de premier rendu : **~186 kB gzip** (cible < 200 kB). Le catalogue + le
moteur de matching sont chargés à la demande (au premier « Comparer »), ce qui
préserve le LCP.

## Lancer en développement

```bash
cd mieuxqueleloto
npm install
npm run dev          # http://localhost:3000
```

Variables d'environnement : copie `.env.example` → `.env.local` (toutes
optionnelles ; sans elles, le site tourne et affiche un placeholder de pub).

## Tests

```bash
npm test             # vitest run (matching, catalogue, fallbacks, mauvaise foi)
npm run test:watch
```

## Build de production

```bash
npm run build        # génère le dossier ./out statique
```

## Architecture

```
app/
  layout.tsx         # fonts Inter, metadata/OG, script AdSense conditionnel, BottomAdBar
  page.tsx           # hero + Comparator (server component)
  globals.css        # thème (gradient de marque, glassmorphism, animations)
components/
  Comparator.tsx     # input + placeholders rotatifs + deep-link ?q= + résultat
  ResultCard.tsx     # nombre, ratio, barre log vs Loto, source
  ShareButtons.tsx   # partage natif / X / WhatsApp (lien deep-link)
  ads/               # AdSenseBanner, AdsterraBanner, BottomAdBar
lib/
  types.ts           # types partagés (+ constantes Loto/EuroMillions)
  catalog.ts         # le catalogue hand-curaté (cœur du projet)
  expander.ts        # génère les variantes (lieu/spécialisation/échelle/canal)
  matcher.ts         # normalisation + scoring + seuils + fallbacks
  badFaith.ts        # 6 styles de mauvaise foi
  fallback.ts        # classifier de catégorie + punchlines poétiques
  format.ts          # helpers de formatage purs (léger, pour les composants)
  matcher.test.ts    # 23 cas de test
```

Voir [`CATALOG.md`](./CATALOG.md) pour ajouter des activités.

## Déploiement Vercel

```bash
npm i -g vercel
vercel login
vercel               # 1er déploiement (preview) — framework détecté : Next.js
vercel --prod        # déploiement en production
```

Vercel attribue une URL `*.vercel.app`. Pour un **domaine custom** (ex.
`mieuxqueleloto.fr`) : Vercel → projet → **Settings → Domains** → ajoute le
domaine et suis les instructions DNS.

⚠️ N'oublie pas de renseigner les variables d'env de pub dans **Settings →
Environment Variables** (voir [`MONETIZATION.md`](./MONETIZATION.md)), puis de
**redéployer** (les `NEXT_PUBLIC_*` sont injectées au build).

## Procédure Git + push GitHub (à faire par David)

Le repo est déjà initialisé avec un premier commit. Pour le pousser sur GitHub :

```bash
cd mieuxqueleloto
# Crée un repo vide sur github.com (sans README), puis :
git remote add origin git@github.com:<ton-user>/mieuxqueleloto.git
git branch -M main
git push -u origin main
```

Tu peux ensuite connecter ce repo à Vercel (import depuis GitHub) pour des
déploiements automatiques à chaque push.

---

Probabilités sourcées (INSEE, FDJ, AMF, Notaires de France…) ou estimées
honnêtement. À prendre avec humour — **ce n'est pas un conseil financier**.
