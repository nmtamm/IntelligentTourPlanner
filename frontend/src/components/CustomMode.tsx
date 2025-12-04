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
import { format, addDays, differenceInDays } from "date-fns";
import { createTrip, updateTrip } from '../api.js';
import { getOptimizedRoute } from "../utils/geocode";
import { fetchItinerary } from "../utils/gemini";
import { data } from "react-router-dom";
import { convertCurrency, convertAllDays } from "../utils/exchangerate";
import { generatePlaces } from "../utils/serp";
import { geocodeDestination } from "../utils/geocode";
import { makeDestinationFromGeo } from "../utils/destinationFactory";

interface CustomModeProps {
  tripData: { name: string; days: DayPlan[] };
  onUpdate: (data: { name: string; days: DayPlan[] }) => void;
  currency: "USD" | "VND";
  onCurrencyToggle: () => void;
  language: "EN" | "VI";
  isLoggedIn: boolean;
  currentUser: string | null;
  planId?: string | null;
  userLocation?: { lat: number; lng: number } | null;
  manualStepAction?: string | null;
  onManualActionComplete?: () => void;
  resetToDefault?: boolean;
  showAllDaysOnLoad?: boolean;
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
}: CustomModeProps) {
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

  const [convertedDays, setConvertedDays] = useState(localTripData.days);

  const [allPlaces, setAllPlaces] = useState<any[]>([]);
  const [pendingDestination, setPendingDestination] = useState<{
    name: string;
    lat: number;
    lon: number;
    address: string;
  } | null>(null);

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

      if (daysDifference < 1) {
        toast.error("End Date must be on or after Start Date");
        return;
      }

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
          `Trip adjusted to ${daysDifference} day${daysDifference > 1 ? "s" : ""}`,
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

        default:
          break;
      }

      // Clear the action
      onManualActionComplete();
    };

    handleAction();
  }, [manualStepAction, onManualActionComplete, selectedDay, localTripData.days]);


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
      toast.error(
        "You must have at least one day in your trip",
      );
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
    toast.success("Day removed");
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
      toast.success("Costs estimated for current day");
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
      toast.success("Costs estimated for all days");
    }
    setIsEstimating(false);
  };

  const findOptimalRoute = async () => {
    const day = localTripData.days.find((d) => d.id === selectedDay);
    if (!day || day.destinations.length < 2) {
      toast.error("Add at least 2 destinations to optimize route");
      return;
    }

    setIsOptimizing(true);

    // Convert to backend format
    const backendDestinations = [
      userLocation
        ? {
          lat: userLocation.lat,
          lon: userLocation.lng,
          name: "User Location",
        }
        : null,
      ...day.destinations.map(d => ({
        lat: d.latitude ?? d.lat,
        lon: d.longitude ?? d.lng,
        name: d.name,
      })),
    ].filter(Boolean) as { lat: number; lon: number; name: string }[];

    const optimized = await getOptimizedRoute(backendDestinations);
    if (!optimized || !Array.isArray(optimized.optimized_route)) {
      toast.error("Failed to optimize route");
      return;
    }

    // Convert lon to lng for frontend usage
    const optimizedRoute = optimized.optimized_route.map((dest) => {
      const latitude = dest.latitude ?? dest.lat;
      const longitude = dest.longitude ?? dest.lon;

      return {
        ...dest,
        lat: latitude,
        lng: longitude,
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
    toast.success("Route optimized!");
    setIsOptimizing(false);
  };

  const savePlan = async () => {
    if (!localTripData.name.trim()) {
      toast.error('Please enter a trip name');
      return;
    }

    setIsSaving(true);

    if (!isLoggedIn) {
      toast.error('Please login to save your trip plan');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please login again.');
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
          latitude: dest.lat || dest.latitude || null,
          longitude: dest.lng || dest.longitude || null,
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
        toast.success('Trip plan updated successfully!');
        console.log('Updated trip:', updated);
      } else {
        // Create new plan
        const created = await createTrip(tripDataForAPI, token);
        setHasUnsavedChanges(false);
        toast.success('Trip plan saved successfully!');
        console.log('Created trip:', created);
        // Update planId so subsequent saves will update instead of create
        // Note: You might want to pass this back to parent component
      }
    } catch (error) {
      const err = error as any;
      console.error('Error saving trip:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to save trip plan. Please try again.');
      }
    }

    setIsSaving(false);
  };

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
              Generate Your Perfect Trip
            </h2>
            <p className="text-gray-600 not-italic font-normal">
              Let AI create an optimized itinerary for you
            </p>
          </div>

          <div className="relative" data-tutorial="generate-plan">
            <Textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Tell us about your dream trip and your travel constraints so we can plan it perfectly for you!
You can mention some details below to help us design a better plan for you:
      🌍 Where would you like to go?
      🗓️ How long will your trip be?
      💰 What's your budget?
      👥 How many people are traveling?"
              rows={6}
              className="resize-none pr-14"
            />

            <Button
              onClick={async () => {
                if (!preferences.trim()) {
                  toast.error(
                    "Please tell us about your trip preferences first!",
                  );
                  return;
                }
                setIsGenerating(true);
                toast.success(
                  "Generating your perfect trip plan...",
                );
                // AI generation logic will go here
                try {
                  // Send the whole preferences text as 'paragraph'
                  const result = await fetchItinerary({ paragraph: preferences });
                  console.log("Itinerary from backend:", result);

                  if (userLocation && Array.isArray(result.categories)) {
                    const allPlaces = await generatePlaces(result, userLocation);
                    console.log("Fetched places:", allPlaces);
                    setAllPlaces(allPlaces);
                  }

                } catch (err) {
                  console.error("Failed to fetch itinerary:", err);
                  toast.error("Failed to generate trip plan.");
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
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-2 h-2 mr-1" />
                  Generate
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
              placeholder="Enter trip name..."
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
              placeholder="Number of members"
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
                      <span>Start Date</span>
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
                      <span>End Date</span>
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
                  Day {day.dayNumber}
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
              Add Day
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
              View All Days
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
                Estimating...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Auto-Estimate Costs{" "}
                {viewMode === "all"
                  ? "(All Days)"
                  : "(Current Day)"}
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
                  Optimizing...
                </>
              ) : (
                <>
                  <Waypoints className="w-4 h-4 mr-2" />
                  Find Optimal Route
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
                  Saving...
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Plan
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved!
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
              setPendingDestination(data);
            }}
            resetMapView={resetToDefault}
          />
        </div>
      </div>
    </div>
  );
}