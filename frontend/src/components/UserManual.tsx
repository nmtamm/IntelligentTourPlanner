import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, ChevronRight, SkipForward } from 'lucide-react';
import { t } from '../utils/translations';
import { TranslationKey } from '../utils/translations';

interface TutorialStep {
  id: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  autoAction?: boolean; // If true, clicking Next will trigger an automatic action
}

const getTutorialSteps = (): TutorialStep[] => [
  {
    id: "welcome",
    titleKey: "tutorial_welcome_title",
    descriptionKey: "tutorial_welcome_desc",
    targetSelector: "",
    position: "center",
  },
  {
    id: "login",
    titleKey: "tutorial_login_title",
    descriptionKey: "tutorial_login_desc",
    targetSelector: '[data-tutorial="login"]',
    position: "bottom",
  },
  {
    id: "language",
    titleKey: "tutorial_language_title",
    descriptionKey: "tutorial_language_desc",
    targetSelector: '[data-tutorial="language"]',
    position: "bottom",
  },
  {
    id: "currency",
    titleKey: "tutorial_currency_title",
    descriptionKey: "tutorial_currency_desc",
    targetSelector: '[data-tutorial="currency"]',
    position: "bottom",
  },
  {
    id: "generate-plan",
    titleKey: "tutorial_generate_title",
    descriptionKey: "tutorial_generate_desc",
    targetSelector: '[data-tutorial="generate-plan"]',
    position: "bottom",
  },
  {
    id: "trip-name",
    titleKey: "tutorial_tripname_title",
    descriptionKey: "tutorial_tripname_desc",
    targetSelector: '[data-tutorial="trip-name"]',
    position: "bottom",
  },
  {
    id: "members",
    titleKey: "tutorial_members_title",
    descriptionKey: "tutorial_members_desc",
    targetSelector: '[data-tutorial="members"]',
    position: "bottom",
  },
  {
    id: "start-date",
    titleKey: "tutorial_startdate_title",
    descriptionKey: "tutorial_startdate_desc",
    targetSelector: '[data-tutorial="start-date"]',
    position: "bottom",
  },
  {
    id: "end-date",
    titleKey: "tutorial_enddate_title",
    descriptionKey: "tutorial_enddate_desc",
    targetSelector: '[data-tutorial="end-date"]',
    position: "bottom",
  },
  {
    id: "day-tabs",
    titleKey: "tutorial_daytabs_title",
    descriptionKey: "tutorial_daytabs_desc",
    targetSelector: '[data-tutorial="day-tabs"]',
    position: "bottom",
  },
  {
    id: "view-all-days",
    titleKey: "tutorial_viewalldays_title",
    descriptionKey: "tutorial_viewalldays_desc",
    targetSelector: '[data-tutorial="view-all-days"]',
    position: "bottom",
  },
  {
    id: "add-destination",
    titleKey: "tutorial_adddest_title",
    descriptionKey: "tutorial_adddest_desc",
    targetSelector: '[data-tutorial="add-destination"]',
    position: "bottom",
  },
  {
    id: "add-cost-item",
    titleKey: "tutorial_addcost_title",
    descriptionKey: "tutorial_addcost_desc",
    targetSelector: '[data-tutorial="add-cost-item"]',
    position: "bottom",
  },
  {
    id: "auto-estimate",
    titleKey: "tutorial_autoestimate_title",
    descriptionKey: "tutorial_autoestimate_desc",
    targetSelector: '[data-tutorial="auto-estimate"]',
    position: "bottom",
  },
  {
    id: "optimize-route",
    titleKey: "tutorial_optimize_title",
    descriptionKey: "tutorial_optimize_desc",
    targetSelector: '[data-tutorial="optimize-route"]',
    position: "bottom",
  },
  {
    id: "map-view",
    titleKey: "tutorial_mapview_title",
    descriptionKey: "tutorial_mapview_desc",
    targetSelector: '[data-tutorial="map-view"]',
    position: "top",
  },
  {
    id: "route-list",
    titleKey: "tutorial_routelist_title",
    descriptionKey: "tutorial_routelist_desc",
    targetSelector: '[data-tutorial="route-list"]',
    position: "bottom",
  },
  {
    id: "route-guidance",
    titleKey: "tutorial_routeguidance_title",
    descriptionKey: "tutorial_routeguidance_desc",
    targetSelector: '[data-tutorial="route-guidance"]',
    position: "center",
  },
  {
    id: "complete",
    titleKey: "tutorial_complete_title",
    descriptionKey: "tutorial_complete_desc",
    targetSelector: "",
    position: "center",
  },
];

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoAction?: (stepId: string) => void;
  language: "EN" | "VI";
}

