/**
 * Dynamic Brand Color System & UI/UX Design System Token Engine
 * Automatically derives accessible tints, hover states, border tones, and ring tokens
 * from the configured business primary & accent colors.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (val: number) => {
    const res = Math.round(val + (val * percent) / 100);
    return Math.min(255, Math.max(0, res));
  };
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

function mixWithWhite(hex: string, whiteWeight: number): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (val: number) => Math.round(val * (1 - whiteWeight) + 255 * whiteWeight);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

export function applyBrandTheme(primaryColor = '#166534', accentColor = '#d97706') {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const prim = primaryColor.startsWith('#') ? primaryColor : `#${primaryColor}`;
  const acc = accentColor.startsWith('#') ? accentColor : `#${accentColor}`;

  try {
    const { r: pr, g: pg, b: pb } = hexToRgb(prim);
    const { r: ar, g: ag, b: ab } = hexToRgb(acc);

    const primHover = adjustBrightness(prim, -15);
    const primDark = adjustBrightness(prim, -30);
    const primLight = mixWithWhite(prim, 0.94);
    const primLighter = mixWithWhite(prim, 0.97);
    const primBorder = mixWithWhite(prim, 0.70);

    const accHover = adjustBrightness(acc, -15);
    const accLight = mixWithWhite(acc, 0.93);
    const accBorder = mixWithWhite(acc, 0.65);

    // Dynamic brand tokens
    root.style.setProperty('--brand-primary', prim);
    root.style.setProperty('--brand-primary-hover', primHover);
    root.style.setProperty('--brand-primary-dark', primDark);
    root.style.setProperty('--brand-primary-light', primLight);
    root.style.setProperty('--brand-primary-lighter', primLighter);
    root.style.setProperty('--brand-primary-border', primBorder);
    root.style.setProperty('--brand-primary-rgb', `${pr}, ${pg}, ${pb}`);

    root.style.setProperty('--brand-accent', acc);
    root.style.setProperty('--brand-accent-hover', accHover);
    root.style.setProperty('--brand-accent-light', accLight);
    root.style.setProperty('--brand-accent-border', accBorder);
    root.style.setProperty('--brand-accent-rgb', `${ar}, ${ag}, ${ab}`);

    // Map Tailwind standard utility variables so all existing classes reflect the palette automatically
    root.style.setProperty('--color-emerald-950', adjustBrightness(prim, -40));
    root.style.setProperty('--color-emerald-900', primDark);
    root.style.setProperty('--color-emerald-800', primHover);
    root.style.setProperty('--color-emerald-700', prim);
    root.style.setProperty('--color-emerald-600', prim);
    root.style.setProperty('--color-emerald-500', adjustBrightness(prim, 10));
    root.style.setProperty('--color-emerald-400', mixWithWhite(prim, 0.4));
    root.style.setProperty('--color-emerald-300', mixWithWhite(prim, 0.6));
    root.style.setProperty('--color-emerald-200', primBorder);
    root.style.setProperty('--color-emerald-100', mixWithWhite(prim, 0.88));
    root.style.setProperty('--color-emerald-50', primLight);

    root.style.setProperty('--color-amber-700', adjustBrightness(acc, -25));
    root.style.setProperty('--color-amber-600', accHover);
    root.style.setProperty('--color-amber-500', acc);
    root.style.setProperty('--color-amber-400', mixWithWhite(acc, 0.25));
    root.style.setProperty('--color-amber-300', mixWithWhite(acc, 0.5));
    root.style.setProperty('--color-amber-200', accBorder);
    root.style.setProperty('--color-amber-100', mixWithWhite(acc, 0.85));
    root.style.setProperty('--color-amber-50', accLight);
  } catch (err) {
    console.warn('Failed to parse brand theme colors:', err);
  }
}
