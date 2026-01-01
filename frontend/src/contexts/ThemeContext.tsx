import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme color definitions
export interface ThemeColors {
  primary: string;        // Main color 1
  secondary: string;      // Main color 2
  accent: string;         // Main color 3
  light: string;          // Main color 4
  highlight: string;      // Main color 5 - NEW
  background: string;     // App background gradient
  cardBg: string;         // Card background
  text: {
    primary: string;      // Main text color (gray)
    secondary: string;    // Secondary text
    heading: string;      // Headings
  };
  border: string;         // Border colors
  shadow: string;         // Shadow color
}

// Predefined theme types
export type ThemeType = 'vietnamLotus' | 'classicBlue' | 'ocean' | 'forest' | 'sunset' | 'lavender';

// Theme configuration
export interface Theme {
  id: ThemeType;
  name: {
    en: string;
    vi: string;
  };
  colors: ThemeColors;
}

// Context type
interface ThemeContextType {
  currentTheme: Theme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  customColors: ThemeColors | null;
  setCustomColors: (colors: ThemeColors) => void;
  applyTheme: () => void;
}

// Vietnam Lotus theme - DEFAULT (matches IntroScreen)
const vietnamLotusTheme: Theme = {
  id: 'vietnamLotus',
  name: {
    en: 'Vietnam Lotus',
    vi: 'Sen Việt Nam',
  },
  colors: {
    primary: '#2B7BA8',      // Blue from IntroScreen
    secondary: '#FFB347',    // Orange from IntroScreen
    accent: '#FF8C69',       // Coral/salmon from IntroScreen
    light: '#FFD9CC',        // Light peach from IntroScreen
    highlight: '#FF6B6B',    // Coral red for contrast
    background: 'linear-gradient(135deg, #FFE5D9 0%, #FFC9A8 25%, #FFB5C5 50%, #C5A3D6 75%, #9ECDE8 100%)',
    cardBg: '#FFFFFF',
    text: {
      primary: '#64748B',    // Gray text
      secondary: '#94A3B8',
      heading: '#1E293B',
    },
    border: '#FFD9CC',
    shadow: 'rgba(43, 123, 168, 0.08)',
  },
};

// Classic Blue theme (original app colors)
const classicBlueTheme: Theme = {
  id: 'classicBlue',
  name: {
    en: 'Azure Sky',
    vi: 'Bầu Trời Xanh',
  },
  colors: {
    primary: '#004DB6',      // Deep blue
    secondary: '#70C573',    // Fresh green
    accent: '#5E885D',       // Sage green
    light: '#DAF9D8',        // Mint light
    highlight: '#87CEEB',    // Sky blue
    background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 25%, #BFDBFE 50%, #93C5FD 75%, #DBEAFE 100%)',
    cardBg: '#FFFFFF',
    text: {
      primary: '#64748B',
      secondary: '#94A3B8',
      heading: '#1E293B',
    },
    border: '#E5E7EB',
    shadow: 'rgba(15, 23, 42, 0.08)',
  },
};

