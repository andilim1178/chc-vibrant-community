export function relativeLuminance(hex: string): number {
  const c = [1, 3, 5]
    .map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrastRatio(a: string, b: string): number {
  const [x, y] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (p, q) => q - p
  );
  return (x + 0.05) / (y + 0.05);
}

export function pickInk(
  hex: string,
  light = '#FFFFFF',
  dark = '#000000'
): string {
  const ratioLight = contrastRatio(hex, light);
  const ratioDark = contrastRatio(hex, dark);
  return ratioLight >= ratioDark ? light : dark;
}
