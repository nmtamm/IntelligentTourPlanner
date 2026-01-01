# 🌍 Translation System Implementation Guide

## Overview
This guide explains the translation dictionary system implemented for the Intelligent Tour Planner app, supporting English and Vietnamese languages.

---

## ✅ What's Been Completed

### 1. **Translation Dictionary Created**
- File: `/locales/translations.ts`
- Contains 100+ translation keys covering all app content
- Includes translations for:
  - Header & Navigation
  - Main titles and descriptions
  - Buttons and actions
  - Form labels and placeholders
  - Toast messages
  - User Manual steps
  - All UI text elements

### 2. **Files Already Updated**
✅ `/App.tsx` - Header buttons (Login, Logout, My Plans, Custom Mode, User Manual)
✅ `/components/SavedPlans.tsx` - Complete translation integration

---

## 📖 How to Use the Translation System

### Basic Usage

```typescript
import { t } from '../locales/translations';

// In your component
interface MyComponentProps {
  language: 'EN' | 'VI';
}

export function MyComponent({ language }: MyComponentProps) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  
  return (
    <div>
      <h1>{t('generateYourPerfectTrip', lang)}</h1>
      <button>{t('save', lang)}</button>
    </div>
  );
}
```

### Translation Function

```typescript
// Function signature
function t(key: TranslationKey, lang: 'en' | 'vi'): string

// Examples
t('login', 'en')           // Returns: "Login"
t('login', 'vi')           // Returns: "Đăng nhập"
t('myPlans', 'en')         // Returns: "My Plans"
t('myPlans', 'vi')         // Returns: "Kế hoạch của tôi"
```

---

## 🔧 Components That Need Translation Updates

### Priority 1: Main Components

#### 1. **CustomMode.tsx** (Most important)

**Current hardcoded text:**
- "Generate Your Perfect Trip"
- "Let AI create an optimized itinerary for you"
- "Custom Mode - Manual Editing"
- "Trip Plan Name"
- "Add Destination"
- "Optimize Route"
- Buttons: Generate, Save, Reset
- Day management text
- All placeholder text

**How to update:**
```typescript
// Add to component props
interface CustomModeProps {
  // ... existing props
  language: "EN" | "VI";
}

// In component
export function CustomMode({ language, ...otherProps }: CustomModeProps) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  
  // Replace hardcoded text with:
  <h2>{t('generateYourPerfectTrip', lang)}</h2>
  <p>{t('aiOptimizedItinerary', lang)}</p>
  <Button>{t('generate', lang)}</Button>
  <Button>{t('save', lang)}</Button>
  // etc...
}
```

#### 2. **AuthModal.tsx**

**Keys available:**
- `welcomeBack`
- `createAccount`
- `loginToAccount`
- `signupToStart`
- `email`
- `password`
- `confirmPassword`
- `login`
- `signUp`
- `alreadyHaveAccount`
- `dontHaveAccount`

#### 3. **MapView.tsx**

**Keys available:**
- `mapView`
- `routeList`
- `clickToNavigate`
- `routeSegment` / `routeSegments`
- `goStartNavigation`
- `expandMap`
- `collapseMap`
- `from`
- `to`
- `openInGoogleMaps`

#### 4. **UserManual.tsx**

**Keys available:**
All 19 tutorial steps with titles and descriptions:
- `step1Title` through `step19Title`
- `step1Description` through `step19Description`
- `next`, `previous`, `skip`, `finish`

---

## 📝 Available Translation Keys

### Common Buttons & Actions
```typescript
t('add', lang)              // Add / Thêm
t('delete', lang)           // Delete / Xóa
t('save', lang)             // Save / Lưu
t('saving', lang)           // Saving / Đang lưu
t('reset', lang)            // Reset / Đặt lại
t('resetting', lang)        // Resetting / Đang đặt lại
t('back', lang)             // Back / Quay lại
t('generate', lang)         // Generate / Tạo
t('waiting', lang)          // Waiting / Đang chờ
t('optimize', lang)         // Optimize / Tối ưu hóa
t('optimizing', lang)       // Optimizing / Đang tối ưu
```

### Day & Destination Management
```typescript
t('day', lang)              // Day / Ngày
t('days', lang)             // days / ngày
t('addDay', lang)           // Add Day / Thêm ngày
t('viewAllDays', lang)      // View All Days / Xem tất cả các ngày
t('destination', lang)      // Destination / Điểm đến
t('destinations', lang)     // destinations / điểm đến
t('addDestination', lang)   // Add Destination / Thêm điểm đến
```

### Costs & Finances
```typescript
t('costs', lang)            // Costs / Chi phí
t('costItem', lang)         // Cost Item / Khoản chi
t('amount', lang)           // Amount / Số tiền
t('addCost', lang)          // Add Cost / Thêm chi phí
t('totalCost', lang)        // Total Cost / Tổng chi phí
t('total', lang)            // total / tổng cộng
```

