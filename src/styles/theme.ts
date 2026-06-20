// Tokens de diseño (alto contraste, a juego con el logo verde).
// Se reflejan 1:1 como variables CSS --ll-* en src/app/globals.css.

export const colors = {
  background: '#F3F8EF',
  surface: '#FFFFFF',
  surfaceAlt: '#E7F1E1',

  text: '#16210F',
  textMuted: '#4A5A40',
  textInverse: '#FFFFFF',

  brand: '#5BA84E', // verde del logo (decorativo)

  // Verde oscuro de acción: mantiene contraste AA con texto blanco.
  primary: '#2E7D32',
  primaryStrong: '#1E5D24',
  primaryContrast: '#FFFFFF',

  border: '#CADBC0',

  disponibleBg: '#2E7D32',
  disponibleText: '#FFFFFF',
  reservadoBg: '#5B6557',
  reservadoText: '#FFFFFF',

  // Éxito (CA-1)
  exitoBg: '#E6F4E6',
  exitoBorder: '#2E7D32',
  exitoText: '#14491A',

  // Conflicto (CA-2)
  conflictoBg: '#FBE9E7',
  conflictoBorder: '#8A1C12',
  conflictoText: '#5A0F09',

  focus: '#1A56DB',
} as const;

/** Mínimo táctil del arquetipo (CA-3): botones e interacciones ≥ 48×48px. */
export const touchTargetMin = '48px';

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const;

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
} as const;

export const fontSize = {
  sm: '0.95rem',
  base: '1.0625rem', // ~17px, cuerpo legible en pantalla pequeña
  lg: '1.25rem',
  xl: '1.5rem',
  xxl: '2rem',
} as const;

export type ThemeColors = typeof colors;
