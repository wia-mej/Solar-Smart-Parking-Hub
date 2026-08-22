export const colors = {
  // Vert énergie — couleur principale de l'app
  primary: '#12A150',
  primaryDark: '#0A6B36',
  primarySoft: '#E7F7EE',

  // Jaune solaire — accent réservé à tout ce qui touche à la production d'énergie
  solar: '#F59E0B',
  solarSoft: '#FEF3C7',

  // Neutres
  background: '#F4F8F5',
  surface: '#FFFFFF',
  border: '#DCE7E0',

  text: '#0B1F17',
  textMuted: '#5C7268',
  textInverse: '#FFFFFF',

  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 8, md: 14, lg: 22, pill: 999 };

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  heading: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  small: { fontSize: 13, color: colors.textMuted },
};