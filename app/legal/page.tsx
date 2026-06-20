import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales & confidentialité — Mieux que le Loto ?",
  description:
    "Mentions légales, politique de confidentialité et gestion des cookies du site Mieux que le Loto ?",
  robots: { index: true, follow: false },
};

export default function LegalPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-40 pt-10 text-ink/90 sm:py-16">
      <Link
        href="/"
        className="inline-block text-sm text-muted hover:text-ink"
      >
        ← Retour
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Mentions légales & confidentialité
      </h1>
      <p className="mt-2 text-sm text-muted">Dernière mise à jour : juin 2026</p>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-bold">Éditeur</h2>
        <p className="text-sm">
          Site édité par <strong>David Santolini</strong>, à titre individuel.
          <br />
          Contact :{" "}
          <a className="underline" href="mailto:contact@mieuxqueleloto.fr">
            contact@mieuxqueleloto.fr
          </a>
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-xl font-bold">Hébergement</h2>
        <p className="text-sm">
          Hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133,
          Walnut, CA 91789, USA —{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            vercel.com
          </a>
          .
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-xl font-bold">Objet du site</h2>
        <p className="text-sm">
          Mieux que le Loto&nbsp;? est un site de divertissement qui compare,
          de manière humoristique mais documentée, la probabilité de devenir
          millionnaire en pratiquant diverses activités, à celle de gagner à
          l&apos;EuroMillions. Les probabilités affichées sont des estimations
          publiques ou raisonnées et ne constituent en aucun cas un conseil
          financier, professionnel ou patrimonial.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-bold">Données personnelles</h2>
        <p className="text-sm">
          Le site n&apos;héberge aucune base de données utilisateurs : aucun
          compte, aucun formulaire, aucune adresse e-mail collectée. Les
          requêtes saisies dans le champ de recherche restent dans ton
          navigateur ; elles ne sont ni stockées ni envoyées à un serveur tiers
          autre que celui chargé du calcul (statique).
        </p>
        <p className="text-sm">
          Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de
          rectification, d&apos;effacement et d&apos;opposition concernant tes
          données. Pour l&apos;exercer, écris à l&apos;adresse de contact
          ci-dessus.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-xl font-bold">Cookies & mesure d&apos;audience</h2>
        <p className="text-sm">
          Le site utilise <strong>Vercel Analytics</strong> pour mesurer
          l&apos;audience de façon anonyme : aucun cookie tiers, aucune
          identification individuelle, IP tronquée. Cette mesure est activée par
          défaut car elle est nécessaire au bon fonctionnement et exempte de
          consentement (recommandation CNIL).
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-xl font-bold">Publicité</h2>
        <p className="text-sm">
          Le site affiche des bannières publicitaires fournies par{" "}
          <strong>Google AdSense</strong> et/ou <strong>Adsterra</strong>. Ces
          régies déposent des cookies pour mesurer les impressions et
          personnaliser les annonces. <em>Aucun</em> de ces scripts n&apos;est
          chargé tant que tu n&apos;as pas explicitement cliqué sur «&nbsp;Tout
          accepter&nbsp;» dans le bandeau de consentement.
        </p>
        <p className="text-sm">
          Tu peux changer d&apos;avis à tout moment via le lien «&nbsp;Gérer mes
          cookies&nbsp;» en pied de page : ton choix est révoqué et le bandeau
          réapparaît.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm">
          <li>
            Politique Google :{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              policies.google.com/technologies/ads
            </a>
          </li>
          <li>
            Politique Adsterra :{" "}
            <a
              href="https://adsterra.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              adsterra.com/privacy-policy
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-xl font-bold">Propriété intellectuelle</h2>
        <p className="text-sm">
          Le code, les textes et la base de données du site sont la propriété
          de l&apos;éditeur. Toute reproduction substantielle nécessite une
          autorisation préalable. Les noms de marques cités (FDJ, Loto,
          EuroMillions, MyMillion, émissions TV, etc.) appartiennent à leurs
          propriétaires respectifs et sont mentionnés à titre informatif et
          humoristique, sans lien commercial.
        </p>
      </section>
    </main>
  );
}
