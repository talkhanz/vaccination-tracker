// Central design tokens. Keeping colors, spacing, and typography here keeps
// every screen visually consistent and makes future theming trivial.

export const colors = {
  // Brand — a calm, trustworthy teal with a warm coral accent.
  primary: '#0E7C86',
  primaryDark: '#0A5A61',
  primaryTint: '#E3F2F3',
  accent: '#FF7A66',

  // Status colors, used consistently across the schedule + dashboard.
  overdue: '#E5484D',
  overdueTint: '#FCECEC',
  dueSoon: '#F5A524',
  dueSoonTint: '#FEF3E2',
  upcoming: '#5B6472',
  upcomingTint: '#EEF0F3',
  completed: '#2E9E5B',
  completedTint: '#E6F5EC',

  // Neutrals.
  background: '#F6F8F9',
  surface: '#FFFFFF',
  border: '#E4E8EB',
  text: '#1A2230',
  textMuted: '#66707C',
  textFaint: '#98A2AE',
  white: '#FFFFFF',
};

// Distinct, friendly avatar colors for telling children apart (white text reads
// clearly on all of them).
export const avatarColors = [
  '#0E7C86', // teal
  '#3B82C4', // blue
  '#7C5CBF', // purple
  '#C0508E', // magenta
  '#E5734E', // coral
  '#2E9E5B', // green
  '#C0902A', // gold
  '#5B7A8C', // slate
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 17, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  small: { fontSize: 13, fontWeight: '400' as const, color: colors.textMuted },
  tiny: { fontSize: 11, fontWeight: '600' as const, color: colors.textMuted },
};

export const shadow = {
  card: {
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};
