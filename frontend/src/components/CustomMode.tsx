import { useState, useEffect, useRef } from "react";
import { DayView } from "./DayView";
import { AllDaysView } from "./AllDaysView";
import { MapView } from "./MapView";
import { RouteGuidance } from "./RouteGuidance";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import {
  Plus,
  Save,
  Eye,
  Calculator,
  X,
  Check,
  CalendarIcon,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Sparkles,
  Waypoints,
  Loader2,
} from "lucide-react";
import { DayPlan, Destination } from "../types";
import { toast } from "sonner";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { format, addDays, differenceInDays, set } from "date-fns";
import { createTrip, updateTrip } from '../api.js';
import { getOptimizedRoute } from "../utils/geocode";
import { fetchItinerary } from "../utils/gemini";
import { data } from "react-router-dom";
import { convertCurrency, convertAllDays } from "../utils/exchangerate";
import { fetchPlacesData, generatePlaces, savePlacesToBackend } from "../utils/serp";
import { geocodeDestination } from "../utils/geocode";
import { makeDestinationFromGeo } from "../utils/destinationFactory";
import { t } from "../utils/translations";
import { ErrorNotification } from "./ErrorNotification";
import { sendLocationToBackend } from "../utils/geolocation";
import { fetchItineraryWithGroq, detectAndExecuteGroqCommand } from "../utils/groq";

interface CustomModeProps {
  tripData: { name: string; days: DayPlan[] };
  onUpdate: (data: { name: string; days: DayPlan[] }) => void;
  currency: "USD" | "VND";
  onCurrencyToggle: () => void;
  language: "EN" | "VI";
  isLoggedIn: boolean;
  currentUser: string | null;
  planId?: string | null;
  userLocation?: { latitude: number; longitude: number } | null;
  manualStepAction?: string | null;
  onManualActionComplete?: () => void;
  resetToDefault?: boolean;
  showAllDaysOnLoad?: boolean;
  onAICommand?: (command: string, payload?: any) => void;
}



type ViewMode = "single" | "all" | "route-guidance";

