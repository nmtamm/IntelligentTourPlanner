import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, BookOpen, CheckCircle2, Map, Route, Save, Sparkles, User, Calendar, DollarSign, MapPin, Navigation, MessageSquare, Layout } from "lucide-react";
import { t, TranslationKey } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";

interface TutorialStep {
  id: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  targetSelector: string;
  position: "top" | "bottom" | "left" | "right" | "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

interface Chapter {
  id: string;
  titleKey: TranslationKey;
  descriptionKey: string;
  icon: any;
  color: string;
  steps: TutorialStep[];
}

const getTutorialChapters = (): Chapter[] => [
  {
    id: "welcome-sidebar",
    titleKey: "chapter_welcome_sidebar",
    descriptionKey: "chapter_welcome_sidebar_desc",
    icon: Layout,
    color: "#004DB6",
    steps: [
      {
        id: "welcome",
        titleKey: "tutorial_welcome_title",
        descriptionKey: "tutorial_welcome_desc",
        targetSelector: "",
        position: "center",
      },
      {
        id: "sidebar-overview",
        titleKey: "tutorial_sidebar_overview_title",
        descriptionKey: "tutorial_sidebar_overview_desc",
        targetSelector: '[data-tutorial="sidebar"]',
        position: "right",
      },
      {
        id: "login-btn",
        titleKey: "tutorial_login_btn_title",
        descriptionKey: "tutorial_login_btn_desc",
        targetSelector: '[data-tutorial="login-btn"]',
        position: "bottom-right",
      },
      {
        id: "saved-plans-btn",
        titleKey: "tutorial_saved_plans_btn_title",
        descriptionKey: "tutorial_saved_plans_btn_desc",
        targetSelector: '[data-tutorial="saved-plans-btn"]',
        position: "bottom-right",
      },
      {
        id: "custom-mode-btn",
        titleKey: "tutorial_custom_mode_btn_title",
        descriptionKey: "tutorial_custom_mode_btn_desc",
        targetSelector: '[data-tutorial="custom-mode-btn"]',
        position: "right",
      },
      {
        id: "view-mode-btn",
        titleKey: "tutorial_view_mode_btn_title",
        descriptionKey: "tutorial_view_mode_btn_desc",
        targetSelector: '[data-tutorial="view-mode-btn"]',
        position: "right",
      },
      {
        id: "user-manual-btn",
        titleKey: "tutorial_user_manual_btn_title",
        descriptionKey: "tutorial_user_manual_btn_desc",
        targetSelector: '[data-tutorial="user-manual-btn"]',
        position: "right",
      },
      {
        id: "settings-btn",
        titleKey: "tutorial_settings_btn_title",
        descriptionKey: "tutorial_settings_btn_desc",
        targetSelector: '[data-tutorial="settings-btn"]',
        position: "top-right",
      },
    ],
  },
  {
    id: "trip-details",
    titleKey: "chapter_trip_details",
    descriptionKey: "chapter_trip_details_desc",
    icon: Calendar,
    color: "#70C573",
    steps: [
      {
        id: "trip-details-card",
        titleKey: "tutorial_trip_details_card_title",
        descriptionKey: "tutorial_trip_details_card_desc",
        targetSelector: '[data-tutorial-card="trip-details"]',
        position: "bottom",
      },
      {
        id: "day-selector",
        titleKey: "tutorial_day_selector_title",
        descriptionKey: "tutorial_day_selector_desc",
        targetSelector: '[data-tutorial="day-tabs"]',
        position: "bottom",
      },
      {
        id: "add-day-btn",
        titleKey: "tutorial_add_day_btn_title",
        descriptionKey: "tutorial_add_day_btn_desc",
        targetSelector: '[data-tutorial="add-day-btn"]',
        position: "bottom",
      },
    ],
  },
  {
    id: "day-view",
    titleKey: "chapter_day_view",
    descriptionKey: "chapter_day_view_desc",
    icon: MapPin,
    color: "#5E885D",
    steps: [
      {
        id: "day-view-card",
        titleKey: "tutorial_day_view_card_title",
        descriptionKey: "tutorial_day_view_card_desc",
        targetSelector: '[data-tutorial-card="day-view"]',
        position: "left",
      },
    ],
  },
  {
    id: "find-destination",
    titleKey: "chapter_find_destination",
    descriptionKey: "chapter_find_destination_desc",
    icon: Map,
    color: "#FF6B6B",
    steps: [
      {
        id: "find-destination-card",
        titleKey: "tutorial_find_destination_card_title",
        descriptionKey: "tutorial_find_destination_card_desc",
        targetSelector: '[data-tutorial-card="place-search"]',
        position: "right",
      },
    ],
  },
  {
    id: "chatbox",
    titleKey: "chapter_chatbox",
    descriptionKey: "chapter_chatbox_desc",
    icon: MessageSquare,
    color: "#8B5CF6",
    steps: [
      {
        id: "chatbox-card",
        titleKey: "tutorial_chatbox_card_title",
        descriptionKey: "tutorial_chatbox_card_desc",
        targetSelector: '[data-tutorial-card="chatbox"]',
        position: "left",
      },
    ],
  },
  {
    id: "map-route-guidance",
    titleKey: "chapter_map_route_guidance",
    descriptionKey: "chapter_map_route_guidance_desc",
    icon: Navigation,
    color: "#10B981",
    steps: [
      {
        id: "map-view-card",
        titleKey: "tutorial_map_view_card_title",
        descriptionKey: "tutorial_map_view_card_desc",
        targetSelector: '[data-tutorial-card="map-view"]',
        position: "right",
      },
      {
        id: "optimize-route-btn",
        titleKey: "tutorial_optimize_route_btn_title",
        descriptionKey: "tutorial_optimize_route_btn_desc",
        targetSelector: '[data-tutorial="find-optimal-route"]',
        position: "bottom",
      },
      {
        id: "map-header-switch",
        titleKey: "tutorial_map_header_switch_title",
        descriptionKey: "tutorial_map_header_switch_desc",
        targetSelector: '[data-tutorial="map-view-header"]',
        position: "bottom-right",
      },
      {
        id: "route-guidance-mode",
        titleKey: "tutorial_route_guidance_mode_title",
        descriptionKey: "tutorial_route_guidance_mode_desc",
        targetSelector: '[data-tutorial="route-list"]',
        position: "top",
      },
    ],
  },
];

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
  language: "EN" | "VI";
  currentMode: "custom" | "view";
  onModeChange: (mode: "custom" | "view") => void;
}

