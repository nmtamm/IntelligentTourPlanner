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
  userLocation
}: CustomModeProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [selectedDay, setSelectedDay] = useState<string>("1");
  const [routeGuidancePair, setRouteGuidancePair] = useState<[Destination, Destination] | null
  >(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localTripData, setLocalTripData] = useState(tripData);
  const [members, setMembers] = useState("");
  const [preferences, setPreferences] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isDateUserInput, setIsDateUserInput] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const [convertedDays, setConvertedDays] = useState(localTripData.days);

  const [pendingDestination, setPendingDestination] = useState<{
    name: string;
    lat: number;
    lon: number;
    address: string;
  } | null>(null);

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

  const autoEstimateCosts = () => {
    const multiplier = currency === "VND" ? 25000 : 1;

    if (viewMode === "single") {
      // Estimate for current day
      const day = localTripData.days.find(
        (d) => d.id === selectedDay,
      );
      if (!day) return;

      const updatedDay = {
        ...day,
        destinations: day.destinations.map((dest) => ({
          ...dest,
          costs: dest.costs.map((cost) => ({
            ...cost,
            amount: cost.amount || Math.floor((Math.random() * 30 + 10) * multiplier),
            originalAmount: cost.amount || 0.0,
            originalCurrency: currency
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
            amount: cost.amount || Math.floor((Math.random() * 30 + 10) * multiplier),
            originalAmount: cost.amount || 0.0,
            originalCurrency: currency
          })),
        })),
      }));
      handleTripDataChange({
        ...localTripData,
        days: updatedDays,
      });
      toast.success("Costs estimated for all days");
    }
  };

  const findOptimalRoute = async () => {
    const day = localTripData.days.find((d) => d.id === selectedDay);
    if (!day || day.destinations.length < 2) {
      toast.error("Add at least 2 destinations to optimize route");
      return;
    }

    // Convert to backend format
    const backendDestinations = day.destinations.map(d => ({
      lat: d.latitude ?? d.lat,
      lon: d.longitude ?? d.lng,
      name: d.name,
    }));
    const optimized = await getOptimizedRoute(backendDestinations);
    if (!optimized || !Array.isArray(optimized.optimized_route)) {
      toast.error("Failed to optimize route");
      return;
    }

    // Convert lon to lng for frontend usage
    const optimizedRoute = optimized.optimized_route.map((dest) => ({
      ...dest,
      lng: dest.lon,
    }));

    updateDay(selectedDay, {
      ...day,
      optimizedRoute,
      routeDistanceKm: optimized.distance_km,
      routeDurationMin: optimized.duration_min,
      routeGeometry: optimized.geometry,
      routeInstructions: optimized.instructions,
    });
    toast.success("Route optimized!");
  };

  const savePlan = async () => {
    if (!localTripData.name.trim()) {
      toast.error('Please enter a trip name');
      return;
    }

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
            amount: typeof cost.amount === "string" ? parseFloat(cost.amount) : cost.amount || 0.0,
            originalAmount: cost.originalAmount || 0.0,
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
  };

  const handleRouteGuidance = (day: DayPlan) => {
    setViewMode("route-guidance");
  };
  const currentDay = localTripData.days.find(
    (d) => d.id === selectedDay,
  );

  if (viewMode === "route-guidance" && currentDay) {
    return (
      <RouteGuidance
        day={currentDay}
        onBack={() => {
          setViewMode("single");
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-[#004DB6] mb-2 font-bold">
              Generate Your Perfect Trip
            </h2>
            <p className="text-gray-600 not-italic font-normal">
              Let AI create an optimized itinerary for you
            </p>
          </div>

          <div className="relative">
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
                toast.success(
                  "Generating your perfect trip plan...",
                );
                // AI generation logic will go here
                try {
                  // Send the whole preferences text as 'paragraph'
                  const result = await fetchItinerary({ paragraph: preferences });
                  console.log("Itinerary from backend:", result);
                } catch (err) {
                  console.error("Failed to fetch itinerary:", err);
                  toast.error("Failed to generate trip plan.");
                }
              }}
              size="sm"
              className="absolute bottom-2 right-2 bg-[#004DB6] hover:bg-[#003d8f] text-white h-7 w-28"
            >
              <Sparkles className="w-2 h-2 mr-1" />
              Generate
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Trip Name & Number of Members*/}
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={localTripData.name}
              onChange={(e) => updateTripName(e.target.value)}
              placeholder="Enter trip name..."
              className="w-full"
            />

            <Input
              type="number"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="Number of members"
              min="1"
            />
          </div>

          {/* Date Selection with Increment/Decrement */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
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

            <div className="relative">
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
          <div className="flex items-center gap-2">
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
            >
              <Eye className="w-4 h-4 mr-1" />
              View All Days
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={autoEstimateCosts}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Auto-Estimate Costs{" "}
              {viewMode === "all"
                ? "(All Days)"
                : "(Current Day)"}
            </Button>

            {viewMode === "single" && (
              <Button
                variant="outline"
                size="sm"
                onClick={findOptimalRoute}
              >
                <Waypoints className="w-4 h-4 mr-2" />
                Find Optimal Route
              </Button>
            )}

            {isLoggedIn && (
              <Button
                size="sm"
                onClick={savePlan}
                disabled={!hasUnsavedChanges}
              >
                {hasUnsavedChanges ? (
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
        </div>
      </Card>

      {/* Main Content */}
      <div
        className={`grid gap-6 ${isMapExpanded ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}
      >
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
            onMapClick={data => {
              setPendingDestination(data);
            }}
          />
        </div>
      </div>
    </div>
  );
}