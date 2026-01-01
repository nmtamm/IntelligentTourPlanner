import { useState, useEffect, useRef } from "react";
import { DayView } from "./DayView";
import { AllDaysView } from "./AllDaysView";
import { MapView } from "./MapView";
import { PlaceSearchView } from "./PlaceSearchView";
import { RouteGuidance } from "./RouteGuidance";
import { ErrorNotification } from "./ErrorNotification";
import { ChatBox } from "./ChatBox";
import { DayChip } from "./DayChip";
import { AddDayButton } from "./AddDayButton";
import { DateSelector } from "./DateSelector";
import { ViewModePlacesGallery } from "./ViewModePlacesGallery";
import { ViewModePlaceDetails } from "./ViewModePlaceDetails";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import {
  Save,
  Check,
  CalendarIcon,
  Loader2,
  NotebookPen,
  Users,
  MapPin,
} from "lucide-react";
import { DayPlan, Destination, Place } from "../types";
import { toast } from "sonner";
import { format, addDays, differenceInDays, set } from "date-fns";
import { t } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";
import { convertAllDays } from "../utils/exchangerate";
import { fetchNearbyPlaces, generatePlaces, mapPlaceToDestination } from "../utils/serp";
import { getOptimizedRoute } from "../utils/geocode";
import { createTrip, updateTrip } from '../api.js';
import { getPlaceById } from "../utils/serp";

