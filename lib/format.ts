// Helpers de formatage purs (zéro dépendance au catalogue) — sûrs à importer
// dans les composants sans alourdir le JS de premier rendu.

export function formatOdds(denominator: number): string {
  if (denominator < 1.5) return `quasi certain`;
  if (denominator < 10)
    return `1 chance sur ${denominator.toFixed(1).replace(".0", "")}`;
  const rounded = Math.round(denominator);
  return `1 chance sur ${rounded.toLocaleString("fr-FR")}`;
}

export function formatRatio(ratio: number): string {
  // `ratio` = chances comparées au baseline Loto + MyMillion.
  if (ratio >= 1) {
    return `${Math.round(ratio).toLocaleString("fr-FR")}× plus de chances qu'au Loto + MyMillion`;
  }
  return `${Math.round(1 / ratio).toLocaleString("fr-FR")}× moins de chances qu'au Loto + MyMillion`;
}