export function CustomMode({
  tripData,
  onUpdate,
  currency,
  onCurrencyToggle,
  language,
  isLoggedIn,
  currentUser,
  planId,
  userLocation,
  manualStepAction,
  onManualActionComplete,
  resetToDefault,
  showAllDaysOnLoad,
  onAICommand,
}: CustomModeProps) {

  // 1. Define state constant
  const lang = language.toLowerCase() as 'en' | 'vi';
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [selectedDay, setSelectedDay] = useState<string>("1");
  const [routeGuidancePair, setRouteGuidancePair] = useState<[Destination, Destination] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localTripData, setLocalTripData] = useState(tripData);
  const [members, setMembers] = useState("");
  const [preferences, setPreferences] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isDateUserInput, setIsDateUserInput] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [routeSegmentIndex, setRouteSegmentIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [convertedDays, setConvertedDays] = useState(localTripData.days);
  const [allPlaces, setAllPlaces] = useState<any[]>([]);
  const [pendingDestination, setPendingDestination] = useState<{
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [latestAIResult, setLatestAIResult] = useState<any>(null);
  // 2. State hooks

  // 3. Utitlity functions
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
  };

  const removeDay = (dayId: string) => {
    if (localTripData.days.length === 1) {
      toast.error(t('mustHaveOneDay', lang));
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
    if (selectedDay === dayId) {
      setSelectedDay(newDays[0].id);
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

  const autoEstimateCosts = async () => {
    setIsEstimating(true);
    const multiplier = currency === "VND" ? 25000 : 1;

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (viewMode === "single") {
      // Estimate for current day
      const day = localTripData.days.find(
        (d) => d.id === selectedDay,
      );
      if (!day) {
        setIsEstimating(false);
        return;
      }

      const updatedDay = {
        ...day,
        destinations: day.destinations.map((dest) => ({
          ...dest,
          costs: dest.costs.map((cost) => ({
            ...cost,
            amount: typeof cost.amount === "string"
              ? cost.amount
              : String(Math.floor((Math.random() * 30 + 10) * multiplier)),
            originalAmount: typeof cost.amount === "string"
              ? cost.amount
              : String(Math.floor((Math.random() * 30 + 10) * multiplier)),
            originalCurrency: currency,
            detail: cost.detail || "",
          })),
        })),
      };
      updateDay(selectedDay, updatedDay);
      toast.success(t('costsEstimatedCurrentDay', lang));
    } else {
      // Estimate for all days
      const updatedDays = localTripData.days.map((day) => ({
        ...day,
        destinations: day.destinations.map((dest) => ({
          ...dest,
          costs: dest.costs.map((cost) => ({
            ...cost,
            amount: typeof cost.amount === "string"
              ? cost.amount
              : String(cost.amount), // always string
            originalAmount: typeof cost.originalAmount === "string"
              ? cost.originalAmount
              : String(cost.originalAmount), // always string
            originalCurrency: cost.originalCurrency || currency,
            detail: cost.detail || "",
          })),
        })),
      }));
      handleTripDataChange({
        ...localTripData,
        days: updatedDays,
      });
      toast.success(t('costsEstimatedAllDays', lang));
    }
    setIsEstimating(false);
  };

  const findOptimalRoute = async () => {
    const day = localTripData.days.find((d) => d.id === selectedDay);
    if (!day || day.destinations.length < 1) {
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
      ...day.destinations.map(d => ({
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

    updateDay(selectedDay, {
      ...day,
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
      toast.error(t('pleaseEnterTripName', lang));
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
        // Update planId so subsequent saves will update instead of create
        // Note: You might want to pass this back to parent component
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

  // 4. Effect hooks
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

  // Switch to View All Days when a plan is loaded from My Plans
  useEffect(() => {
    if (showAllDaysOnLoad) {
      setViewMode("all");
      setIsMapExpanded(false);
      setRouteGuidancePair(null);
    }
  }, [showAllDaysOnLoad]);

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

  // 5. Handlers
  // Handle manual step actions from User Manual
  useEffect(() => {
    if (!manualStepAction || !onManualActionComplete) return;

    const handleAction = async () => {
      switch (manualStepAction) {
        case 'add-destination': {
          // Add Ho Chi Minh and Ha Noi as sample destinations
          const day = localTripData.days.find((d) => d.id === selectedDay);
          if (!day) break;
          if (day.destinations.length > 1) break;

          const hoChiMinhGeo = await geocodeDestination("Ho Chi Minh City, Vietnam");
          const haNoiGeo = await geocodeDestination("Ha Noi, Vietnam");

          if (!hoChiMinhGeo || !haNoiGeo) {
            toast.error("Failed to geocode sample destinations.");
            return;
          }

          const hoChiMinh = makeDestinationFromGeo(hoChiMinhGeo, "Ho Chi Minh City", currency);
          const haNoi = makeDestinationFromGeo(haNoiGeo, "Ha Noi", currency);

          updateDay(selectedDay, {
            ...day,
            destinations: [...day.destinations, hoChiMinh, haNoi],
            optimizedRoute: [],
          });

          toast.success('Sample destinations added!');
          break;
        }

        case 'optimize-route': {
          // Trigger route optimization
          findOptimalRoute();
          break;
        }

        case 'create_itinerary': {
          const result = latestAIResult.itinerary;
          console.log("AI Itinerary Result:", result);
          console.log("Itinerary from backend:", result);

          if (result.trip_info) {
            if (result.trip_info.trip_name) updateTripName(result.trip_info.trip_name);
            if (result.trip_info.num_people) setMembers(String(result.trip_info.num_people));
            if (result.trip_info.start_day && !isNaN(Date.parse(result.trip_info.start_day))) {
              setStartDate(new Date(result.trip_info.start_day));
            }
            if (result.trip_info.end_day && !isNaN(Date.parse(result.trip_info.end_day))) {
              setEndDate(new Date(result.trip_info.end_day));
            }
          }

          if (
            userLocation &&
            Array.isArray(result.categories) &&
            (result.valid_starting_point === undefined || result.valid_starting_point === true)
          ) {
            const allPlaces = await generatePlaces(result, userLocation);
            console.log("Fetched places:", allPlaces);
            setAllPlaces(allPlaces);
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
          const dayIndex = latestAIResult.day;
          if (dayIndex && !isNaN(Number(dayIndex))) {
            addDayAfter(String(dayIndex));
          }
          break;
        }

        case 'update_trip_name': {
          const newName = latestAIResult.trip_name;
          if (newName && typeof newName === "string") {
            updateTripName(newName);
          }
          break;
        }

        case 'update_members': {
          const newMembers = latestAIResult.members;
          if (newMembers && !isNaN(Number(newMembers))) {
            setMembers(String(newMembers));
          }
          break;
        }

        case 'update_start_date': {
          const newStartDay = latestAIResult.start_day;
          if (newStartDay && !isNaN(Date.parse(newStartDay))) {
            setStartDate(new Date(newStartDay));
          }

          break;
        }

        case 'update_end_date': {
          const newEndDay = latestAIResult.end_day;
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
          // Delete days one by one until only one day remains
          while (localTripData.days.length > 1) {
            removeDay(localTripData.days[localTripData.days.length - 1].id);
          }
          break;
        }

        case 'swap_day': {
          const dayId1 = latestAIResult.day1;
          const dayId2 = latestAIResult.day2;
          if (dayId1 && dayId2) {
            swapDays(String(dayId1), String(dayId2));
          }
          break;
        }

        case 'delete_range_of_days': {
          const startDay = latestAIResult.start_day;
          const endDay = latestAIResult.end_day;
          if (startDay && endDay && !isNaN(Number(startDay)) && !isNaN(Number(endDay))) {
            const startIdx = Number(startDay) - 1;
            const endIdx = Number(endDay) - 1;
            const daysToDelete = localTripData.days.slice(startIdx, endIdx + 1);
            daysToDelete.forEach((day) => {
              {
                removeDay(day.id);
              }
            });
          }
          break;
        }

        case 'add_new_destination': {
          const place = latestAIResult.place;
          if (
            place &&
            typeof place === "object" &&
            place !== null &&
            place.title &&
            typeof place.title === "string"
          ) {
            const day = localTripData.days.find((d) => d.id === selectedDay);
            if (!day) break;
            const destination = {
              id: place.place_id,
              name: place.title,
              address: place.address || "",
              costs: [{
                id: `${Date.now()}-0`,
                amount: place.price || "",
                detail: "",
                originalAmount: place.price || "",
                originalCurrency: currency,
              }],
              latitude: place.gps_coordinates.latitude,
              longitude: place.gps_coordinates.longitude,
            };
            updateDay(selectedDay, {
              ...day,
              destinations: [...day.destinations, destination],
              optimizedRoute: [],
            });
            break;
          }
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

        default:
          break;
      }

      // Clear the action
      onManualActionComplete();
    };

    handleAction();
  }, [manualStepAction, onManualActionComplete, selectedDay, localTripData.days]);

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



  return (
    <div className="space-y-6">

      {/* AI Trip Generation Card */}
      <Card className="max-w-7xl p-6 mx-auto">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-[#004DB6] mb-2 font-bold">
              {t('generateYourPerfectTrip', lang)}
            </h2>
            <p className="text-gray-600 not-italic font-normal">
              {t('aiOptimizedItinerary', lang)}
            </p>
          </div>

          <div className="relative" data-tutorial="generate-plan">
            <Textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder={t('tripPreferencesPlaceholder', lang)}
              rows={6}
              className="resize-none pr-14"
            />

            <Button
              onClick={async () => {
                if (!preferences.trim()) {
                  toast.error(t('tripPreferencesRequired', lang));
                  setError(t('tripPreferencesRequired', lang));
                  return;
                }
                setIsGenerating(true);
                toast.success(t('generatingTrip', lang));
                // AI generation logic will go here
                try {
                  // Send the whole preferences text as 'paragraph'
                  const result = await detectAndExecuteGroqCommand(preferences);
                  setLatestAIResult(result);
                  console.log("AI Generation Result:", result);
                  if (result.command && onAICommand) {
                    // Example for delete_saved_plan_ith
                    if (result.command === 'delete_saved_plan_ith') {
                      onAICommand(result.command, { planIndex: result.plan_index });
                    } else if (result.command === 'find_route_of_pair_ith') {
                      onAICommand(result.command, { pairIndex: result.pair_index });
                    } else {
                      // For commands that don't need extra data
                      onAICommand(result.command);
                    }
                  }
                } catch (err) {
                  console.error("Failed to fetch itinerary:", err);
                  toast.error(t('generateFailed', lang));
                  setError(t('generateFailed', lang));
                }
                setIsGenerating(false);
              }}
              size="sm"
              className="absolute bottom-2 right-2 bg-[#004DB6] hover:bg-[#003d8f] text-white h-7 w-28"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-2 h-2 mr-1 animate-spin" />
                  {t('waiting', lang)}...
                </>
              ) : (
                <>
                  <Sparkles className="w-2 h-2 mr-1" />
                  {t('generate', lang)}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Trip Details Card */}
      <Card className="max-w-7xl p-6 mx-auto">
        <div className="space-y-4">
          {/* Trip Name & Number of Members*/}
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={localTripData.name}
              onChange={(e) => updateTripName(e.target.value)}
              placeholder={t('enterTripName', lang)}
              className="w-full"
              data-tutorial="trip-name"
            />

            <Input
              type="number"
              value={members}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  setMembers("");
                  return;
                }

                if (Number(value) > 0 && Number(value) <= 20) {
                  setMembers(String(value));
                }
              }}
              placeholder={t('numberOfMembers', lang)}
              min="1"
              max="20"
              data-tutorial="members"
            />
          </div>

          {/* Date Selection with Increment/Decrement */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative" data-tutorial="start-date">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left pr-20"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP")
                    ) : (
                      <span>{t('startDate', lang)}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setIsDateUserInput(true);
                    }}
                    disabled={(date) => {
                      // Disable dates after end date if end date is set
                      if (endDate) {
                        return date > endDate;
                      }
                      return false;
                    }}
                  />
                </PopoverContent>
              </Popover>
              <div className="absolute right-1 top-1 flex flex-col">
                <button
                  onClick={() => {
                    if (startDate) {
                      setStartDate(addDays(startDate, 1));
                      setIsDateUserInput(true);
                    }
                  }}
                  className="bg-white hover:bg-accent hover:text-accent-foreground border border-gray-300 border-b-0 rounded-t px-1.5 py-0.5"
                >
                  <ChevronUp className="w-2 h-2" />
                </button>

                <button
                  onClick={() => {
                    if (startDate) {
                      setStartDate(addDays(startDate, -1));
                      setIsDateUserInput(true);
                    }
                  }}
                  className="bg-white hover:bg-accent hover:text-accent-foreground border border-gray-300 rounded-b px-1.5 py-0.5"
                >
                  <ChevronDown className="w-2 h-2" />
                </button>
              </div>
            </div>

            <div className="relative" data-tutorial="end-date">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left pr-20"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP")
                    ) : (
                      <span>{t('endDate', lang)}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setIsDateUserInput(true);
                    }}
                    disabled={(date) => {
                      // Disable dates before start date if start date is set
                      if (startDate) {
                        return date < startDate;
                      }
                      return false;
                    }}
                  />
                </PopoverContent>
              </Popover>
              <div className="absolute right-1 top-1 flex flex-col">
                <button
                  onClick={() => {
                    if (endDate) {
                      setEndDate(addDays(endDate, 1));
                      setIsDateUserInput(true);
                    }
                  }}
                  className="bg-white hover:bg-accent hover:text-accent-foreground border border-gray-300 border-b-0 rounded-t px-1.5 py-0.5"
                >
                  <ChevronUp className="w-2 h-2" />
                </button>
                <button
                  onClick={() => {
                    if (endDate) {
                      setEndDate(addDays(endDate, -1));
                      setIsDateUserInput(true);
                    }
                  }}
                  className="bg-white hover:bg-accent hover:text-accent-foreground border border-gray-300 rounded-b px-1.5 py-0.5"
                >
                  <ChevronDown className="w-2 h-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Day Navigation */}
          <div className="flex items-center gap-2" data-tutorial="day-tabs">
            <div className="flex gap-2 overflow-x-auto pb-2 flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {localTripData.days.map((day) => (
                <Button
                  key={day.id}
                  variant={
                    selectedDay === day.id &&
                      viewMode === "single"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setSelectedDay(day.id);
                    setViewMode("single");
                  }}
                  className="relative pr-8 shrink-0 text-center"
                >
                  {t('day', lang)} {day.dayNumber}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDay(day.id);
                    }}
                    className="absolute -top-1 -right-1 bg-[rgb(198,185,189)] text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={addDay}
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('addDay', lang)}
            </Button>
            <Button
              variant={
                viewMode === "all" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setViewMode("all")}
              className="shrink-0"
              data-tutorial="view-all-days"
            >
              <Eye className="w-4 h-4 mr-1" />
              {t('viewAllDays', lang)}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={autoEstimateCosts}
            data-tutorial="auto-estimate"
            disabled={isEstimating}
          >
            {isEstimating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('estimating', lang)}...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                {viewMode === "all"
                  ? t('autoEstimateAllDays', lang)
                  : t('autoEstimateCurrentDay', lang)}
              </>
            )}
          </Button>

          {viewMode === "single" && (
            <Button
              variant="outline"
              size="sm"
              onClick={findOptimalRoute}
              disabled={isOptimizing}
              data-tutorial="optimize-route"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('optimizing', lang)}...
                </>
              ) : (
                <>
                  <Waypoints className="w-4 h-4 mr-2" />
                  {t('findOptimalRoute', lang)}
                </>
              )}
            </Button>
          )}

          {isLoggedIn && (
            <Button
              size="sm"
              onClick={savePlan}
              disabled={!hasUnsavedChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('saving', lang)}...
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('savePlan', lang)}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t('saved', lang)}
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto grid gap-6 ${isMapExpanded ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>

        {/* Left: Day/Days View */}
        {!isMapExpanded && (
          <div className="space-y-4">
            {viewMode === "single" && currentDay ? (
              <DayView
                day={convertedDays.find(d => d.id === selectedDay)!}
                onUpdate={(updatedDay) =>
                  updateDay(selectedDay, updatedDay)
                }
                currency={currency}
                onCurrencyToggle={onCurrencyToggle}
                pendingDestination={pendingDestination}
                setPendingDestination={setPendingDestination}
                generatedPlaces={allPlaces}
                language={language}
              />
            ) : (
              <AllDaysView
                days={convertedDays}
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
        )}

        {/* Right: Map */}
        <div className={`relative ${isMapExpanded ? "h-[80vh] w-full" : ""}`}>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            className="absolute top-2 right-2 z-10"
          >
            {isMapExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <MapView
            days={convertedDays}
            viewMode={viewMode}
            selectedDayId={selectedDay}
            onRouteGuidance={handleRouteGuidance}
            isExpanded={isMapExpanded}
            userLocation={userLocation}
            manualStepAction={manualStepAction}
            onManualActionComplete={onManualActionComplete}
            onMapClick={data => {
              setPendingDestination({
                name: data.name,
                latitude: data.latitude,
                longitude: data.longitude,
                address: data.address,
              });
            }}
            resetMapView={resetToDefault}
            language={language}
          />
        </div>
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