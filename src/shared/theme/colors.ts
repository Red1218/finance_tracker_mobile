export interface ColorTokens {
  backgroundPrimary: string;
  backgroundSecondary: string;
  surfacePrimary: string;
  surfaceElevated: string;
  surfaceSecondary: string;
  brandPrimary: string;
  brandPrimaryPressed: string;
  brandSecondary: string;
  success: string;
  warning: string;
  error: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  divider: string;
  disabled: string;
  overlay: string;
  focus: string;
}

export const darkColors: ColorTokens = Object.freeze({
  backgroundPrimary: '#0F172A',
  backgroundSecondary: '#0A0A0A',
  surfacePrimary: '#1E293B',
  surfaceElevated: '#334155',
  surfaceSecondary: '#18181B',
  // oklch(0.66 0.095 290) — spec's own approximation (docs §4).
  brandPrimary: '#9184D9',
  // No pressed/hover value given in the spec for the new accent — left
  // unchanged pending an explicit decision, per session review.
  brandPrimaryPressed: '#1D4ED8',
  // Collapses into brandPrimary (docs §4: "the indigo had no distinct job").
  // Key kept in place per review so existing consumers don't break.
  brandSecondary: '#9184D9',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  borderSubtle: '#27272A',
  divider: '#292929',
  disabled: '#334155',
  overlay: 'rgba(0, 0, 0, 0.75)',
  focus: '#3B82F6',
});

export const lightColors: ColorTokens = Object.freeze({
  backgroundPrimary: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  surfacePrimary: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  // oklch(0.52 0.13 290) — spec's own approximation (docs §4). Darkened from
  // the dark-theme accent: the dark-ground value only manages 3.1:1 on white.
  brandPrimary: '#6B5CC4',
  // No pressed/hover value given in the spec for the new accent — left
  // unchanged pending an explicit decision, per session review.
  brandPrimaryPressed: '#1D4ED8',
  // Collapses into brandPrimary (docs §4: "the indigo had no distinct job").
  brandSecondary: '#6B5CC4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  divider: '#E2E8F0',
  disabled: '#CBD5E1',
  overlay: 'rgba(15, 23, 42, 0.5)',
  focus: '#2563EB',
});

// Default export for backward compatibility
export const colors = darkColors;
