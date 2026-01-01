import { useTheme } from '../contexts/ThemeContext';

/**
 * Hook that provides easy access to theme color variables
 * Returns both CSS variable strings and direct color values
 */
export function useThemeColors() {
  const { currentTheme } = useTheme();
  const colors = currentTheme.colors;

  return {
    // Direct color values
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    light: colors.light,
    highlight: colors.highlight,
    background: colors.background,
    cardBg: colors.cardBg,
    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
    textHeading: colors.text.heading,
    border: colors.border,
    shadow: colors.shadow,

    // CSS variable strings (for Tailwind classes)
    bg: {
      primary: 'bg-[var(--color-primary)]',
      secondary: 'bg-[var(--color-secondary)]',
      accent: 'bg-[var(--color-accent)]',
      light: 'bg-[var(--color-light)]',
      highlight: 'bg-[var(--color-highlight)]',
    },
    text: {
      primary: 'text-[var(--color-primary)]',
      secondary: 'text-[var(--color-secondary)]',
      accent: 'text-[var(--color-accent)]',
      highlight: 'text-[var(--color-highlight)]',
    },
    border: {
      primary: 'border-[var(--color-primary)]',
      secondary: 'border-[var(--color-secondary)]',
      accent: 'border-[var(--color-accent)]',
      highlight: 'border-[var(--color-highlight)]',
    },
    hover: {
      primary: 'hover:bg-[var(--color-primary)]',
      secondary: 'hover:bg-[var(--color-secondary)]',
      accent: 'hover:bg-[var(--color-accent)]',
      light: 'hover:bg-[var(--color-light)]',
      highlight: 'hover:bg-[var(--color-highlight)]',
    },

    // Computed colors
    primaryDark: darkenColor(colors.primary),
    secondaryDark: darkenColor(colors.secondary),
  };
}

// Utility to darken a hex color
function darkenColor(hex: string, percent: number = 20): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Darken each component
  const darkenValue = (val: number) => Math.max(0, Math.floor(val * (1 - percent / 100)));
  
  const newR = darkenValue(r).toString(16).padStart(2, '0');
  const newG = darkenValue(g).toString(16).padStart(2, '0');
  const newB = darkenValue(b).toString(16).padStart(2, '0');
  
  return `#${newR}${newG}${newB}`;
}