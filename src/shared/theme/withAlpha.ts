/**
 * Derives an rgba() string from a #RRGGBB (or #RGB) token color at the given
 * alpha, so tinted fills (icon badges, banners) come from the theme instead
 * of a second, independent color literal that can drift from the token.
 */
export function withAlpha(hex: string, alpha: number): string {
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
