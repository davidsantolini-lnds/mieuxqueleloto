import { ImageResponse } from "next/og";
import { formatOdds, formatRatio } from "@/lib/format";

export const runtime = "edge";

/**
 * Génère l'image OpenGraph d'un résultat partagé.
 *
 * Paramètres (tous calculés côté serveur dans `generateMetadata` de la
 * page d'accueil — l'image elle-même ne fait QUE le rendu, zéro logique
 * matcher) :
 *   - n : oddsDenominator (number)
 *   - r : ratioVsLoto (number)
 *   - l : label affiché (string, encodeURIComponent)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const denom = Number(searchParams.get("n"));
  const ratio = Number(searchParams.get("r"));
  const rawLabel = searchParams.get("l") ?? "";

  if (!denom || !ratio || !rawLabel) {
    // Fallback : image générique « brand » sans chiffres.
    return new ImageResponse(<BrandCard />, { width: 1200, height: 630 });
  }

  const odds = formatOdds(denom);
  const ratioText = formatRatio(ratio);
  // Sécurise contre les labels trop longs (carde le visuel équilibré).
  const label =
    rawLabel.length > 90 ? rawLabel.slice(0, 87) + "…" : rawLabel;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "70px 90px",
          color: "white",
          background:
            "linear-gradient(135deg, #061344 0%, #0a1f60 55%, #1a2d80 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 32,
            fontWeight: 700,
            color: "#f5c518",
            letterSpacing: -0.5,
          }}
        >
          mieuxqueleloto.fr
        </div>

        {/* Chiffre */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 130,
              fontWeight: 900,
              lineHeight: 1,
              backgroundImage:
                "linear-gradient(135deg, #f5c518 0%, #ff7a00 55%, #e2001a 100%)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: -2,
            }}
          >
            {odds}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 44,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.15,
            }}
          >
            {label}
          </div>
        </div>

        {/* Ratio */}
        <div
          style={{
            display: "flex",
            fontSize: 32,
            fontWeight: 600,
            color: "#f5c518",
            marginTop: 30,
          }}
        >
          {ratioText}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

function BrandCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        color: "white",
        background:
          "linear-gradient(135deg, #061344 0%, #0a1f60 55%, #1a2d80 100%)",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 110,
          fontWeight: 900,
          backgroundImage:
            "linear-gradient(135deg, #f5c518 0%, #ff7a00 55%, #e2001a 100%)",
          backgroundClip: "text",
          color: "transparent",
          letterSpacing: -2,
        }}
      >
        Mieux que le Loto&nbsp;?
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 40,
          fontSize: 36,
          color: "#cbd6ff",
          maxWidth: 900,
        }}
      >
        Tes vraies chances de devenir millionnaire, comparées à l&apos;EuroMillions.
      </div>
    </div>
  );
}
