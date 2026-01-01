import { Card } from "./ui/card";
import { DayPlan, Destination, Place } from "../types";
import { t } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";
import React, { useRef, useEffect, useState } from "react";
import { getPlaceById } from "../utils/serp";
interface ViewModePlacesGalleryProps {
  days: DayPlan[];
  selectedDayId: string;
  selectedPlaceId: string | null;
  onDaySelect: (dayId: string) => void;
  onPlaceSelect: (place: Destination) => void;
  language: "EN" | "VI";
}
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!src) return resolve();
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}
function PlaceName({ place, language }: { place: Destination, language: "EN" | "VI" }) {
  const [detailed, setDetailed] = useState<Place | null>(null);

  useEffect(() => {
    let mounted = true;
    getPlaceById(place.id).then((fullPlace) => {
      if (mounted) setDetailed(fullPlace);
    });
    return () => { mounted = false; };
  }, [place.id]);

  if (language === "EN") {
    return (
      <>
        {Array.isArray(detailed?.en_names)
          ? detailed?.en_names[0]
          : (detailed?.en_names || detailed?.title)}
      </>
    );
  } else {
    return (
      <>
        {Array.isArray(detailed?.vi_names)
          ? detailed?.vi_names[0]
          : (detailed?.vi_names || detailed?.title)}
      </>
    );
  }

}
export function ViewModePlacesGallery({
  days,
  selectedDayId,
  selectedPlaceId,
  onDaySelect,
  onPlaceSelect,
  language,
}: ViewModePlacesGalleryProps) {
  const lang = language.toLowerCase() as "en" | "vi";
  const { primary, light } = useThemeColors();
  const thumbnailRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Track hover and pressed states for each day chip
  const [hoveredDayId, setHoveredDayId] = useState<string | null>(null);
  const [pressedDayId, setPressedDayId] = useState<string | null>(null);

  const selectedDay = days.find((d) => d.id === selectedDayId);
  const destinations = selectedDay?.destinations || [];
  const [loadingPlaceId, setLoadingPlaceId] = useState<string | null>(null);

  // Auto-scroll to selected thumbnail when selectedPlaceId changes
  useEffect(() => {
    if (selectedPlaceId && thumbnailRefs.current[selectedPlaceId]) {
      thumbnailRefs.current[selectedPlaceId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedPlaceId]);

  // Calculate glow shadow for selected day chip
  const getGlowShadow = (dayId: string) => {
    if (selectedDayId !== dayId) return 'none';

    // Two-layer glow system matching DayChip
    const innerGlow = '0 0 28px rgba(59, 130, 246, 0.40)';
    const outerGlow = '0 0 70px rgba(59, 130, 246, 0.20)';

    return `${innerGlow}, ${outerGlow}`;
  };
  const handlePlaceSelect = async (place: Destination) => {
    setLoadingPlaceId(place.id);
    try {
      const fullPlace = await getPlaceById(place.id);
      if (fullPlace.imageUrl) {
        await preloadImage(fullPlace.imageUrl);
      }
      onPlaceSelect(fullPlace);
    } catch (e) {
      // Optionally handle error
      onPlaceSelect(place); // fallback to original
    } finally {
      setLoadingPlaceId(null);
    }
  };
  return (
    <Card
      className="shrink-0 rounded-[24px] border border-[#E5E7EB] flex flex-col"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
        paddingTop: "16px",
        paddingLeft: "28px",
        paddingRight: "28px",
        paddingBottom: "32px",
        height: "230px",
      }}
    >
      {/* Day Navigation Chips */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 mb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ overflowY: 'visible', paddingTop: '4px', paddingBottom: '4px' }}
      >
        {days.map((day) => {
          const isSelected = selectedDayId === day.id;
          const isHovered = hoveredDayId === day.id;
          const isPressed = pressedDayId === day.id;

          return (
            <button
              key={day.id}
              onClick={() => onDaySelect(day.id)}
              onMouseDown={() => setPressedDayId(day.id)}
              onMouseUp={() => setPressedDayId(null)}
              onMouseEnter={() => setHoveredDayId(day.id)}
              onMouseLeave={() => {
                setPressedDayId(null);
                setHoveredDayId(null);
              }}
              className="shrink-0 px-2 py-1.5 rounded-xl text-sm transition-all border-2"
              style={{
                backgroundColor: isSelected ? primary : "white",
                color: isSelected ? "white" : "#64748B",
                borderColor: isSelected ? primary : "#E2E8F0",
                boxShadow: getGlowShadow(day.id),
                transform: isPressed
                  ? 'scale(0.97)'
                  : (isHovered && isSelected ? 'scale(1.03)' : 'scale(1.00)'),
                transitionDuration: isSelected
                  ? (isPressed ? '120ms' : '180ms')
                  : '200ms',
                transitionTimingFunction: isSelected
                  ? (isPressed ? 'ease-out' : 'cubic-bezier(0.16, 1, 0.3, 1)')
                  : 'ease-in',
              }}
            >
              {t("day", lang)} {day.dayNumber}
            </button>
          );
        })}
      </div>

      {/* Places Thumbnails - Horizontal Scroll */}
      <div
        className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ marginBottom: "-8px", paddingBottom: "0px" }}
      >
        {destinations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            {t("noDestinationsYet", lang)}
          </div>
        ) : (
          <div className="flex gap-3 h-full">
            {destinations.map((place) => (
              <button
                key={place.id}
                onClick={() => handlePlaceSelect(place)}
                className="group flex flex-col shrink-0 transition-all duration-200 hover:scale-105"
                style={{
                  width: "160px",
                }}
                ref={(ref) => (thumbnailRefs.current[place.id] = ref)}
              >
                {/* Thumbnail Image */}
                <div
                  className="relative rounded-xl overflow-hidden border-2 transition-all duration-200"
                  style={{
                    borderColor:
                      selectedPlaceId === place.id ? primary : "#E2E8F0",
                    height: "100px",
                  }}
                >
                  <div className="absolute inset-0">
                    {place ? (
                      <img
                        src={`./assets/${place.id}.jpg`}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-4xl"
                        style={{ backgroundColor: light }}
                      >
                        📍
                      </div>
                    )}
                  </div>

                  {/* Selected Indicator */}
                  {selectedPlaceId === place.id && (
                    <div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: primary }}
                    >
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>

                {/* Place Name Below Thumbnail */}
                <div className="mt-2 px-1">
                  <p
                    className="text-gray-700 text-xs text-center transition-all duration-200"
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      WebkitLineClamp: selectedPlaceId === place.id ? 3 : 1,
                    }}
                  >
                    <PlaceName place={place} language={language} />
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}