// Predefined themes (ready for future expansion)
export const THEMES: Record<ThemeType, Theme> = {
  vietnamLotus: vietnamLotusTheme,
  classicBlue: classicBlueTheme,
  
  // Ocean theme - Blue tones
  ocean: {
    id: 'ocean',
    name: {
      en: 'Tropical Paradise',
      vi: 'Thiên Đường Nhiệt Đới',
    },
    colors: {
      primary: '#0077BE',      // Deep ocean blue
      secondary: '#FF6B6B',    // Coral red for contrast
      accent: '#FFA726',       // Warm orange accent
      light: '#B3E5FC',        // Light sky blue
      highlight: '#4DD0E1',    // Cyan turquoise
      background: 'linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 25%, #FFE0B2 50%, #FFCC80 75%, #FFF3E0 100%)',
      cardBg: '#FFFFFF',
      text: {
        primary: '#37474F',    // Deep blue-gray
        secondary: '#607D8B',
        heading: '#1A237E',    // Deep navy
      },
      border: '#B3E5FC',
      shadow: 'rgba(0, 119, 190, 0.08)',
    },
  },

  // Forest theme - Green tones
  forest: {
    id: 'forest',
    name: {
      en: 'Mountain Safari',
      vi: 'Safari Núi Rừng',
    },
    colors: {
      primary: '#2E7D32',      // Forest green
      secondary: '#FF6F00',    // Burnt orange for contrast
      accent: '#FDD835',       // Sunlight yellow
      light: '#C8E6C9',        // Light mint
      highlight: '#8BC34A',    // Light green
      background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 25%, #FFF9C4 50%, #FFECB3 75%, #FFF8E1 100%)',
      cardBg: '#FFFFFF',
      text: {
        primary: '#3E2723',    // Dark brown
        secondary: '#5D4037',
        heading: '#1B5E20',    // Deep forest
      },
      border: '#C8E6C9',
      shadow: 'rgba(46, 125, 50, 0.08)',
    },
  },

  // Sunset theme - Warm tones
  sunset: {
    id: 'sunset',
    name: {
      en: 'Desert Sunset',
      vi: 'Hoàng Hôn Sa Mạc',
    },
    colors: {
      primary: '#D84315',      // Deep orange-red
      secondary: '#7B1FA2',    // Deep purple for contrast
      accent: '#FFC107',       // Golden yellow
      light: '#FFCCBC',        // Soft peach
      highlight: '#E91E63',    // Pink magenta
      background: 'linear-gradient(135deg, #FFE0B2 0%, #FFCCBC 25%, #F8BBD0 50%, #E1BEE7 75%, #F3E5F5 100%)',
      cardBg: '#FFFFFF',
      text: {
        primary: '#4E342E',    // Dark brown
        secondary: '#6D4C41',
        heading: '#BF360C',    // Burnt orange
      },
      border: '#FFCCBC',
      shadow: 'rgba(216, 67, 21, 0.08)',
    },
  },

  // Lavender theme - Purple tones
  lavender: {
    id: 'lavender',
    name: {
      en: 'Royal Palace',
      vi: 'Cung Điện Hoàng Gia',
    },
    colors: {
      primary: '#7B1FA2',      // Deep purple
      secondary: '#00ACC1',    // Turquoise for contrast
      accent: '#FFB300',       // Amber gold
      light: '#E1BEE7',        // Light lavender
      highlight: '#AB47BC',    // Medium purple
      background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 25%, #B2EBF2 50%, #80DEEA 75%, #E0F7FA 100%)',
      cardBg: '#FFFFFF',
      text: {
        primary: '#4A148C',    // Deep purple
        secondary: '#6A1B9A',
        heading: '#4A148C',    // Rich purple
      },
      border: '#E1BEE7',
      shadow: 'rgba(123, 31, 162, 0.08)',
    },
  },

  // Custom theme (user-defined)
  custom: {
    id: 'custom',
    name: {
      en: 'Custom Theme',
      vi: 'Chủ Đề Tùy Chỉnh',
    },
    colors: vietnamLotusTheme.colors, // Will be overridden by user
  },
};

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeType, setThemeType] = useState<ThemeType>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('themeType');
    return (saved as ThemeType) || 'vietnamLotus';  // Default to vietnamLotus theme
  });

  const [customColors, setCustomColors] = useState<ThemeColors | null>(() => {
    // Load custom colors from localStorage
    const saved = localStorage.getItem('customColors');
    return saved ? JSON.parse(saved) : null;
  });

  // Get current theme
  const currentTheme: Theme = themeType === 'custom' && customColors
    ? { ...THEMES.custom, colors: customColors }
    : THEMES[themeType];

  // Apply theme to CSS variables
  const applyTheme = () => {
    const root = document.documentElement;
    const colors = currentTheme.colors;

    // Set CSS custom properties for theme system
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-light', colors.light);
    root.style.setProperty('--color-highlight', colors.highlight);
    root.style.setProperty('--color-card-bg', colors.cardBg);
    root.style.setProperty('--color-text-primary', colors.text.primary);
    root.style.setProperty('--color-text-secondary', colors.text.secondary);
    root.style.setProperty('--color-text-heading', colors.text.heading);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-shadow', colors.shadow);

    // Also update the existing globals.css variables for UI components
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.secondary);
    root.style.setProperty('--muted', colors.light);
    root.style.setProperty('--ring', colors.primary);
    root.style.setProperty('--sidebar-primary', colors.primary);
    root.style.setProperty('--sidebar-accent', colors.light);
    root.style.setProperty('--sidebar-border', colors.accent);
    root.style.setProperty('--sidebar-ring', colors.primary);
    root.style.setProperty('--chart-1', colors.primary);
    root.style.setProperty('--chart-2', colors.secondary);
    root.style.setProperty('--chart-3', colors.accent);
    root.style.setProperty('--chart-4', colors.light);
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme();
  }, [currentTheme]);

  // Save theme type to localStorage
  useEffect(() => {
    localStorage.setItem('themeType', themeType);
  }, [themeType]);

  // Save custom colors to localStorage
  useEffect(() => {
    if (customColors) {
      localStorage.setItem('customColors', JSON.stringify(customColors));
    }
  }, [customColors]);

  const value: ThemeContextType = {
    currentTheme,
    themeType,
    setThemeType,
    customColors,
    setCustomColors,
    applyTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}