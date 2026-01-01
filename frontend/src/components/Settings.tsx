import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Settings as SettingsIcon, X, Globe, DollarSign, Palette, Check } from 'lucide-react';
import { useTheme, THEMES, ThemeType } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeColors';

interface SettingsProps {
  currency: 'USD' | 'VND';
  language: 'EN' | 'VI';
  onCurrencyToggle: () => void;
  onLanguageToggle: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  asModal?: boolean;
}

export function Settings({
  currency,
  language,
  onCurrencyToggle,
  onLanguageToggle,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  asModal = false,
}: SettingsProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { themeType, setThemeType, currentTheme } = useTheme();
  const { primary, secondary, accent, light, primaryDark } = useThemeColors();
  
  // State for bounce animations
  const [currencyUSDHovered, setCurrencyUSDHovered] = useState(false);
  const [currencyVNDHovered, setCurrencyVNDHovered] = useState(false);
  const [languageENHovered, setLanguageENHovered] = useState(false);
  const [languageVIHovered, setLanguageVIHovered] = useState(false);
  
  const [currencyUSDPressed, setCurrencyUSDPressed] = useState(false);
  const [currencyVNDPressed, setCurrencyVNDPressed] = useState(false);
  const [languageENPressed, setLanguageENPressed] = useState(false);
  const [languageVIPressed, setLanguageVIPressed] = useState(false);
  
  const isOpen = asModal ? externalIsOpen : internalIsOpen;
  const setIsOpen = asModal ? (value: boolean) => {
    if (!value && externalOnClose) externalOnClose();
  } : setInternalIsOpen;

  // Get available theme options (exclude 'custom' for now - will be added in future)
  const availableThemes: ThemeType[] = ['vietnamLotus', 'classicBlue', 'ocean', 'forest', 'sunset', 'lavender'];

  // Modal version (from sidebar)
  if (asModal) {
    return (
      <>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Settings Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <Card 
                className="w-full max-w-md p-6 shadow-2xl border-2 bg-white"
                style={{ borderColor: `${primary}33` }}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b">
                    <h3 className="text-xl font-semibold" style={{ color: primary }}>
                      {language === 'EN' ? 'Settings' : 'Cài đặt'}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Currency Setting */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">
                      {language === 'EN' ? 'Currency' : 'Tiền tệ'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (currency !== 'USD') onCurrencyToggle();
                        }}
                        onMouseEnter={() => setCurrencyUSDHovered(true)}
                        onMouseLeave={() => {
                          setCurrencyUSDHovered(false);
                          setCurrencyUSDPressed(false);
                        }}
                        onMouseDown={() => setCurrencyUSDPressed(true)}
                        onMouseUp={() => setCurrencyUSDPressed(false)}
                        className="flex-1 rounded-md flex items-center justify-center gap-1 py-2 px-4 transition-all"
                        style={{
                          backgroundColor: currency === 'USD' ? primary : `${light}40`,
                          color: currency === 'USD' ? 'white' : '#374151',
                          border: currency === 'USD' ? 'none' : '1px solid #E5E7EB',
                          cursor: 'pointer',
                          transform: currencyUSDPressed 
                            ? 'scale(0.95)' 
                            : (currencyUSDHovered ? 'scale(1.05)' : 'scale(1.00)'),
                          boxShadow: currencyUSDPressed
                            ? '0 2px 8px rgba(0,77,182,0.15)'
                            : (currencyUSDHovered ? '0 4px 16px rgba(0,77,182,0.25)' : '0 2px 8px rgba(0,0,0,0.05)'),
                          transitionDuration: currencyUSDPressed ? '100ms' : '200ms',
                          transitionTimingFunction: currencyUSDPressed ? 'ease-out' : 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">USD</span>
                      </button>
                      <button
                        onClick={() => {
                          if (currency !== 'VND') onCurrencyToggle();
                        }}
                        onMouseEnter={() => setCurrencyVNDHovered(true)}
                        onMouseLeave={() => {
                          setCurrencyVNDHovered(false);
                          setCurrencyVNDPressed(false);
                        }}
                        onMouseDown={() => setCurrencyVNDPressed(true)}
                        onMouseUp={() => setCurrencyVNDPressed(false)}
                        className="flex-1 rounded-md flex items-center justify-center gap-1 py-2 px-4 transition-all"
                        style={{
                          backgroundColor: currency === 'VND' ? primary : `${light}40`,
                          color: currency === 'VND' ? 'white' : '#374151',
                          border: currency === 'VND' ? 'none' : '1px solid #E5E7EB',
                          cursor: 'pointer',
                          transform: currencyVNDPressed 
                            ? 'scale(0.95)' 
                            : (currencyVNDHovered ? 'scale(1.05)' : 'scale(1.00)'),
                          boxShadow: currencyVNDPressed
                            ? '0 2px 8px rgba(0,77,182,0.15)'
                            : (currencyVNDHovered ? '0 4px 16px rgba(0,77,182,0.25)' : '0 2px 8px rgba(0,0,0,0.05)'),
                          transitionDuration: currencyVNDPressed ? '100ms' : '200ms',
                          transitionTimingFunction: currencyVNDPressed ? 'ease-out' : 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        <span>₫</span>
                        <span className="font-medium">VND</span>
                      </button>
                    </div>
                  </div>

                  {/* Language Setting */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">
                      {language === 'EN' ? 'Language' : 'Ngôn ngữ'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (language !== 'EN') onLanguageToggle();
                        }}
                        onMouseEnter={() => setLanguageENHovered(true)}
                        onMouseLeave={() => {
                          setLanguageENHovered(false);
                          setLanguageENPressed(false);
                        }}
                        onMouseDown={() => setLanguageENPressed(true)}
                        onMouseUp={() => setLanguageENPressed(false)}
                        className="flex-1 rounded-md flex items-center justify-center gap-1 py-2 px-4 transition-all"
                        style={{
                          backgroundColor: language === 'EN' ? primary : `${light}40`,
                          color: language === 'EN' ? 'white' : '#374151',
                          border: language === 'EN' ? 'none' : '1px solid #E5E7EB',
                          cursor: 'pointer',
                          transform: languageENPressed 
                            ? 'scale(0.95)' 
                            : (languageENHovered ? 'scale(1.05)' : 'scale(1.00)'),
                          boxShadow: languageENPressed
                            ? '0 2px 8px rgba(0,77,182,0.15)'
                            : (languageENHovered ? '0 4px 16px rgba(0,77,182,0.25)' : '0 2px 8px rgba(0,0,0,0.05)'),
                          transitionDuration: languageENPressed ? '100ms' : '200ms',
                          transitionTimingFunction: languageENPressed ? 'ease-out' : 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">English</span>
                      </button>
                      <button
                        onClick={() => {
                          if (language !== 'VI') onLanguageToggle();
                        }}
                        onMouseEnter={() => setLanguageVIHovered(true)}
                        onMouseLeave={() => {
                          setLanguageVIHovered(false);
                          setLanguageVIPressed(false);
                        }}
                        onMouseDown={() => setLanguageVIPressed(true)}
                        onMouseUp={() => setLanguageVIPressed(false)}
                        className="flex-1 rounded-md flex items-center justify-center gap-1 py-2 px-4 transition-all"
                        style={{
                          backgroundColor: language === 'VI' ? primary : `${light}40`,
                          color: language === 'VI' ? 'white' : '#374151',
                          border: language === 'VI' ? 'none' : '1px solid #E5E7EB',
                          cursor: 'pointer',
                          transform: languageVIPressed 
                            ? 'scale(0.95)' 
                            : (languageVIHovered ? 'scale(1.05)' : 'scale(1.00)'),
                          boxShadow: languageVIPressed
                            ? '0 2px 8px rgba(0,77,182,0.15)'
                            : (languageVIHovered ? '0 4px 16px rgba(0,77,182,0.25)' : '0 2px 8px rgba(0,0,0,0.05)'),
                          transitionDuration: languageVIPressed ? '100ms' : '200ms',
                          transitionTimingFunction: languageVIPressed ? 'ease-out' : 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">Tiếng Việt</span>
                      </button>
                    </div>
                  </div>

                  {/* Theme Setting */}
                  <div className="space-y-3">
                    <label className="text-sm text-gray-600 font-medium flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      {language === 'EN' ? 'Color Theme' : 'Chủ đề màu sắc'}
                    </label>
                    
                    {/* Theme Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {availableThemes.map((theme) => {
                        const themeConfig = THEMES[theme];
                        const isSelected = themeType === theme;
                        
                        return (
                          <button
                            key={theme}
                            onClick={() => setThemeType(theme)}
                            style={isSelected ? { 
                              borderColor: primary,
                              backgroundColor: `${primary}0D` // 5% opacity
                            } : {}}
                            className={`
                              relative p-3 rounded-lg border-2 transition-all duration-200
                              hover:scale-105 hover:shadow-md
                              ${isSelected 
                                ? '' 
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            {/* Color Preview Circles */}
                            <div className="flex gap-1 mb-2 flex-wrap">
                              <div 
                                className="w-5 h-5 rounded-full border border-gray-200"
                                style={{ backgroundColor: themeConfig.colors.primary }}
                              />
                              <div 
                                className="w-5 h-5 rounded-full border border-gray-200"
                                style={{ backgroundColor: themeConfig.colors.secondary }}
                              />
                              <div 
                                className="w-5 h-5 rounded-full border border-gray-200"
                                style={{ backgroundColor: themeConfig.colors.accent }}
                              />
                              <div 
                                className="w-5 h-5 rounded-full border border-gray-200"
                                style={{ backgroundColor: themeConfig.colors.light }}
                              />
                              <div 
                                className="w-5 h-5 rounded-full border border-gray-200"
                                style={{ backgroundColor: themeConfig.colors.highlight }}
                              />
                            </div>
                            
                            {/* Theme Name */}
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900">
                                {themeConfig.name[language.toLowerCase() as 'en' | 'vi']}
                              </p>
                            </div>

                            {/* Selected Check Mark */}
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <div 
                                  className="w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: primary }}
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Coming Soon: Custom Theme */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-xs text-gray-500 text-center">
                        <Palette className="w-3 h-3 inline mr-1" />
                        {language === 'EN' 
                          ? 'Custom theme editor coming soon' 
                          : 'Trình chỉnh sửa chủ đề tùy chỉnh sẽ có sớm'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Info Text */}
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      {language === 'EN'
                        ? 'Changes will apply immediately to all components'
                        : 'Thay đổi sẽ được áp dụng ngay lập tức cho tất cả các thành phần'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </>
    );
  }

  // Dropdown version (from header)
  return (
    <div className="relative">
      {/* Settings Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={isOpen ? 'bg-[#DAF9D8]' : ''}
        data-tutorial="settings"
      >
        <SettingsIcon className="w-4 h-4 mr-2" />
        {language === 'EN' ? 'Settings' : 'Cài đặt'}
      </Button>

      {/* Settings Card Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Settings Card */}
          <Card className="absolute right-0 top-full mt-2 w-80 p-4 shadow-xl z-50 border-2 border-[#004DB6]/20">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="text-[#004DB6]">
                  {language === 'EN' ? 'Settings' : 'Cài đặt'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Currency Setting */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">
                  {language === 'EN' ? 'Currency' : 'Tiền tệ'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={currency === 'USD' ? 'default' : 'outline'}
                    className={`flex-1 ${
                      currency === 'USD'
                        ? 'bg-[#004DB6] hover:bg-[#003d8f] text-white'
                        : 'hover:bg-[#DAF9D8]'
                    }`}
                    onClick={() => {
                      if (currency !== 'USD') onCurrencyToggle();
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    USD
                  </Button>
                  <Button
                    variant={currency === 'VND' ? 'default' : 'outline'}
                    className={`flex-1 ${
                      currency === 'VND'
                        ? 'bg-[#004DB6] hover:bg-[#003d8f] text-white'
                        : 'hover:bg-[#DAF9D8]'
                    }`}
                    onClick={() => {
                      if (currency !== 'VND') onCurrencyToggle();
                    }}
                  >
                    <span className="mr-1">₫</span>
                    VND
                  </Button>
                </div>
              </div>

              {/* Language Setting */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">
                  {language === 'EN' ? 'Language' : 'Ngôn ngữ'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={language === 'EN' ? 'default' : 'outline'}
                    className={`flex-1 ${
                      language === 'EN'
                        ? 'bg-[#004DB6] hover:bg-[#003d8f] text-white'
                        : 'hover:bg-[#DAF9D8]'
                    }`}
                    onClick={() => {
                      if (language !== 'EN') onLanguageToggle();
                    }}
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    English
                  </Button>
                  <Button
                    variant={language === 'VI' ? 'default' : 'outline'}
                    className={`flex-1 ${
                      language === 'VI'
                        ? 'bg-[#004DB6] hover:bg-[#003d8f] text-white'
                        : 'hover:bg-[#DAF9D8]'
                    }`}
                    onClick={() => {
                      if (language !== 'VI') onLanguageToggle();
                    }}
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Tiếng Việt
                  </Button>
                </div>
              </div>

              {/* Theme Preview */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  {language === 'EN' ? 'Color Theme' : 'Chủ đề màu sắc'}
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-900">
                      {currentTheme.name[language.toLowerCase() as 'en' | 'vi']}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: primary }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: secondary }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: accent }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {language === 'EN' 
                      ? 'Open Settings to change theme' 
                      : 'Mở Cài đặt để thay đổi chủ đề'
                    }
                  </p>
                </div>
              </div>

              {/* Info Text */}
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 text-center">
                  {language === 'EN'
                    ? 'Changes will apply immediately to all components'
                    : 'Thay đổi sẽ được áp dụng ngay lập tức cho tất cả các thành phần'}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}