export function UserManual({ isOpen, onClose, onAutoAction, language }: UserManualProps) {
  const lang = language.toLowerCase() as "en" | "vi";
  const tutorialSteps = getTutorialSteps();
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState<any>(null);
  const [highlightBox, setHighlightBox] = useState<any>(null);
  const [cutoutBox, setCutoutBox] = useState<any>(null);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Calculate position for the tooltip
  const getTooltipPosition = () => {
    if (!step.targetSelector) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10002,
      };
    }

    const element = document.querySelector(step.targetSelector);
    if (!element) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10002,
      };
    }

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    switch (step.position) {
      case 'top':
        return {
          position: 'absolute' as const,
          top: `${rect.top + scrollTop - 20}px`,
          left: `${rect.left + scrollLeft + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
          zIndex: 10002,
        };
      case 'bottom':
        return {
          position: 'absolute' as const,
          top: `${rect.bottom + scrollTop + 20}px`,
          left: `${rect.left + scrollLeft + rect.width / 2}px`,
          transform: 'translateX(-50%)',
          zIndex: 10002,
        };
      case 'left':
        return {
          position: 'absolute' as const,
          top: `${rect.top + scrollTop + rect.height / 2}px`,
          left: `${rect.left + scrollLeft - 20}px`,
          transform: 'translate(-100%, -50%)',
          zIndex: 10002,
        };
      case 'right':
        return {
          position: 'absolute' as const,
          top: `${rect.top + scrollTop + rect.height / 2}px`,
          left: `${rect.right + scrollLeft + 20}px`,
          transform: 'translateY(-50%)',
          zIndex: 10002,
        };
      default:
        return {
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10002,
        };
    }
  };

  const getHighlightStyle = () => {
    if (!step.targetSelector) return null;

    const element = document.querySelector(step.targetSelector);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
      top: rect.top + scrollTop - 8,
      left: rect.left + scrollLeft - 8,
      width: rect.width + 16,
      height: rect.height + 16,
    };
  };

  // Get cutout area (can span to parent Card if needed)
  const getCutoutStyle = () => {
    if (!step.targetSelector) return null;

    const element = document.querySelector(step.targetSelector);
    if (!element) return null;

    // Check if this step should span the cutout to the parent Card
    const shouldSpanCard = step.id === 'add-destination' || step.id === 'add-cost-item' || step.id === 'map-view' || step.id === 'route-list';
    
    if (shouldSpanCard) {
      // Find the parent Card element
      const cardElement = element.closest('[data-tutorial-card]');
      if (cardElement) {
        const cardRect = cardElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        return {
          top: cardRect.top + scrollTop - 8,
          left: cardRect.left + scrollLeft - 8,
          width: cardRect.width + 16,
          height: cardRect.height + 16,
        };
      }
    }

    // Default: same as highlight
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
      top: rect.top + scrollTop - 8,
      left: rect.left + scrollLeft - 8,
      width: rect.width + 16,
      height: rect.height + 16,
    };
  };

  // Update positions whenever step changes or on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const updatePositions = () => {
      setTimeout(() => {
      setTooltipPosition(getTooltipPosition());
      setHighlightBox(getHighlightStyle());
      setCutoutBox(getCutoutStyle());
    }, 30);
    };

    // Initial update
    updatePositions();
    
    // Scroll element into view if it exists and targetSelector is not empty
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }

    // Add event listeners for scroll and resize
    window.addEventListener('scroll', updatePositions, true);
    window.addEventListener('resize', updatePositions);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', updatePositions, true);
      window.removeEventListener('resize', updatePositions);
    };
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleNext = () => {
    // If this step has an auto-action, trigger it
    if (step.autoAction && onAutoAction) {
      onAutoAction(step.id);
    }

    // Move to next step or close
    if (isLastStep) {
      setCurrentStep(0);
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <>
      {/* Backdrop with cutout - blocks all interactions */}
      <div
        className="fixed inset-0 z-[9999]"
        style={{ 
          pointerEvents: 'all',
          cursor: 'not-allowed'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          className="w-full h-full pointer-events-none"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            <mask id="tutorial-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {cutoutBox && (
                <rect
                  x={cutoutBox.left - (window.pageXOffset || document.documentElement.scrollLeft)}
                  y={cutoutBox.top - (window.pageYOffset || document.documentElement.scrollTop)}
                  width={cutoutBox.width}
                  height={cutoutBox.height}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            </filter>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#tutorial-mask)"
            filter="url(#blur)"
          />
        </svg>
      </div>

      {/* Highlight box border */}
      {highlightBox && (
        <div
          style={{
            position: 'absolute',
            top: `${highlightBox.top}px`,
            left: `${highlightBox.left}px`,
            width: `${highlightBox.width}px`,
            height: `${highlightBox.height}px`,
            border: '3px solid #70C573',
            borderRadius: '12px',
            pointerEvents: 'none',
            zIndex: 10001,
            boxShadow: '0 0 0 4px rgba(112, 197, 115, 0.2), 0 0 20px rgba(112, 197, 115, 0.4)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        style={tooltipPosition}
        className="bg-white rounded-lg shadow-2xl p-6 max-w-md border-2 border-[#70C573]"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-[#004DB6] mb-2">{t(step.titleKey, lang)}</h3>
              <p className="text-gray-700 text-sm">{t(step.descriptionKey, lang)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {t("tutorialStep", lang)} {currentStep + 1} {t("of", lang)} {tutorialSteps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#70C573] h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex items-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              {t("skipTutorial", lang)}
            </Button>
            <Button
              onClick={handleNext}
              className="bg-[#70C573] hover:bg-[#5E885D] text-white flex items-center gap-2"
            >
              {isLastStep ? t("finish", lang) : t("next", lang)}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}