# 💸 Guide d'activation de la pub & encaissement

Le site embarque **deux régies** prêtes à brancher. La logique d'affichage
(dans `components/ads/BottomAdBar.tsx`) est : **AdSense si configuré → sinon
Adsterra → sinon un placeholder** (rien de visible en prod tant que ce n'est pas
configuré, juste un texte gris discret).

Tout passe par des **variables d'environnement** côté Vercel. Aucune clé n'est
en dur dans le code.

| Variable                            | Régie    | Exemple                  |
| ----------------------------------- | -------- | ------------------------ |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID`     | AdSense  | `ca-pub-1234567890123456` |
| `NEXT_PUBLIC_ADSENSE_BOTTOM_SLOT`   | AdSense  | `1234567890` (optionnel) |
| `NEXT_PUBLIC_ADSTERRA_BANNER_KEY`   | Adsterra | `a1b2c3d4e5f6...`        |
| `NEXT_PUBLIC_SITE_URL`              | (partage) | `https://mieuxqueleloto.fr` |

> ⚠️ Les variables `NEXT_PUBLIC_*` sont injectées **au build**. Après les avoir
> ajoutées/modifiées dans Vercel, il faut **redéployer** (Deployments → ⋯ →
> Redeploy) pour qu'elles prennent effet.

---

## 1) Google AdSense (revenus pérennes, mais approbation lente)

AdSense paie bien mais demande une validation (quelques jours à 2 semaines) et
un site avec du contenu/du trafic. À poser **dès maintenant** pour lancer la
procédure.

### Étapes

1. **Créer un compte** : <https://adsense.google.com> → « Commencer » avec ton
   compte Google.
2. **Ajouter le site** : renseigne l'URL de prod (ton domaine custom de
   préférence, sinon l'URL `*.vercel.app`).
3. **Coller le code de vérification** : AdSense te donne un identifiant éditeur
   au format `ca-pub-XXXXXXXXXXXXXXXX`.
   - Mets-le dans Vercel → **Settings → Environment Variables** :
     `NEXT_PUBLIC_ADSENSE_CLIENT_ID = ca-pub-XXXXXXXXXXXXXXXX`
   - Le script AdSense est alors chargé automatiquement (voir `app/layout.tsx`)
     et sert aussi de balise de vérification.
4. **Mettre à jour `public/ads.txt`** : remplace `pub-XXXXXXXXXXXXXXXX` par ton
   vrai identifiant (le `pub-...`, sans le préfixe `ca-`). Commit + redeploy.
   Exemple : `google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0`
5. **Créer un bloc d'annonce** (une fois approuvé) : AdSense → Annonces → Par
   bloc d'annonces → « Display ». Récupère l'`data-ad-slot` (un nombre) et mets-le
   dans `NEXT_PUBLIC_ADSENSE_BOTTOM_SLOT`. (Optionnel : sans slot, AdSense Auto
   Ads peut quand même fonctionner.)
6. **Redéployer** sur Vercel.

### Encaisser (AdSense)

- AdSense → **Paiements** → renseigne ton **adresse** (vérification par courrier
  d'un code PIN au-delà d'un certain seuil) et ton **compte bancaire** (IBAN)
  ou un autre mode selon le pays.
- **Seuil de paiement : 70 €** (versement automatique mensuel une fois atteint,
  vers le 21 du mois).

---

## 2) Adsterra (approbation rapide 24-48 h)

Idéal pour monétiser **tout de suite** en attendant l'approbation AdSense.
Revenus généralement plus faibles, mais validation quasi immédiate.

### Étapes

1. **Créer un compte Publisher** : <https://adsterra.com> → « Join now » →
   « I'm a Publisher / Website owner ».
2. **Ajouter le site** : Dashboard → Websites → Add Website → renseigne l'URL.
   La validation prend en général **24-48 h**.
3. **Créer une zone Banner** : Dashboard → Websites → ton site → « Add new
   placement » → choisis un format **Banner** (ex. 728×90 desktop / 320×50
   mobile).
4. **Récupérer la clé** : Adsterra te donne un snippet contenant une `key`
   (chaîne hexadécimale). C'est cette `key` qu'il faut copier.
   - Vercel → **Settings → Environment Variables** :
     `NEXT_PUBLIC_ADSTERRA_BANNER_KEY = <la_key>`
5. **Redéployer**. Le composant `AdsterraBanner` charge alors le script
   `//www.highperformanceformat.com/<key>/invoke.js` (voir
   `components/ads/AdsterraBanner.tsx`).

### Encaisser (Adsterra)

- Adsterra → **Finance / Payments** → choisis ta méthode : virement bancaire
  (Wire), PayPal, Paxum, crypto (USDT), etc. Renseigne les coordonnées
  correspondantes.
- **Seuil de paiement : 25 $** (Paxum/crypto), un peu plus pour le virement
  bancaire selon la méthode. Paiements **bi-mensuels** (NET-15).

---

## Priorité d'affichage

```
AdSense configuré ?  ──oui──▶  on affiche AdSense
        │ non
        ▼
Adsterra configuré ? ──oui──▶  on affiche Adsterra
        │ non
        ▼
Placeholder discret (dev) — rien d'intrusif en prod
```

Tu peux donc commencer **Adsterra seul** (rapide), puis basculer
automatiquement sur **AdSense** dès qu'il est approuvé : il suffit de renseigner
`NEXT_PUBLIC_ADSENSE_CLIENT_ID` et de redéployer, la priorité bascule toute seule.

## Conseils

- **Ne clique jamais sur tes propres pubs** (bannissement immédiat, surtout chez
  AdSense).
- Garde `ads.txt` à jour : c'est un gage de confiance pour les annonceurs et ça
  protège tes revenus.
- Densité raisonnable : ici une seule barre sticky en bas, non intrusive — bon
  pour l'UX et l'approbation.
