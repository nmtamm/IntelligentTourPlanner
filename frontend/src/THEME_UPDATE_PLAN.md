# Theme Color Application Plan

## Components to Update (93 hardcoded color instances found)

### Priority 1: Main UI Components
1. ✅ **Settings.tsx** - Updated modal/dropdown headers and borders
2. **IntroScreen.tsx** - 18 instances (gradients, buttons, backgrounds)
3. **ChatBox.tsx** - 4 instances (AI avatar, send button)
4. **Sidebar.tsx** - 5 instances (mode buttons, hover effects)

### Priority 2: Interactive Components  
5. **MapView.tsx** - 11 instances (optimize button, badges, navigation)
6. **DayView.tsx** - 5 instances (day total, focus rings)
7. **AllDaysView.tsx** - 6 instances (totals, headers)
8. **RouteGuidance.tsx** - 8 instances (stats cards, step numbers)

### Priority 3: Secondary Components
9. **UserManual.tsx** - 5 instances (highlights, progress bar)
10. **SavedPlans.tsx** - 2 instances (create button, hover)
11. **AuthModal.tsx** - 1 instance (link color)

## Strategy

### Use CSS Variables (Automatic)
- All Tailwind classes using `bg-primary`, `text-primary`, etc. automatically use theme
- No changes needed for these

### Use useThemeColors Hook (Dynamic)
```tsx
import { useThemeColors } from '../hooks/useThemeColors';

const { primary, secondary, accent, light, primaryDark } = useThemeColors();

// Then use in inline styles:
style={{ backgroundColor: primary }}
style={{ borderColor: `${primary}33` }} // 33 = 20% opacity
```

### Replace Hardcoded Colors
- `#004DB6` → `primary`
- `#70C573` → `secondary`  
- `#5E885D` → `accent`
- `#DAF9D8` → `light`
- `#003d8f` → `primaryDark`

## Implementation Order

1. Import `useThemeColors` hook at top
2. Destructure needed colors from hook
3. Replace hardcoded HEX values with variables
4. Use inline `style` props for dynamic colors
5. Keep Tailwind classes for layout/sizing

## Example Before/After

### Before:
```tsx
<Button className="bg-[#004DB6] hover:bg-[#003d8f]">
  Click Me
</Button>
```

### After:
```tsx
const { primary, primaryDark } = useThemeColors();

<Button style={{ 
  backgroundColor: primary,
  '--hover-bg': primaryDark 
}} className="hover:bg-[var(--hover-bg)]">
  Click Me
</Button>
```

Or simpler with CSS variables:
```tsx
<Button className="bg-primary hover:bg-primary-dark">
  Click Me
</Button>
```