type ViewMode = "overview" | "tutorial";

export function UserManual({ isOpen, onClose, language, currentMode, onModeChange }: UserManualProps) {
  const lang = language.toLowerCase() as "en" | "vi";
  const { primary, secondary, accent, light } = useThemeColors();
  const chapters = getTutorialChapters();

  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [tooltipPosition, setTooltipPosition] = useState<any>(null);
  const [highlightBox, setHighlightBox] = useState<any>(null);
  const [cutoutBox, setCutoutBox] = useState<any>(null);
  const [originalMode, setOriginalMode] = useState<"custom" | "view">("custom");
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);

  const currentChapter = chapters[currentChapterIndex];
  const currentStep = currentChapter?.steps[currentStepIndex];
  const isLastStepInChapter = currentStepIndex === currentChapter?.steps.length - 1;
  const isLastChapter = currentChapterIndex === chapters.length - 1;

  // Load completed steps from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tutorial-progress");
    if (saved) {
      try {
        setCompletedSteps(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to load tutorial progress");
      }
    }
  }, []);

  // Save completed steps to localStorage
  const markStepCompleted = (stepId: string) => {
    const updated = new Set(completedSteps);
    updated.add(stepId);
    setCompletedSteps(updated);
    localStorage.setItem("tutorial-progress", JSON.stringify(Array.from(updated)));
  };

  useEffect(() => {
    if (!isOpen) {
      setViewMode("overview");
      setCurrentChapterIndex(0);
      setCurrentStepIndex(0);
      // Restore original mode when closing
      if (originalMode !== currentMode) {
        onModeChange(originalMode);
      }
    } else {
      // When manual opens, save current mode and switch to Custom mode
      setOriginalMode(currentMode);
      if (currentMode !== "custom") {
        onModeChange("custom");
      }
    }
  }, [isOpen]);

  // Auto-switch modes based on tutorial step
  useEffect(() => {
    if (!isOpen || viewMode !== "tutorial") return;

    const currentChapter = chapters[currentChapterIndex];
    const isMapChapter = currentChapter.id === "map-route-guidance";

    // Switch to View mode for Chapter 6 (steps 15-18)
    if (isMapChapter) {
      if (currentMode !== "view") {
        onModeChange("view");
        setIsSwitchingMode(true);
      }
    } else {
      // Switch to Custom mode for Chapters 1-5 (steps 1-14)
      if (currentMode !== "custom") {
        onModeChange("custom");
        setIsSwitchingMode(true);
      }
    }
  }, [isOpen, viewMode, currentChapterIndex, currentStepIndex, currentMode]);

  // Calculate position for the tooltip
  const getTooltipPosition = () => {
    if (!currentStep?.targetSelector) {
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10002,
      };
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (!element) {
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10002,
      };
    }

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    switch (currentStep.position) {
      case "top":
        return {
          position: "absolute" as const,
          top: `${rect.top + scrollTop - 20}px`,
          left: `${rect.left + scrollLeft + rect.width / 2}px`,
          transform: "translate(-50%, -100%)",
          zIndex: 10002,
        };
      case "bottom":
        return {
          position: "absolute" as const,
          top: `${rect.bottom + scrollTop + 20}px`,
          left: `${rect.left + scrollLeft + rect.width / 2}px`,
          transform: "translateX(-50%)",
          zIndex: 10002,
        };
      case "left":
        return {
          position: "absolute" as const,
          top: `${rect.top + scrollTop + rect.height / 2}px`,
          left: `${rect.left + scrollLeft - 20}px`,
          transform: "translate(-100%, -50%)",
          zIndex: 10002,
        };
      case "right":
        return {
          position: "absolute" as const,
          top: `${rect.top + scrollTop + rect.height / 2}px`,
          left: `${rect.right + scrollLeft + 20}px`,
          transform: "translateY(-50%)",
          zIndex: 10002,
        };
      case "top-left":
        return {
          position: "absolute" as const,
          top: `${rect.top + scrollTop - 20}px`,
          left: `${rect.left + scrollLeft}px`,
          transform: "translate(-100%, -100%)",
          zIndex: 10002,
        };
      case "top-right":
        return {
          position: "absolute" as const,
          top: `${rect.top + scrollTop - 20}px`,
          left: `${rect.right + scrollLeft}px`,
          transform: "translate(0%, -100%)",
          zIndex: 10002,
        };
      case "bottom-left":
        return {
          position: "absolute" as const,
          top: `${rect.bottom + scrollTop + 20}px`,
          left: `${rect.left + scrollLeft}px`,
          transform: "translate(-100%, 0%)",
          zIndex: 10002,
        };
      case "bottom-right":
        return {
          position: "absolute" as const,
          top: `${rect.bottom + scrollTop + 20}px`,
          left: `${rect.right + scrollLeft}px`,
          transform: "translate(0%, 0%)",
          zIndex: 10002,
        };
      default:
        return {
          position: "fixed" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10002,
        };
    }
  };

  const getHighlightStyle = () => {
    if (!currentStep?.targetSelector) return null;

    const element = document.querySelector(currentStep.targetSelector);
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

  const getCutoutStyle = () => {
    if (!currentStep?.targetSelector) return null;

    const element = document.querySelector(currentStep.targetSelector);
    if (!element) return null;

    const shouldSpanCard =
      currentStep.id === "add-destination" ||
      currentStep.id === "add-cost-item" ||
      currentStep.id === "map-view";

    if (shouldSpanCard) {
      const cardElement = element.closest("[data-tutorial-card]");
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

  // Update positions
  useEffect(() => {
    if (!isOpen || viewMode !== "tutorial") return;

    // If we're switching mode, wait before updating positions
    if (isSwitchingMode) {
      const timer = setTimeout(() => {
        setIsSwitchingMode(false);
      }, 400); // Wait for mode switch animation
      return () => clearTimeout(timer);
    }

    const updatePositions = () => {
      setTooltipPosition(getTooltipPosition());
      setHighlightBox(getHighlightStyle());
      setCutoutBox(getCutoutStyle());
    };

    updatePositions();

    if (currentStep?.targetSelector) {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    }

    window.addEventListener("scroll", updatePositions, true);
    window.addEventListener("resize", updatePositions);

    return () => {
      window.removeEventListener("scroll", updatePositions, true);
      window.removeEventListener("resize", updatePositions);
    };
  }, [isOpen, viewMode, currentChapterIndex, currentStepIndex, isSwitchingMode]);

  if (!isOpen) return null;

  const handleNext = () => {
    // Mark current step as completed
    if (currentStep) {
      markStepCompleted(currentStep.id);
    }

    // If we're on the last step, restore original mode before moving to overview
    if (isLastStepInChapter && isLastChapter) {
      // Restore original mode
      if (originalMode !== currentMode && currentMode === "view") {
        onModeChange(originalMode);
      }
      // Completed all chapters
      setViewMode("overview");
    } else if (isLastStepInChapter) {
      // Move to next chapter
      setCurrentChapterIndex(currentChapterIndex + 1);
      setCurrentStepIndex(0);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      setCurrentStepIndex(chapters[currentChapterIndex - 1].steps.length - 1);
    }
  };

  const handleStartChapter = (chapterIndex: number) => {
    setCurrentChapterIndex(chapterIndex);
    setCurrentStepIndex(0);
    setViewMode("tutorial");
  };

  const handleBackToOverview = () => {
    // Restore original mode when going back to overview
    if (originalMode !== currentMode) {
      onModeChange(originalMode);
    }
    setViewMode("overview");
  };

  const getChapterProgress = (chapter: Chapter) => {
    const completed = chapter.steps.filter(step => completedSteps.has(step.id)).length;
    return (completed / chapter.steps.length) * 100;
  };

  const getTotalProgress = () => {
    const totalSteps = chapters.reduce((sum, ch) => sum + ch.steps.length, 0);
    return (completedSteps.size / totalSteps) * 100;
  };

  // Overview Mode
  if (viewMode === "overview") {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: "fadeInScale 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div
            className="p-6 border-b relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
            }}
          >
            {/* Decorative elements */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
              style={{
                background: `radial-gradient(circle, ${light} 0%, transparent 70%)`,
                transform: "translate(30%, -30%)",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-2xl mb-1">
                      {t("userManual", lang)}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {t("learnHowToUse", lang)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-white/20"
                  style={{ color: "white" }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Overall Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90 text-sm">
                    {t("overallProgress", lang)}
                  </span>
                  <span className="text-white font-medium">
                    {Math.min(100, Math.round(getTotalProgress()))}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${getTotalProgress()}%`,
                      background: light,
                      boxShadow: `0 0 12px ${light}`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chapters Grid */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chapters.map((chapter, index) => {
                const Icon = chapter.icon;
                const progress = getChapterProgress(chapter);
                const isCompleted = progress === 100;

                return (
                  <button
                    key={chapter.id}
                    onClick={() => handleStartChapter(index)}
                    className="group relative p-6 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden"
                    style={{
                      borderColor: isCompleted ? secondary : "#E5E7EB",
                      background: isCompleted
                        ? `linear-gradient(135deg, ${secondary}10 0%, ${accent}05 100%)`
                        : "white",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                      e.currentTarget.style.boxShadow = `0 12px 24px ${primary}20`;
                      e.currentTarget.style.borderColor = primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                      e.currentTarget.style.borderColor = isCompleted ? secondary : "#E5E7EB";
                    }}
                  >
                    {/* Shimmer effect */}
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                      style={{
                        background: `linear-gradient(135deg, ${primary}08 0%, transparent 100%)`,
                        transition: "opacity 0.4s ease-in-out",
                      }}
                    />

                    <div className="relative z-10">
                      {/* Icon and Title */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-3 rounded-lg transition-all duration-300 group-hover:scale-110"
                            style={{
                              background: isCompleted
                                ? `linear-gradient(135deg, ${secondary} 0%, ${accent} 100%)`
                                : `${primary}15`,
                            }}
                          >
                            <Icon
                              className="w-6 h-6"
                              style={{
                                color: isCompleted ? "white" : primary,
                              }}
                            />
                          </div>
                          <div>
                            <h3
                              className="mb-1 transition-colors duration-200"
                              style={{
                                color: isCompleted ? secondary : "#374151",
                              }}
                            >
                              {t(chapter.titleKey, lang)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {chapter.steps.length} {t("steps", lang)}
                            </p>
                          </div>
                        </div>

                        {/* Completion Badge */}
                        {isCompleted && (
                          <div
                            className="p-2 rounded-full"
                            style={{
                              background: `${secondary}20`,
                            }}
                          >
                            <CheckCircle2
                              className="w-5 h-5"
                              style={{ color: secondary }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{Math.round(progress)}% {t("complete", lang)}</span>
                          <span>
                            {chapter.steps.filter(s => completedSteps.has(s.id)).length}/
                            {chapter.steps.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                              background: isCompleted
                                ? `linear-gradient(90deg, ${secondary} 0%, ${accent} 100%)`
                                : primary,
                            }}
                          />
                        </div>
                      </div>

                      {/* Start/Continue Button */}
                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className="text-sm font-medium transition-colors duration-200"
                          style={{
                            color: primary,
                          }}
                        >
                          {progress > 0 && progress < 100
                            ? t("continue", lang)
                            : progress === 100
                              ? t("review", lang)
                              : t("start", lang)}
                        </span>
                        <ChevronRight
                          className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                          style={{ color: primary }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tutorial Mode
  const totalStepsInChapter = currentChapter.steps.length;
  const currentStepNumber = chapters
    .slice(0, currentChapterIndex)
    .reduce((sum, ch) => sum + ch.steps.length, 0) + currentStepIndex + 1;
  const totalSteps = chapters.reduce((sum, ch) => sum + ch.steps.length, 0);

  return (
    <>
      {/* Backdrop with cutout */}
      <div
        className="fixed inset-0 z-[9999]"
        style={{
          pointerEvents: "all",
          cursor: "not-allowed",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          className="w-full h-full pointer-events-none"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <mask id="tutorial-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {cutoutBox && (
                <rect
                  x={
                    cutoutBox.left -
                    (window.pageXOffset || document.documentElement.scrollLeft)
                  }
                  y={
                    cutoutBox.top -
                    (window.pageYOffset || document.documentElement.scrollTop)
                  }
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

      {/* Highlight box border with animation */}
      {highlightBox && (
        <div
          style={{
            position: "absolute",
            top: `${highlightBox.top}px`,
            left: `${highlightBox.left}px`,
            width: `${highlightBox.width}px`,
            height: `${highlightBox.height}px`,
            border: `3px solid ${secondary}`,
            borderRadius: "12px",
            pointerEvents: "none",
            zIndex: 10001,
            boxShadow: `0 0 0 4px ${secondary}40, 0 0 20px ${secondary}60`,
            animation: "pulse-border 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        style={tooltipPosition}
        className="bg-white rounded-xl shadow-2xl max-w-md overflow-hidden"
      >
        <div
          className="p-4"
          style={{
            background: `linear-gradient(135deg, ${primary}10 0%, ${secondary}05 100%)`,
            borderBottom: `2px solid ${secondary}`,
          }}
        >
          {/* Chapter Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: primary,
                color: "white",
              }}
            >
              {t(currentChapter.titleKey, lang)}
            </div>
            <div className="text-xs text-gray-500">
              {currentStepIndex + 1}/{totalStepsInChapter}
            </div>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                className="mb-2"
                style={{ color: primary }}
              >
                {t(currentStep.titleKey, lang)}
              </h3>
              <p className="text-gray-700 text-sm">
                {t(currentStep.descriptionKey, lang)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {t("step", lang)} {currentStepNumber} {t("of", lang)} {totalSteps}
              </span>
              <span>{Math.round((currentStepNumber / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(currentStepNumber / totalSteps) * 100}%`,
                  background: `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`,
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleBackToOverview}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color: "#6B7280",
                background: "#F3F4F6",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#E5E7EB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#F3F4F6";
              }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-2 flex-1 justify-end">
              {(currentStepIndex > 0 || currentChapterIndex > 0) && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                  style={{
                    color: primary,
                    border: `1.5px solid ${primary}`,
                    background: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${primary}10`;
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("previous", lang)}
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${secondary} 0%, ${accent} 100%)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = `0 8px 16px ${secondary}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {isLastStepInChapter && isLastChapter
                  ? t("finish", lang)
                  : t("next", lang)}
                {(!isLastStepInChapter || !isLastChapter) && (
                  <ChevronRight className="w-4 h-4" />
                )}
                {isLastStepInChapter && isLastChapter && (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}