interface CustomModeProps {
  tripData: { name: string; days: DayPlan[], };
  onUpdate: (data: { name: string; days: DayPlan[] }) => void;
  currency: "USD" | "VND";
  onCurrencyToggle: () => void;
  language: "EN" | "VI";
  mode: "custom" | "view";
  isLoggedIn: boolean;
  currentUser: string | null;
  planId?: string | null;
  onPlanIdChange?: (planId: string) => void;
  resetToDefault?: boolean;
  showAllDaysOnLoad?: boolean;
  AICommand?: string | null;
  onAIActionComplete?: () => void;
  onAICommand?: (command: string, payload?: any) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

type ViewMode = "single" | "route-guidance";

export function CustomMode({
  tripData,
  onUpdate,
  currency,
  onCurrencyToggle,
  language,
  mode,
  isLoggedIn,
  currentUser,
  planId,
  onPlanIdChange,
  resetToDefault,
  showAllDaysOnLoad,
  AICommand,
  onAIActionComplete,
  onAICommand,
  userLocation
}: CustomModeProps) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  const { primary, secondary } = useThemeColors();
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [selectedDay, setSelectedDay] = useState<string>("1");
  const [routeGuidancePair, setRouteGuidancePair] = useState<
    [Destination, Destination] | null
  >(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] =
    useState(false);
  const [localTripData, setLocalTripData] = useState({
    ...tripData, city: "",
    cityCoordinates: { latitude: 0, longitude: 0 }
  });
  const [members, setMembers] = useState("");
  const [preferences, setPreferences] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isDateUserInput, setIsDateUserInput] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedDestination, setFocusedDestination] = useState<Destination | null>(null);
  const [selectedPlaceInViewMode, setSelectedPlaceInViewMode] = useState<Destination | null>(null);
  const [routeSegmentIndex, setRouteSegmentIndex] = useState<number | null>(null);
  const [convertedDays, setConvertedDays] = useState(localTripData.days);
  const [isEstimating, setIsEstimating] = useState(false);
  const dayChipsContainerRef = useRef<HTMLDivElement>(null);
  const [latestAIResult, setLatestAIResult] = useState<any>(null);
  const [AIMatches, setAIMatches] = useState<Destination[] | null>(null);
  const [showPlaceDetailsModal, setShowPlaceDetailsModal] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<Place | null>(null);
  const [detailedDestinations, setDetailedDestinations] = useState<Record<string, Place | null>>({});

  const handleTripDataChange = (newData: {
    name: string;
    days: DayPlan[];
  }) => {
    setLocalTripData(newData);
    setHasUnsavedChanges(true);
    onUpdate(newData);
  };

  const updateTripName = (name: string) => {
    handleTripDataChange({ ...localTripData, name });
  };

  const addDay = () => {
    const newDay: DayPlan = {
      id: String(localTripData.days.length + 1),
      dayNumber: localTripData.days.length + 1,
      destinations: [],
      optimizedRoute: [],
    };
    handleTripDataChange({
      ...localTripData,
      days: [...localTripData.days, newDay],
    });
    setSelectedDay(newDay.id);
    setViewMode("single");

    // Scroll to show the newly added day chip
    setTimeout(() => {
      if (dayChipsContainerRef.current) {
        dayChipsContainerRef.current.scrollTo({
          left: dayChipsContainerRef.current.scrollWidth,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const removeDay = (dayId: string) => {
    if (localTripData.days.length === 1) {
      setError(t('mustHaveOneDay', lang));
      return;
    }

    const newDays = localTripData.days
      .filter((d) => d.id !== dayId)
      .map((day, index) => ({
        ...day,
        id: String(index + 1),
        dayNumber: index + 1,
      }));
    handleTripDataChange({ ...localTripData, days: newDays });

    // If the deleted day was selected, choose the next appropriate day
    if (selectedDay === dayId) {
      setSelectedDay(newDays[0].id);

      // Scroll to show the newly selected day chip
      setTimeout(() => {
        const chipElement = document.getElementById(`day-chip-${newDays[0].id}`);
        if (chipElement && dayChipsContainerRef.current) {
          chipElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }, 50);
    }
    toast.success(t('dayRemoved', lang));
  };

  const updateDay = (dayId: string, updatedDay: DayPlan) => {
    handleTripDataChange({
      ...localTripData,
      days: localTripData.days.map((d) =>
        d.id === dayId ? updatedDay : d,
      ),
    });
  };

  const findOptimalRoute = async (destinations: { latitude: number; longitude: number; name: string }[]) => {
    const day = localTripData.days.find((d) => d.id === selectedDay);
    if (!day || !destinations || destinations.length < 1) {
      toast.error(t('addDestinationsFirst', lang));
      setError(t('addDestinationsFirst', lang));
      return;
    }

    setIsOptimizing(true);
    toast.success(t('optimizingRoute', lang));

    // Convert to backend format
    const backendDestinations = [
      userLocation
        ? {
          lat: userLocation.latitude,
          lon: userLocation.longitude,
          name: "User Location",
        }
        : null,
      ...destinations.map(d => ({
        lat: d.latitude,
        lon: d.longitude,
        name: d.name,
      })),
    ].filter(Boolean) as { lat: number; lon: number; name: string }[];

    const optimized = await getOptimizedRoute(backendDestinations);
    if (!optimized || !optimized.success || !Array.isArray(optimized.optimized_route)) {
      toast.error("Failed to optimize route");
      setError(t('routeOptimizationFailed', lang));
      setIsOptimizing(false);
      return;
    }


    const optimizedRoute = optimized.optimized_route.map((dest) => {
      const latitude = dest.latitude ?? dest.lat;
      const longitude = dest.longitude ?? dest.lon;
      return {
        ...dest,
        latitude,
        longitude,
      };
    });

    const reorderedDestinations = optimizedRoute.map(opt =>
      destinations.find(
        d =>
          d.latitude === opt.latitude &&
          d.longitude === opt.longitude &&
          d.name === opt.name
      )
    ).filter(Boolean); // Remove any unmatched

    updateDay(selectedDay, {
      ...day,
      destinations: reorderedDestinations,
      optimizedRoute,
      routeDistanceKm: optimized.distance_km,
      routeDurationMin: optimized.duration_min,
      routeGeometry: optimized.geometry,
      routeInstructions: optimized.instructions,
      routeSegmentGeometries: optimized.segment_geometries,
    });

    toast.success(t('routeOptimized', lang));
    setIsOptimizing(false);
  };

  const savePlan = async () => {
    if (!localTripData.name.trim()) {
      setError(t('pleaseEnterTripName', lang));
      return;
    }

    setIsSaving(true);

    if (!isLoggedIn) {
      toast.error(t('pleaseLogin', lang));
      setError(t('pleaseLogin', lang));
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(t('authenticationNotFound', lang));
      setError(t('authenticationNotFound', lang));
      return;
    }

    // Transform data to match backend schema
    const tripDataForAPI = {
      name: localTripData.name,
      members: members ? parseInt(members) : null,
      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
      end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
      currency: currency,
      days: localTripData.days.map(day => ({
        day_number: day.dayNumber,
        destinations: day.destinations.map((dest, index) => ({
          name: dest.name,
          address: dest.address || '',
          latitude: dest.latitude || null,
          longitude: dest.longitude || null,
          order: index,
          costs: dest.costs.map(cost => ({
            amount: typeof cost.amount === "string" ? cost.amount : String(cost.amount),
            originalAmount: typeof cost.originalAmount === "string" ? cost.originalAmount : String(cost.originalAmount),
            originalCurrency: cost.originalCurrency || currency,
            detail: cost.detail || ''
          }))
        }))
      }))
    };

    try {
      if (planId) {
        // Update existing plan
        const updated = await updateTrip(planId, tripDataForAPI, token);
        setHasUnsavedChanges(false);
        toast.success(t('planUpdated', lang));
        console.log('Updated trip:', updated);
      } else {
        // Create new plan
        const created = await createTrip(tripDataForAPI, token);
        setHasUnsavedChanges(false);
        toast.success(t('planSaved', lang));
        console.log('Created trip:', created);
        if (created?.id && typeof onPlanIdChange === "function") {
          onPlanIdChange(created.id);
        }
      }
    } catch (error) {
      const err = error as any;
      console.error('Error saving trip:', err);
      if (err.response?.status === 401) {
        toast.error(t('sessionExpired', lang));
        setError(t('sessionExpired', lang));
      } else {
        toast.error(t('planSaveFailed', lang));
        setError(t('planSaveFailed', lang));
      }
    }

    setIsSaving(false);
  };

  const addDayAfter = (dayId: string) => {
    const dayIndex = localTripData.days.findIndex(d => d.id === dayId);
    if (dayIndex === -1) return;

    const newDayNumber = dayIndex + 2; // +2 because dayNumber is 1-based and we want to insert after
    const newDay: DayPlan = {
      id: String(localTripData.days.length + 1),
      dayNumber: newDayNumber,
      destinations: [],
      optimizedRoute: [],
    };

    // Insert the new day after the specified day
    const newDays = [
      ...localTripData.days.slice(0, dayIndex + 1),
      newDay,
      ...localTripData.days.slice(dayIndex + 1),
    ].map((day, idx) => ({
      ...day,
      id: String(idx + 1),
      dayNumber: idx + 1,
    }));

    handleTripDataChange({
      ...localTripData,
      days: newDays,
    });
    setSelectedDay(newDay.id);
    setViewMode("single");
  };

  const swapDays = (dayId1: string, dayId2: string) => {
    const idx1 = localTripData.days.findIndex(d => d.id === dayId1);
    const idx2 = localTripData.days.findIndex(d => d.id === dayId2);
    if (idx1 === -1 || idx2 === -1 || idx1 === idx2) return;

    // Copy the days array
    const newDays = [...localTripData.days];
    // Swap the two days
    [newDays[idx1], newDays[idx2]] = [newDays[idx2], newDays[idx1]];
    // Reassign dayNumber and id to keep them consistent
    const updatedDays = newDays.map((day, idx) => ({
      ...day,
      id: String(idx + 1),
      dayNumber: idx + 1,
    }));

    handleTripDataChange({
      ...localTripData,
      days: updatedDays,
    });
  };

  const handleAICommand = async (command: string, payload?: any) => {
    if (onAICommand) onAICommand(command, payload);
    switch (command) {
      case 'create_itinerary':
        if (payload && payload.itinerary) {
          const result = payload.itinerary;

          let parsedStart: Date | undefined;
          let parsedEnd: Date | undefined;
          let daysCount = 1;

          // 1. Parse trip info and set trip name, members, dates
          if (result.trip_info) {
            if (result.trip_info.trip_name) updateTripName(result.trip_info.trip_name);
            if (result.trip_info.num_people) setMembers(String(result.trip_info.num_people));
            if (result.trip_info.start_day && !isNaN(Date.parse(result.trip_info.start_day))) {
              parsedStart = new Date(result.trip_info.start_day);
              setStartDate(parsedStart);
            }
            if (result.trip_info.end_day && !isNaN(Date.parse(result.trip_info.end_day))) {
              parsedEnd = new Date(result.trip_info.end_day);
              setEndDate(parsedEnd);
            }
          }

          // 2. Create days array based on date range
          if (parsedStart && parsedEnd) {
            daysCount = differenceInDays(parsedEnd, parsedStart) + 1;
            if (daysCount > 0) {
              const days: DayPlan[] = [];
              for (let i = 0; i < daysCount; i++) {
                days.push({
                  id: String(i + 1),
                  dayNumber: i + 1,
                  destinations: [],
                  optimizedRoute: [],
                });
              }
              handleTripDataChange({
                ...localTripData,
                days,
              });
            }
          }

          // 3. Generate and map places, then distribute among days
          if (
            userLocation &&
            Array.isArray(result.categories) &&
            (result.valid_starting_point === undefined || result.valid_starting_point === true)
          ) {
            const { allPlaces, city, latitude, longitude } = await generatePlaces(result, userLocation);
            const mappedPlaces = allPlaces.map(place => {
              const dest = mapPlaceToDestination(place, currency, onCurrencyToggle, language);
              // Optionally add/override fields here
              return dest;
            });

            // 4. Divide mappedPlaces into subsets for each day
            if (daysCount > 1 && mappedPlaces.length > 0) {
              const perDay = Math.floor(mappedPlaces.length / daysCount);
              const remainder = mappedPlaces.length % daysCount;
              let assigned = 0;
              const newDays: DayPlan[] = [];
              for (let i = 0; i < daysCount; i++) {
                const count = perDay + (i < remainder ? 1 : 0);
                newDays.push({
                  ...localTripData.days[i],
                  id: String(i + 1),
                  dayNumber: i + 1,
                  destinations: mappedPlaces.slice(assigned, assigned + count),
                  optimizedRoute: [],
                });
                assigned += count;
              }
              handleTripDataChange({
                ...localTripData,
                days: newDays,
                city: city,
                cityCoordinates: { latitude, longitude }
              });
            } else if (mappedPlaces.length > 0) {
              // Fallback: single day
              handleTripDataChange({
                ...localTripData,
                days: [
                  {
                    ...localTripData.days[0],
                    destinations: mappedPlaces,
                    optimizedRoute: [],
                  },
                ],
              });
            }
          } else if (result.valid_starting_point === false) {
            toast.error("Starting point must be Da Lat, Ho Chi Minh City, or Hue, Vietnam.");
          }
          break;
        }
      case 'add_new_day': {
        addDay();
        break;
      }
      case 'add_new_day_after_current': {
        addDayAfter(selectedDay);
        break;
      }

      case 'add_new_day_after_ith': {
        const dayIndex = payload?.day;
        if (dayIndex && !isNaN(Number(dayIndex))) {
          addDayAfter(String(dayIndex));
        }
        break;
      }

      case 'update_trip_name': {
        const newName = payload?.trip_name;
        if (newName && typeof newName === "string") {
          updateTripName(newName);
        }
        break;
      }

      case 'update_members': {
        const newMembers = payload?.members;
        if (newMembers && !isNaN(Number(newMembers))) {
          setMembers(String(newMembers));
        }
        break;
      }

      case 'update_start_date': {
        const newStartDay = payload?.start_day;
        if (newStartDay && !isNaN(Date.parse(newStartDay))) {
          setStartDate(new Date(newStartDay));
        }
        break;
      }

      case 'update_end_date': {
        const newEndDay = payload?.end_day;
        if (newEndDay && !isNaN(Date.parse(newEndDay))) {
          setEndDate(new Date(newEndDay));
        }
        break;
      }

      case 'view_all_days': {
        setViewMode("all");
        break;
      }

      case 'delete_current_day': {
        removeDay(selectedDay);
        break;
      }

      case 'delete_all_days': {
        const newDay: DayPlan = {
          id: "1",
          dayNumber: 1,
          destinations: [],
          optimizedRoute: [],
        };
        handleTripDataChange({
          ...localTripData,
          days: [newDay],
        });
        setSelectedDay("1");
        break;
      }

      case 'swap_day': {
        const dayId1 = payload?.day1;
        const dayId2 = payload?.day2;
        if (dayId1 && dayId2) {
          swapDays(String(dayId1), String(dayId2));
        }
        break;
      }

      case 'delete_range_of_days': {
        const startDay = payload?.start_day;
        const endDay = payload?.end_day;
        if (startDay && endDay && !isNaN(Number(startDay)) && !isNaN(Number(endDay))) {
          const startIdx = Number(startDay) - 1;
          const endIdx = Number(endDay) - 1;
          const newDays = localTripData.days
            .filter((_, idx) => idx < startIdx || idx > endIdx)
            .map((day, idx) => ({
              ...day,
              id: String(idx + 1),
              dayNumber: idx + 1,
            }));
          handleTripDataChange({
            ...localTripData,
            days: newDays,
          });
          // Optionally update selectedDay if needed
          if (newDays.length > 0) setSelectedDay(newDays[0].id);
        }
        break;
      }

      case 'search_new_destination': {
        const matches = payload?.matches;
        setAIMatches(matches);
        break;
      }


      case 'extend_map_view': {
        setIsMapExpanded(true);
        break;
      }

      case 'collapse_map_view': {
        setIsMapExpanded(false);
        break;
      }

      case 'find_route_of_pair_ith': {
        const pairIndex = latestAIResult.pair_index;
        setViewMode("route-guidance");
        setRouteSegmentIndex(pairIndex);
        break;
      }

      case 'delete_current_plan': {
        setLocalTripData({
          name: "",
          days: [
            {
              id: "1",
              dayNumber: 1,
              destinations: [],
              optimizedRoute: [],
            },
          ],
          city: "",
          cityCoordinates: { latitude: 0, longitude: 0 },
        });
        setMembers("");
        setPreferences("");
        setStartDate(undefined);
        setEndDate(undefined);
        setSelectedDay("1");
        setViewMode("single");
        setAIMatches(null);
        setHasUnsavedChanges(true);
        break;
      }
      case 'confirm_add_new_destination': {
        const addedDay = payload?.day;
        if (payload?.destination) {
          if (addedDay && !isNaN(Number(addedDay))) {
            const day = localTripData.days.find(d => d.id === String(addedDay));
            if (day) {
              const destination = mapPlaceToDestination(payload.destination, currency, onCurrencyToggle, language);
              const updatedDestinations = [...day.destinations, destination];
              updateDay(day.id, {
                ...day,
                destinations: updatedDestinations,
                optimizedRoute: [],
              });
              toast.success(t('destinationAdded', lang));
            }
          }
        } break;
      }
      case 'add_new_destination': {
        const addedDay = payload?.day;
        if (payload?.destination) {
          if (addedDay && !isNaN(Number(addedDay))) {
            const day = localTripData.days.find(d => d.id === String(addedDay));
            if (day) {
              const destination = mapPlaceToDestination(payload.destination, currency, onCurrencyToggle, language);
              const updatedDestinations = [...day.destinations, destination];
              updateDay(day.id, {
                ...day,
                destinations: updatedDestinations,
                optimizedRoute: [],
              });
              toast.success(t('destinationAdded', lang));
            }
          }
        }
        break;
      }
      case 'replace_destination_in_plan': {
        const remove_id = payload?.remove_id;
        const new_destination_full_place = payload?.new_destination;
        // Find the destination id in the current plan
        if (remove_id && new_destination_full_place) {
          let found = false;
          for (const day of localTripData.days) {
            const destIndex = day.destinations.findIndex(dest => dest.id === remove_id);
            if (destIndex !== -1) {
              // Write the new destination to the found index but with different id
              const destination = mapPlaceToDestination(new_destination_full_place, currency, onCurrencyToggle, language);
              const updatedDestinations = [...day.destinations];
              updatedDestinations[destIndex] = destination;
              updateDay(day.id, {
                ...day,
                destinations: updatedDestinations,
                optimizedRoute: [],
              });
              toast.success(t('destinationReplaced', lang));
              found = true;
              break;
            }
          }
          if (!found) {
            toast.error(t('destinationToReplaceNotFound', lang));
          }
        }
        break;
      }
      case 'extract_type_from_prompt': {
        const place_type = payload?.type;
        if (place_type && userLocation) {
          const destinations = fetchNearbyPlaces(place_type, userLocation?.latitude, userLocation?.longitude, 1000);
          setAIMatches(destinations);
        } break;
      }
      case 'find_information_for_a_place': {
        const fullPlace = payload?.place_info;
        setAIMatches(fullPlace ? [fullPlace] : []);
        setShowPlaceDetailsModal(true);
        break;
      }
      default:
        console.warn("Unknown AI command:", command);
    }
  }
  // Reset to default view states when User Manual is opened
  useEffect(() => {
    if (resetToDefault) {
      const firstDay = localTripData.days[0];

      setViewMode("single");
      setIsMapExpanded(false);
      setRouteGuidancePair(null);

      if (firstDay) {
        setSelectedDay(firstDay.id);
      }
    }
  }, [resetToDefault, localTripData.days]);

  // Watch for changes to tripData
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [tripData]);

  // Automatically adjust number of days based on Start Date and End Date (user input)
  useEffect(() => {
    if (startDate && endDate && isDateUserInput) {
      const daysDifference =
        differenceInDays(endDate, startDate) + 1;

      if (daysDifference !== localTripData.days.length) {
        const newDays: DayPlan[] = [];

        for (let i = 0; i < daysDifference; i++) {
          const existingDay = localTripData.days[i];
          newDays.push(
            existingDay
              ? {
                ...existingDay,
                id: String(i + 1),
                dayNumber: i + 1,
              }
              : {
                id: String(i + 1),
                dayNumber: i + 1,
                destinations: [],
                optimizedRoute: [],
              },
          );
        }

        handleTripDataChange({
          ...localTripData,
          days: newDays,
        });
        toast.success(
          `${t('tripAdjusted', lang)} ${daysDifference} ${daysDifference > 1 ? t('days', lang) : t('day', lang)}`,
        );
      }
      setIsDateUserInput(false);
    }
  }, [startDate, endDate, isDateUserInput]);

  // Sync End Date when days are manually added/removed
  useEffect(() => {
    if (startDate && !isDateUserInput) {
      const calculatedEndDate = addDays(
        startDate,
        localTripData.days.length - 1,
      );
      setEndDate(calculatedEndDate);
    }
  }, [localTripData.days.length, startDate, isDateUserInput]);

  // Focus the selected day when Calendar opens or date updates
  useEffect(() => {
    const selectedEl = document.querySelector(
      "[aria-selected='true']"
    ) as HTMLElement | null;

    selectedEl?.focus();
  }, [startDate, endDate]);

  // Convert all days' costs when currency changes or days change
  useEffect(() => {
    const updateConvertedDays = async () => {
      const result = await convertAllDays(localTripData.days, currency);
      setConvertedDays(result);
    };
    updateConvertedDays();
  }, [localTripData.days, currency]);

  const handleRouteGuidance = (day: DayPlan, idx: number) => {
    setViewMode("route-guidance");
    setRouteSegmentIndex(idx);
  };

  const currentDay = localTripData.days.find(
    (d) => d.id === selectedDay,
  );
  if (viewMode === "route-guidance" && currentDay && routeSegmentIndex !== null) {
    return (
      <RouteGuidance
        day={currentDay}
        segmentIndex={routeSegmentIndex}
        onBack={() => {
          setViewMode("single");
        }}
        language={language}
      />
    );
  }

  useEffect(() => {
    if (!selectedPlaceInViewMode) return;
    getPlaceById(selectedPlaceInViewMode.place_id).then(setPlaceDetails);
  }, [selectedPlaceInViewMode]);

  useEffect(() => {
    async function fetchDetails() {
      const details: Record<string, Place | null> = {};
      for (const dest of currentDay.destinations) {
        if (!detailedDestinations[dest.id]) {
          details[dest.id] = await getPlaceById(dest.id);
        }
      }
      setDetailedDestinations(prev => ({ ...prev, ...details }));
    }
    fetchDetails();
  }, [currentDay.destinations]);

  // View Mode Layout: Map (50%) | ViewModePlacesGallery & ViewModePlaceDetails (50%), No ChatBox
  if (mode === "view") {
    return (
      <div className="flex gap-4 h-[calc(100vh-32px)]">
        {/* Left Side - Trip Details + Map (50%) */}
        <div className="flex-1 h-full flex flex-col gap-4">
          {/* Trip Details Card */}
          <Card
            className="shrink-0 rounded-[24px] border-0"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
              boxShadow: '0 8px 32px rgba(0,77,182,0.08), 0 1px 3px rgba(0,0,0,0.05)',
              paddingTop: '20px',
              paddingLeft: '24px',
              paddingRight: '24px',
              paddingBottom: '20px'
            }}
          >
            <div className="space-y-3">
              {/* Header with decorative line */}
              <div className="relative pb-2">
                <h3 className="flex items-center gap-2 text-gray-900" style={{ fontSize: '20px', fontWeight: 600 }}>
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl">
                    <NotebookPen className="w-6 h-6" style={{ color: primary }} />
                  </div>
                  {t('tripDetails', lang)}
                </h3>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-20" style={{
                  backgroundImage: `linear-gradient(to right, ${primary}, ${secondary}, transparent)`
                }}></div>
              </div>

              {/* Trip Information - Read Only with icons */}
              <div className="space-y-2.5">
                {/* Trip Name */}
                {localTripData.name && (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 hover:bg-white/80 transition-colors duration-200 border border-gray-100/50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0" style={{
                      background: `linear-gradient(to bottom right, ${primary}10, ${primary}05)`
                    }}>
                      <MapPin className="w-4 h-4" style={{ color: primary }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">{t('tripName', lang)}</div>
                      <div className="text-sm text-gray-900 truncate" style={{ fontWeight: 500 }}>{localTripData.name}</div>
                    </div>
                  </div>
                )}

                {/* Members and Dates in one row */}
                <div className="flex gap-2.5">
                  {/* Members */}
                  {members && (
                    <div className="flex-1 flex items-center gap-2.5 p-2.5 rounded-xl bg-white/60 hover:bg-white/80 transition-colors duration-200 border border-gray-100/50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0" style={{
                        background: `linear-gradient(to bottom right, ${secondary}10, ${secondary}05)`
                      }}>
                        <Users className="w-4 h-4" style={{ color: secondary }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 mb-0.5">{t('numberOfMembers', lang)}</div>
                        <div className="text-sm text-gray-900 whitespace-nowrap truncate" style={{ fontWeight: 500 }}>{members} {t('members', lang)}</div>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  {startDate && endDate && (
                    <div className="flex-1 flex items-center gap-2.5 p-2.5 rounded-xl bg-white/60 hover:bg-white/80 transition-colors duration-200 border border-gray-100/50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#DAF9D8]/80 to-[#70C573]/10 shrink-0">
                        <CalendarIcon className="w-4 h-4 text-[#5E885D]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 mb-0.5">{t('dates', lang)}</div>
                        <div className="text-sm text-gray-900 truncate" style={{ fontWeight: 500 }}>
                          {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Map View Card */}
          <div className="flex-1 overflow-hidden">
            <MapView
              days={localTripData.days}
              viewMode={viewMode}
              selectedDayId={selectedDay}
              onRouteGuidance={handleRouteGuidance}
              resetMapView={resetToDefault}
              language={language}
              mode={mode}
              focusedDestination={selectedPlaceInViewMode}
              onOptimizeRoute={findOptimalRoute}
              isOptimizing={isOptimizing}
              onDestinationClick={(destination) => {
                setSelectedPlaceInViewMode(destination);
                // Find which day this destination belongs to and select that day
                const dayWithDestination = localTripData.days.find((day) =>
                  day.destinations.some((d) => d.id === destination.id)
                );
                if (dayWithDestination) {
                  setSelectedDay(dayWithDestination.id);
                }
              }}
            />
          </div>
        </div>

        {/* Right Side - Places Gallery + Place Details (50%) */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Places Gallery with Day Navigation */}
          <ViewModePlacesGallery
            days={localTripData.days}
            selectedDayId={selectedDay}
            selectedPlaceId={selectedPlaceInViewMode?.id || null}
            onDaySelect={(dayId) => {
              setSelectedDay(dayId);
              setSelectedPlaceInViewMode(null);
            }}
            onPlaceSelect={(place) => {
              setSelectedPlaceInViewMode(place);
              setFocusedDestination(place);
            }}
            language={language}
          />

          {/* Place Details */}
          <ViewModePlaceDetails
            place={selectedPlaceInViewMode}
            language={language}
            currency={currency}
            detailedDestination={placeDetails}
          />
        </div>

        {/* Error Notification */}
        {error && (
          <ErrorNotification
            message={error}
            onClose={() => setError(null)}
          />
        )}
      </div>
    );
  }

  // Custom Mode Layout: Original layout with ChatBox
  return (
    <div className="flex gap-4 h-[calc(100vh-32px)]">
      {/* Left Side - 75% */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left: Place Search - Full Height */}
        <div className="flex-1 relative h-full min-w-0">
          <PlaceSearchView
            onAddDestination={async (place: any) => {
              const day = localTripData.days.find((d) => d.id === selectedDay);
              if (!day) return;

              console.log("dest place id:", place.place_id);
              // Check for duplicate place_id
              if (day.destinations.some(dest => dest.id === place.place_id)) {
                toast.error(t("destinationAlreadyExists", lang));
                return;
              }
              // Convert place to Destination type
              const destination = mapPlaceToDestination(place, currency, onCurrencyToggle, language);
              updateDay(selectedDay, {
                ...day,
                destinations: [...day.destinations, destination],
                optimizedRoute: [],
              });
              toast.success(t("destinationAdded", lang));
            }}
            language={language}
            selectedDayId={selectedDay}
            currentDayNumber={localTripData.days.find((d) => d.id === selectedDay)?.dayNumber}
            currency={currency}
            onCurrencyToggle={onCurrencyToggle}
            AIMatches={AIMatches}
            onAIMatchesReset={() => setAIMatches(null)}
            userLocation={userLocation}
            city={localTripData.city}
            cityCoordinates={localTripData.cityCoordinates}
            shouldPopUp={showPlaceDetailsModal}
            onClosePopUp={() => setShowPlaceDetailsModal(false)}
          />
        </div>

        {/* Right: Trip Info + Day View */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Trip Info Card */}
          <Card
            className="shrink-0 rounded-[24px] border border-[#E5E7EB]"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
              paddingTop: '28px',
              paddingLeft: '28px',
              paddingRight: '28px',
              paddingBottom: '12px'
            }}
            data-tutorial-card="trip-details"
          >
            <div className="space-y-3">
              {/* Header / Title Area with Save Button */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-gray-900" style={{ fontSize: '20px', fontWeight: 600 }}>
                  <NotebookPen className="w-6 h-6" style={{ color: primary }} />
                  {t('tripDetails', lang)}
                </h3>

                {/* Save Plan Button */}
                {isLoggedIn && (
                  <Button
                    size="sm"
                    onClick={savePlan}
                    disabled={!hasUnsavedChanges || isSaving}
                    data-tutorial="save-plan"
                    className="transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none group"
                    style={{ height: '32px' }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('saving', lang)}...
                      </>
                    ) : hasUnsavedChanges ? (
                      <>
                        <Save className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5" />
                        {t('savePlan', lang)}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2 transition-all duration-200 group-hover:scale-125" />
                        {t('saved', lang)}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Trip Name & Number of Members */}
              <div className="flex gap-5">
                <Input
                  value={localTripData.name}
                  onChange={(e) => updateTripName(e.target.value)}
                  placeholder={t('enterTripName', lang)}
                  className="flex-1 rounded-xl border-[#E2E8F0] bg-[#F8FAFC] placeholder:text-[#94A3B8] focus-visible:ring-[3px] focus-visible:ring-[rgba(59,130,246,0.20)] focus-visible:border-[#3B82F6] transition-all duration-200 hover:border-[#CBD5E1] hover:bg-white"
                  style={{ height: '40px' }}
                  data-tutorial="trip-name"
                />

                <Input
                  type="number"
                  value={members}
                  onChange={(e) => {
                    setMembers(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder={t('numberOfMembers', lang)}
                  min="1"
                  className="flex-1 rounded-xl border-[#E2E8F0] bg-[#F8FAFC] placeholder:text-[#94A3B8] focus-visible:ring-[3px] focus-visible:ring-[rgba(59,130,246,0.20)] focus-visible:border-[#3B82F6] transition-all duration-200 hover:border-[#CBD5E1] hover:bg-white"
                  style={{ height: '40px' }}
                  data-tutorial="members"
                />
              </div>

              {/* Date Selection with Increment/Decrement */}
              <div className="flex gap-5">
                <DateSelector
                  date={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setIsDateUserInput(true);
                  }}
                  placeholder={t('startDate', lang)}
                  disabled={(date) => {
                    if (endDate) {
                      return date > endDate;
                    }
                    return false;
                  }}
                  onIncrement={() => {
                    if (startDate) {
                      setStartDate(addDays(startDate, 1));
                      setIsDateUserInput(true);
                    }
                  }}
                  onDecrement={() => {
                    if (startDate) {
                      setStartDate(addDays(startDate, -1));
                      setIsDateUserInput(true);
                    }
                  }}
                />

                <DateSelector
                  date={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setIsDateUserInput(true);
                  }}
                  placeholder={t('endDate', lang)}
                  disabled={(date) => {
                    if (startDate) {
                      return date < startDate;
                    }
                    return false;
                  }}
                  onIncrement={() => {
                    if (endDate) {
                      setEndDate(addDays(endDate, 1));
                      setIsDateUserInput(true);
                    }
                  }}
                  onDecrement={() => {
                    if (endDate) {
                      setEndDate(addDays(endDate, -1));
                      setIsDateUserInput(true);
                    }
                  }}
                />
              </div>

              {/* Day Navigation - Timeline Chips */}
              <div className="flex items-center gap-3">
                <div className="flex gap-3 overflow-x-auto pb-1 flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ overflowY: 'visible', paddingTop: '4px', paddingBottom: '4px' }} ref={dayChipsContainerRef} data-tutorial="day-tabs">
                  {localTripData.days.map((day) => (
                    <div key={day.id} id={`day-chip-${day.id}`}>
                      <DayChip
                        dayNumber={day.dayNumber}
                        isSelected={selectedDay === day.id && viewMode === "single"}
                        onClick={() => {
                          setSelectedDay(day.id);
                          setViewMode("single");

                          // Scroll to show the clicked day chip
                          setTimeout(() => {
                            const chipElement = document.getElementById(`day-chip-${day.id}`);
                            if (chipElement && dayChipsContainerRef.current) {
                              chipElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                                inline: 'center'
                              });
                            }
                          }, 50);
                        }}
                        onDelete={(e) => {
                          e.stopPropagation();
                          removeDay(day.id);
                        }}
                        label={t('day', lang)}
                      />
                    </div>
                  ))}
                </div>

                {/* Add Day Button */}
                <AddDayButton
                  onClick={addDay}
                  label={t('addDay', lang)}
                />
              </div>
            </div>
          </Card>

          {/* Main Content - Map and Day View Side by Side */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === "single" && currentDay ? (
              <DayView
                day={currentDay}
                onUpdate={(updatedDay) =>
                  updateDay(selectedDay, updatedDay)
                }
                currency={currency}
                onCurrencyToggle={onCurrencyToggle}
                language={language}
                onDestinationClick={(destination) => setFocusedDestination(destination)}
                detailedDestinations={detailedDestinations}
              />
            ) : (
              <AllDaysView
                days={localTripData.days}
                onUpdate={(updatedDays) =>
                  handleTripDataChange({
                    ...localTripData,
                    days: updatedDays,
                  })
                }
                currency={currency}
                onCurrencyToggle={onCurrencyToggle}
                language={language}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Chat Box (30%) */}
      <div className="w-3/10 min-w-[300px] h-full">
        <ChatBox
          language={language}
          AICommand={AICommand}
          onAICommand={handleAICommand}
          onAIActionComplete={onAIActionComplete}
          city={localTripData.city}
          cityCoordinates={localTripData.cityCoordinates}
          plan={localTripData}
        />
      </div>

      {/* Error Notification */}
      {error && (
        <ErrorNotification
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}