import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Search, Loader2, MapPin, Star, Plus, MapPinPlus } from "lucide-react";
import { Destination, Place } from "../types";
import { t } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";
import { PlaceDetailsModal } from "./PlaceDetailsModal";
import { handleSearch, getPlaceById, fetchNearbyPlaces } from "../utils/serp";
import { fetchUniqueTopTypes } from "../utils/serp";
import { mapPlaceToDestination } from "../utils/serp";
interface PlaceSearchViewProps {
  onAddDestination: (place: Destination) => Promise<void>;
  language: "EN" | "VI";
  selectedDayId: string;
  currency: 'USD' | 'VND';
  onCurrencyToggle: () => void;
  AIMatches: Destination[] | null;
  onAIMatchesReset?: () => void,
  userLocation?: { latitude: number; longitude: number } | null;
  city?: string;
  cityCoordinates?: { latitude: number; longitude: number };
  shouldPopUp?: boolean;
  onClosePopUp?: () => void;
  currentDayNumber?: number;
}
export function PlaceSearchView({
  onAddDestination,
  language,
  selectedDayId,
  currency,
  onCurrencyToggle,
  AIMatches,
  onAIMatchesReset,
  userLocation,
  city,
  cityCoordinates,
  shouldPopUp = false,
  onClosePopUp,
  currentDayNumber,
}: PlaceSearchViewProps) {
  const lang = language.toLowerCase() as "en" | "vi";
  const { primary, secondary, light } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Destination | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [filterTypes, setFilterTypes] = useState<any[]>([]);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [detailedDestination, setDetailedDestination] = useState<Place | null>(null);
  const onSearchInputChange = async (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setIsSearching(true);
      const results = await handleSearch(value);
      const fullPlaces = await Promise.all(
        results.map(async (place: any) => {
          const fullPlace = await getPlaceById(place.place_id);
          return fullPlace || place;
        })
      );
      setSearchResults(fullPlaces);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handlePlaceClick = async (place: any) => {
    // place here is from the database
    // destination here is mapped to Destination type
    const destination = mapPlaceToDestination(place, currency, onCurrencyToggle, language);
    setSelectedPlace(destination);
    setDetailedDestination(place);
    setIsModalOpen(true);
  };

  const handleAddToDay = async (place: any) => {
    await onAddDestination(place);
    setIsModalOpen(false);
    setSelectedPlace(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Add button: fetch full place info and open modal
  const handleAddClick = async () => {
    if (!selectedPlaceId) return;
    setIsSearching(true);
    const place = await getPlaceById(selectedPlaceId);
    setIsSearching(false);
    if (place) {
      setSelectedPlace(place);
      setIsModalOpen(true);
    }
  };

  const resultsToShow = AIMatches && AIMatches.length > 0 ? AIMatches : searchResults;

  useEffect(() => {
    async function loadTypes() {
      const types = await fetchUniqueTopTypes();
      setFilterTypes([
        { id: "All", labelEN: "All", labelVI: "Tất cả" }, // Optionally add "All"
        ...types
      ]);
    }
    loadTypes();
  }, []);
  useEffect(() => {
    if (!resultsToShow.length) {
      setAllImagesLoaded(true);
      return;
    }
    setAllImagesLoaded(false);
    let loaded = 0;
    const images = resultsToShow
      .filter(place => place.thumbnail)
      .map(place => `/assets/${place.place_id}.jpg`); // Use the same src as in <img>

    if (images.length === 0) {
      setAllImagesLoaded(true);
      return;
    }

    images.forEach(src => {
      const img = new window.Image();
      img.onload = img.onerror = () => {
        loaded += 1;
        if (loaded === images.length) setAllImagesLoaded(true);
      };
      img.src = src;
    });
  }, [resultsToShow]);
  useEffect(() => {
    // Prefer cityCoordinates if available, else userLocation
    const coords =
      cityCoordinates && cityCoordinates.latitude !== undefined && cityCoordinates.longitude !== undefined
        ? cityCoordinates
        : userLocation;

    if (selectedFilter !== "All") {
      if (coords?.latitude !== undefined && coords?.longitude !== undefined) {
        (async () => {
          const filteredPlaces = await fetchNearbyPlaces(
            selectedFilter,
            coords.latitude,
            coords.longitude
          );
          setSearchResults(filteredPlaces.slice(0, 20));
        })();
      }
    } else {
      // Show all places
    }
  }, [selectedFilter, cityCoordinates, userLocation]);
  useEffect(() => {
    if (AIMatches && AIMatches.length > 0 && shouldPopUp) {
      const place = mapPlaceToDestination(AIMatches[0], currency, onCurrencyToggle, language);
      setSelectedPlace(place);
      setIsModalOpen(true);
    }
  }, [AIMatches]);
  return (
    <>
      <Card
        className="h-full w-full max-w-[400px] sticky bg-white rounded-3xl pt-4 px-7 pb-8 border border-[#E5E7EB]"
        style={{
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        }}
        data-tutorial-card="place-search"
      >
        <div className="space-y-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center text-gray-900 px-0 py-2.5 h-auto font-semibold text-[20px]">
            <MapPinPlus className="w-7 h-7 mr-2" style={{ color: primary }} />
            {t("placeSearch", lang)}
          </div>

          {/* Search Bar */}
          <div className="space-y-3">
            <div className="relative">
              <div className="relative flex items-center gap-2 h-10 px-4 bg-[#F3F4F6] rounded-2xl transition-all duration-300 hover:bg-[#E8EBED] focus-within:bg-white focus-within:ring-2 focus-within:shadow-lg group"
                style={{
                  ['--tw-ring-color' as any]: primary,
                }}
              >
                <input
                  type="text"
                  placeholder={
                    language === "EN"
                      ? "I'm looking for..."
                      : "Tôi đang tìm..."
                  }
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === "Enter") {
                      if (onAIMatchesReset) onAIMatchesReset();
                      onSearchInputChange(searchQuery);
                    }
                  }}
                  disabled={isSearching}
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 text-[14px] transition-all"
                />

                <button
                  onClick={() => {
                    if (onAIMatchesReset) onAIMatchesReset();
                    onSearchInputChange(searchQuery);
                  }}
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-0 top-0 bottom-0 px-4 rounded-xl text-white flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105 active:scale-95 group-focus-within:shadow-xl"
                  style={{
                    backgroundColor: primary,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSearching && searchQuery.trim()) {
                      e.currentTarget.style.backgroundColor = secondary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = primary;
                  }}
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 transition-transform group-focus-within:scale-110" />
                  )}
                </button>
              </div>
            </div>

            {/* Filter Chips Row */}
            <div className="relative" ref={filterContainerRef}>
              {/* Left Blur Gradient */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

              {/* Right Blur Gradient */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

              {/* Scrollable Filter Chips */}
              <div className="flex items-center overflow-x-auto min-w-0 gap-2 pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {filterTypes.map((filter) => (
                  <div key={filter.id} id={`filter-chip-${filter.id}`}>
                    <button
                      onClick={() => {
                        if (onAIMatchesReset) onAIMatchesReset();
                        setSelectedFilter(filter.id);

                        setTimeout(() => {
                          const chipElement = document.getElementById(
                            `filter-chip-${filter.id}`
                          );
                          if (chipElement && filterContainerRef.current) {
                            chipElement.scrollIntoView({
                              behavior: "smooth",
                              block: "nearest",
                              inline: "center",
                            });
                          }
                        }, 50);
                      }}
                      className={`
                        flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium h-[30px]
                        ${selectedFilter === filter.id
                          ? "text-white scale-100 animate-bounce-subtle"
                          : "bg-[#F1F5FF] text-[#1F2937] hover:bg-[#F6F9FF] hover:scale-[1.03] active:bg-[#E6EEFF] active:scale-[0.97]"
                        }
                      `}
                      style={{
                        backgroundColor:
                          selectedFilter === filter.id ? primary : undefined,
                        boxShadow:
                          selectedFilter === filter.id
                            ? `0 6px 16px ${primary}50`
                            : "none",
                        transitionDuration:
                          selectedFilter === filter.id ? "300ms" : "180ms",
                        transitionTimingFunction:
                          selectedFilter === filter.id
                            ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
                            : "ease-out",
                        transitionProperty: "all",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedFilter !== filter.id) {
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0, 0, 0, 0.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedFilter !== filter.id) {
                          e.currentTarget.style.boxShadow = "none";
                        }
                      }}
                    >
                      {language === "EN" ? filter.labelEN : filter.labelVI}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {!allImagesLoaded ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Loader2 className="w-16 h-16 mb-4 animate-spin opacity-30" />
                <p className="text-sm text-center">
                  {t("loadingImages", lang) || "Loading images..."}
                </p>
              </div>
            ) : resultsToShow.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Search className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-sm text-center">
                  {t("searchForPlaces", lang)}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 px-2">
                  {t("searchResults", lang)} ({resultsToShow.length})
                </p>
                {[...new Map(resultsToShow.map(place => [place.place_id, place])).values()].map((place: any) => (
                  <div
                    key={place.place_id}
                    className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group flex gap-3"
                    onClick={() => handlePlaceClick(place)}
                    style={{
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = primary;
                      e.currentTarget.style.boxShadow = `0 8px 24px ${primary}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                    }}
                  >
                    {/* Place Image - Left Side */}
                    {place.thumbnail && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={`/assets/${place.place_id}.jpg`}
                          alt={place.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Place Info - Right Side */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-2">
                        {/* Name & Type */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-gray-900 font-medium break-words">
                            {language === "EN"
                              ? (Array.isArray(place.en_names) ? place.en_names[0] : (place.en_names || place.title))
                              : (Array.isArray(place.vi_names) ? place.vi_names[0] : (place.vi_names || place.title))}
                          </h4>
                          {language === "EN" && place.best_type_id_en && (
                            <span
                              className="text-xs px-2 py-1 rounded-md shrink-0"
                              style={{
                                backgroundColor: light,
                                color: primary,
                              }}
                            >
                              {place.best_type_id_en.charAt(0).toUpperCase() + place.best_type_id_en.slice(1)}
                            </span>
                          )}
                          {language === "VI" && place.best_type_id_vi && (
                            <span
                              className="text-xs px-2 py-1 rounded-md shrink-0"
                              style={{
                                backgroundColor: light,
                                color: primary,
                              }}
                            >
                              {place.best_type_id_vi.charAt(0).toUpperCase() + place.best_type_id_vi.slice(1)}
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        {place.rating && (
                          <div className="flex items-center gap-2">
                            <div
                              className="flex items-center gap-1 px-2 py-1 rounded-md"
                              style={{ backgroundColor: primary }}
                            >
                              <span className="text-white text-xs font-semibold">
                                {place.rating.toFixed(1)}
                              </span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            </div>
                            {place.reviews && (
                              <span className="text-xs text-gray-500">
                                ({place.reviews.toLocaleString()})
                              </span>
                            )}
                          </div>
                        )}

                        {/* Address */}
                        {place.address && (
                          <div className="flex items-start gap-2 text-xs text-gray-600">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="break-words">{place.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToDay(place);
                        }}
                        className="w-full mt-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
                        style={{
                          backgroundColor: secondary,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        {t("addToDay", lang)} {selectedDayId}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card >

      {/* Place Details Modal */}
      < PlaceDetailsModal
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)
        }
        language={language}
        onAddToDay={handleAddToDay}
        showAddButton={true}
        currency={currency}
        currentDayNumber={currentDayNumber}
        detailedDestination={detailedDestination}
      />
    </>
  );
}