### Form Fields
```typescript
t('destinationName', lang)          // Destination Name / Tên điểm đến
t('destinationNamePlaceholder', lang) // Placeholder text
t('tripPlanName', lang)             // Trip Plan Name / Tên kế hoạch chuyến đi
t('tripPlanPlaceholder', lang)      // Placeholder text
t('latitude', lang)                 // Latitude / Vĩ độ
t('longitude', lang)                // Longitude / Kinh độ
```

### Toast Messages
```typescript
t('pleaseLogin', lang)              // Please login to save your trip plan
t('planSaved', lang)                // Trip plan saved successfully!
t('planDeleted', lang)              // Plan deleted
t('planLoaded', lang)               // Plan loaded successfully!
t('routeOptimized', lang)           // Route optimized successfully!
t('optimizingRoute', lang)          // Optimizing route...
t('addDestinationsFirst', lang)     // Add at least 2 destinations...
t('dayDeleted', lang)               // Day deleted successfully
t('cannotDeleteLastDay', lang)      // Cannot delete the last remaining day
t('allDataCleared', lang)           // All data has been cleared!
```

---

## 🎯 Example: Complete Component Update

### Before (Hardcoded):
```typescript
export function CustomMode({ tripData, onUpdate }: Props) {
  return (
    <div>
      <h2>Generate Your Perfect Trip</h2>
      <p>Let AI create an optimized itinerary for you</p>
      <Button>Save</Button>
      <Button>Reset</Button>
    </div>
  );
}
```

### After (Translated):
```typescript
import { t } from '../locales/translations';

interface Props {
  // ... existing props
  language: 'EN' | 'VI';
}

export function CustomMode({ tripData, onUpdate, language }: Props) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  
  return (
    <div>
      <h2>{t('generateYourPerfectTrip', lang)}</h2>
      <p>{t('aiOptimizedItinerary', lang)}</p>
      <Button>{t('save', lang)}</Button>
      <Button>{t('reset', lang)}</Button>
    </div>
  );
}
```

---

## 🔄 Toast Messages with Translation

### Before:
```typescript
toast.success('Trip plan saved successfully!');
toast.error('Please login to save your trip plan');
```

### After:
```typescript
const lang = language.toLowerCase() as 'en' | 'vi';

toast.success(t('planSaved', lang));
toast.error(t('pleaseLogin', lang));
```

---

## 📋 Implementation Checklist

### ✅ Completed
- [x] Translation dictionary created (`/locales/translations.ts`)
- [x] App.tsx header buttons translated
- [x] SavedPlans.tsx fully translated
- [x] Language prop passed from App to all major components

### ⏳ To Do
- [ ] CustomMode.tsx - Main titles, buttons, labels
- [ ] CustomMode.tsx - Placeholder text
- [ ] CustomMode.tsx - Toast messages
- [ ] AuthModal.tsx - Form labels and buttons
- [ ] UserManual.tsx - Tutorial steps
- [ ] MapView.tsx - Map and route labels
- [ ] DestinationCard.tsx - Form fields and buttons
- [ ] Any other UI text elements

---

## 🌟 Benefits

1. **Centralized Management** - All translations in one file
2. **Type Safety** - TypeScript ensures valid translation keys
3. **Easy Updates** - Change translations in one place
4. **Scalable** - Easy to add new languages in the future
5. **Consistent** - Same translations used throughout the app

---

## 🚀 Next Steps

1. **Update CustomMode.tsx** - This is the main component with the most text
2. **Update AuthModal.tsx** - Login/signup forms
3. **Update MapView.tsx** - Map and route labels
4. **Update UserManual.tsx** - Tutorial steps
5. **Test** - Switch between EN/VI to verify all translations work

---

## 💡 Tips

1. Always convert language to lowercase: `language.toLowerCase() as 'en' | 'vi'`
2. Use the `lang` constant throughout the component for cleaner code
3. For conditional text, use the translation key that matches the condition
4. Keep placeholder text in the translation dictionary
5. Update toast messages to use translations for consistency

---

## Example: Complete CustomMode Update Pattern

```typescript
// 1. Import translation function
import { t } from '../locales/translations';

// 2. Add language to props
interface CustomModeProps {
  language: 'EN' | 'VI';
  // ... other props
}

// 3. Convert language in component
export function CustomMode({ language, ...props }: CustomModeProps) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  
  // 4. Use throughout component
  return (
    <>
      <h2>{t('customModeTitle', lang)}</h2>
      <Input placeholder={t('tripPlanPlaceholder', lang)} />
      <Button onClick={handleSave}>
        {isSaving ? t('saving', lang) : t('save', lang)}
      </Button>
      
      {/* Toast messages */}
      <button onClick={() => toast.success(t('planSaved', lang))}>
        Save
      </button>
    </>
  );
}
```

---

## 📞 Need Help?

If you need additional translation keys or want to modify existing translations, simply update the `/locales/translations.ts` file. All changes will automatically propagate throughout the app!
