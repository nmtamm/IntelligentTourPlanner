# Theme System Documentation

## 📚 Overview

The Intelligent Tour Planner now includes a complete theme infrastructure that allows users to change color schemes. The system is built with React Context and supports multiple predefined themes plus custom theme creation (coming soon).

## 🏗️ Structure

### 1. **ThemeContext** (`/contexts/ThemeContext.tsx`)

The central theme management system that provides:

- **Theme definitions** with color palettes
- **Theme switching** functionality
- **LocalStorage persistence** for user preferences
- **CSS custom properties** applied to `:root`

### 2. **Settings Component** (`/components/Settings.tsx`)

User interface for theme selection with:

- **Visual theme picker** showing color previews
- **Grid layout** displaying all available themes
- **Instant preview** of selected theme
- **Placeholder** for future custom theme editor

### 3. **App.tsx Integration**

- Wrapped with `<ThemeProvider>` at the root level
- All components automatically have access to theme context

## 🎨 Available Themes

### Current Themes (5)

1. **Default Blue** - Original app colors
   - Primary: `#004DB6` (Blue)
   - Secondary: `#70C573` (Green)
   - Accent: `#5E885D` (Sage)
   - Light: `#DAF9D8` (Mint)

2. **Ocean Blue** - Blue-focused palette
   - Primary: `#0077BE`
   - Secondary: `#00A8E8`
   - Accent: `#007EA7`
   - Light: `#C8E9F5`

3. **Forest Green** - Nature-inspired greens
   - Primary: `#2D6A4F`
   - Secondary: `#52B788`
   - Accent: `#40916C`
   - Light: `#D8F3DC`

4. **Sunset Orange** - Warm tones
   - Primary: `#E76F51`
   - Secondary: `#F4A261`
   - Accent: `#E9C46A`
   - Light: `#FCE8DB`

5. **Lavender Purple** - Cool purple tones
   - Primary: `#7B68EE`
   - Secondary: `#9D84B7`
   - Accent: `#B695C0`
   - Light: `#E6E1F0`

## 🔧 How to Use

### For Users

1. Open **Settings** from the sidebar
2. Scroll to **Color Theme** section
3. Click on any theme to preview it
4. Theme applies instantly across all components

### For Developers

#### Access Theme in Components

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { currentTheme, themeType, setThemeType } = useTheme();
  
  // Use theme colors
  const primaryColor = currentTheme.colors.primary;
  
  // Change theme
  const switchToOcean = () => setThemeType('ocean');
  
  return (
    <div style={{ backgroundColor: primaryColor }}>
      {/* Your component */}
    </div>
  );
}
```

#### Using CSS Custom Properties

The theme system automatically sets CSS variables on `:root`:

```css
:root {
  --color-primary: #004DB6;
  --color-secondary: #70C573;
  --color-accent: #5E885D;
  --color-light: #DAF9D8;
  --color-card-bg: #FFFFFF;
  --color-text-primary: #64748B;
  --color-text-secondary: #94A3B8;
  --color-text-heading: #1E293B;
  --color-border: #E5E7EB;
  --color-shadow: rgba(15, 23, 42, 0.08);
}
```

Use in Tailwind or CSS:

```tsx
// With inline styles
<div style={{ color: 'var(--color-primary)' }}>

// With Tailwind (need to extend config)
<div className="bg-[var(--color-primary)]">
```

## 🚀 Adding New Themes

### Step 1: Define Theme in ThemeContext

Edit `/contexts/ThemeContext.tsx`:

```tsx
export const THEMES: Record<ThemeType, Theme> = {
  // ... existing themes
  
  // Add new theme
  midnight: {
    id: 'midnight',
    name: {
      en: 'Midnight Dark',
      vi: 'Tối Nửa Đêm',
    },
    colors: {
      primary: '#1E293B',
      secondary: '#334155',
      accent: '#475569',
      light: '#94A3B8',
      background: 'linear-gradient(to bottom right, #0F172A, #1E293B)',
      cardBg: '#1E293B',
      text: {
        primary: '#E2E8F0',
        secondary: '#CBD5E1',
        heading: '#F8FAFC',
      },
      border: '#334155',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
};
```

### Step 2: Update ThemeType

```tsx
export type ThemeType = 'default' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'midnight' | 'custom';
```

### Step 3: Add to Available Themes in Settings

Edit `/components/Settings.tsx`:

```tsx
const availableThemes: ThemeType[] = ['default', 'ocean', 'forest', 'sunset', 'lavender', 'midnight'];
```

That's it! The new theme will automatically appear in the Settings UI.

## 🎯 Future Enhancements (Roadmap)

### Custom Theme Editor

Plan to add:

1. **Color Picker UI** for each color slot
2. **Real-time preview** while editing
3. **Save custom themes** with user-defined names
4. **Export/Import** theme JSON files
5. **Reset to defaults** button

### Implementation Outline

```tsx
// Future CustomThemeEditor component structure
function CustomThemeEditor() {
  const [customColors, setCustomColors] = useState<ThemeColors>({...});
  
  return (
    <div className="space-y-4">
      <ColorPicker 
        label="Primary Color"
        value={customColors.primary}
        onChange={(color) => setCustomColors({...customColors, primary: color})}
      />
      {/* More color pickers... */}
      
      <Button onClick={() => saveCustomTheme(customColors)}>
        Save Custom Theme
      </Button>
    </div>
  );
}
```

### Dark Mode Support

Add automatic dark mode detection and toggle:

```tsx
const [darkMode, setDarkMode] = useState(
  window.matchMedia('(prefers-color-scheme: dark)').matches
);
```

## 📝 Component Migration Guide

To make existing components theme-aware:

### Before (Hardcoded Colors)

```tsx
<div className="bg-[#004DB6] text-white">
  <h1 className="text-gray-900">Title</h1>
</div>
```

### After (Theme-Aware)

```tsx
import { useTheme } from '../contexts/ThemeContext';

function Component() {
  const { currentTheme } = useTheme();
  
  return (
    <div style={{ 
      backgroundColor: currentTheme.colors.primary,
      color: 'white'
    }}>
      <h1 style={{ color: currentTheme.colors.text.heading }}>
        Title
      </h1>
    </div>
  );
}
```

Or with CSS variables:

```tsx
<div className="bg-[var(--color-primary)] text-white">
  <h1 style={{ color: 'var(--color-text-heading)' }}>Title</h1>
</div>
```

## 🔍 Testing

Test theme switching:

1. Open browser DevTools → Application → Local Storage
2. Check `themeType` key for persistence
3. Switch themes and verify colors update
4. Refresh page and verify theme persists

## ⚠️ Important Notes

- **All text uses gray by default** - Keep text colors neutral unless using theme accent
- **Gradients** are defined per theme for backgrounds
- **Theme changes are instant** - No page reload required
- **LocalStorage** persists user theme preference
- **CSS variables** allow for easy integration with existing styles

## 📦 File Locations

```
/contexts/ThemeContext.tsx       # Theme provider & definitions
/components/Settings.tsx         # Theme UI selector
/App.tsx                         # ThemeProvider wrapper
/THEME_SYSTEM.md                 # This documentation
```

## 🎨 Design Principles

1. **Consistency** - All themes follow the same structure
2. **Accessibility** - Maintain sufficient color contrast
3. **Flexibility** - Easy to add new themes
4. **Performance** - CSS variables for instant updates
5. **User Control** - Clear, visual theme selection

---

**Ready for theme customization!** The infrastructure is complete and ready to expand. 🚀
