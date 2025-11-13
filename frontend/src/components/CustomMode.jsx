import React from 'react';
import { useState, useEffect } from 'react';
import { DayView } from './DayView.jsx';
import { AllDaysView } from './AllDaysView.jsx';
import { MapView } from './MapView.jsx';
import { RouteGuidance } from './RouteGuidance.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Card } from './ui/card.jsx';
import { Plus, Save, Eye, Calculator, X, Check, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { optimizeRoute } from '../utils/routeOptimizer.js';
import { Calendar } from './ui/calendar.jsx';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover.jsx';
import { format, addDays, differenceInDays } from 'date-fns';

export function CustomMode({ tripData, onUpdate, currency, onCurrencyToggle, isLoggedIn, currentUser, planId }) {
  const [viewMode, setViewMode] = useState('single');
  const [selectedDay, setSelectedDay] = useState('1');
  const [routeGuidancePair, setRouteGuidancePair] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localTripData, setLocalTripData] = useState(tripData);
  const [members, setMembers] = useState('');
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [isDateUserInput, setIsDateUserInput] = useState(false);

  // Watch for changes to tripData
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [tripData]);

  // Automatically adjust number of days based on Start Date and End Date (user input)
  useEffect(() => {
    if (startDate && endDate && isDateUserInput) {
      const daysDifference = differenceInDays(endDate, startDate) + 1;

      if (daysDifference < 1) {
        toast.error('End Date must be on or after Start Date');
        return;
      }

      if (daysDifference !== localTripData.days.length) {
        const newDays = [];

        for (let i = 0; i < daysDifference; i++) {
          const existingDay = localTripData.days[i];
          newDays.push(existingDay ? {
            ...existingDay,
            id: String(i + 1),
            dayNumber: i + 1
          } : {
            id: String(i + 1),
            dayNumber: i + 1,
            destinations: [],
            optimizedRoute: []
          });
        }

        handleTripDataChange({ ...localTripData, days: newDays });
        toast.success(`Trip adjusted to ${daysDifference} day${daysDifference > 1 ? 's' : ''}`);
      }
      setIsDateUserInput(false);
    }
  }, [startDate, endDate, isDateUserInput]);

  // Sync End Date when days are manually added/removed
  useEffect(() => {
    if (startDate && !isDateUserInput) {
      const calculatedEndDate = addDays(startDate, localTripData.days.length - 1);
      setEndDate(calculatedEndDate);
    }
  }, [localTripData.days.length, startDate, isDateUserInput]);

  const handleTripDataChange = (newData) => {
    setLocalTripData(newData);
    setHasUnsavedChanges(true);
    onUpdate(newData);
  };

  const updateTripName = (name) => {
    handleTripDataChange({ ...localTripData, name });
  };

  const addDay = () => {
    const newDay = {
      id: String(localTripData.days.length + 1),
      dayNumber: localTripData.days.length + 1,
      destinations: [],
      optimizedRoute: []
    };
    handleTripDataChange({ ...localTripData, days: [...localTripData.days, newDay] });
    setSelectedDay(newDay.id);
    setViewMode('single');
  };

  const removeDay = (dayId) => {
    if (localTripData.days.length === 1) {
      toast.error('You must have at least one day in your trip');
      return;
    }
    const newDays = localTripData.days
      .filter(d => d.id !== dayId)
      .map((day, index) => ({
        ...day,
        id: String(index + 1),
        dayNumber: index + 1
      }));
    handleTripDataChange({ ...localTripData, days: newDays });
    if (selectedDay === dayId) {
      setSelectedDay(newDays[0].id);
    }
    toast.success('Day removed');
  };

  const updateDay = (dayId, updatedDay) => {
    handleTripDataChange({
      ...localTripData,
      days: localTripData.days.map(d => d.id === dayId ? updatedDay : d)
    });
  };

  const autoEstimateCosts = () => {
    const multiplier = currency === 'VND' ? 25000 : 1;

    if (viewMode === 'single') {
      // Estimate for current day
      const day = localTripData.days.find(d => d.id === selectedDay);
      if (!day) return;

      const updatedDay = {
        ...day,
        destinations: day.destinations.map(dest => ({
          ...dest,
          costs: dest.costs.map(cost => ({
            ...cost,
            amount: cost.amount || Math.floor((Math.random() * 30 + 10) * multiplier)
          }))
        }))
      };
      updateDay(selectedDay, updatedDay);
      toast.success('Costs estimated for current day');
    } else {
      // Estimate for all days
      const updatedDays = localTripData.days.map(day => ({
        ...day,
        destinations: day.destinations.map(dest => ({
          ...dest,
          costs: dest.costs.map(cost => ({
            ...cost,
            amount: cost.amount || Math.floor((Math.random() * 30 + 10) * multiplier)
          }))
        }))
      }));
      handleTripDataChange({ ...localTripData, days: updatedDays });
      toast.success('Costs estimated for all days');
    }
  };

  const findOptimalRoute = () => {
    const day = localTripData.days.find(d => d.id === selectedDay);
    if (!day || day.destinations.length < 2) {
      toast.error('Add at least 2 destinations to optimize route');
      return;
    }

    const optimized = optimizeRoute(day.destinations);
    updateDay(selectedDay, { ...day, optimizedRoute: optimized });
    toast.success('Route optimized!');
  };

  const savePlan = () => {
    if (!localTripData.name.trim()) {
      toast.error('Please enter a trip name');
      return;
    }

    const savedPlans = JSON.parse(localStorage.getItem('tourPlans') || '[]');

    if (planId) {
      // Update existing plan
      const planIndex = savedPlans.findIndex((p) => p.id === planId);
      if (planIndex !== -1) {
        savedPlans[planIndex] = {
          ...savedPlans[planIndex],
          name: localTripData.name,
          days: localTripData.days,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('tourPlans', JSON.stringify(savedPlans));
        setHasUnsavedChanges(false);
        toast.success('Trip plan updated successfully!');
      } else {
        toast.error('Plan not found');
      }
    } else {
      // Create new plan
      const plan = {
        id: Date.now().toString(),
        name: localTripData.name,
        days: localTripData.days,
        createdAt: new Date().toISOString(),
        user: currentUser
      };
      savedPlans.push(plan);
      localStorage.setItem('tourPlans', JSON.stringify(savedPlans));
      setHasUnsavedChanges(false);
      toast.success('Trip plan saved successfully!');
    }
  };

  const handleRouteGuidance = (from, to) => {
    setRouteGuidancePair([from, to]);
    setViewMode('route-guidance');
  };

  if (viewMode === 'route-guidance' && routeGuidancePair) {
    return (
      <RouteGuidance
        from={routeGuidancePair[0]}
        to={routeGuidancePair[1]}
        onBack={() => {
          setViewMode('single');
          setRouteGuidancePair(null);
        }}
      />
    );
  }

  const currentDay = localTripData.days.find(d => d.id === selectedDay);

  return (
    <div className="space-y-6">
      {/* Trip Name */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Trip Name and Members */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={localTripData.name}
              onChange={(e) => updateTripName(e.target.value)}
              placeholder="Enter trip name..."
              className="text-xl"
            />
            <Input
              type="number"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="Number of members"
              min="1"
            />
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Start Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setIsDateUserInput(true);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>End Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setIsDateUserInput(true);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Day Navigation */}
          <div className="flex items-center gap-2">
            <div className="flex gap-2 overflow-x-auto pb-2 flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {localTripData.days.map((day) => (
                <Button
                  key={day.id}
                  variant={selectedDay === day.id && viewMode === 'single' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedDay(day.id);
                    setViewMode('single');
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
              variant={viewMode === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('all')}
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
              Auto-Estimate Costs {viewMode === 'all' ? '(All Days)' : '(Current Day)'}
            </Button>

            {viewMode === 'single' && (
              <Button
                variant="outline"
                size="sm"
                onClick={findOptimalRoute}
              >
                Find Optimal Route
              </Button>
            )}

            {isLoggedIn && (
              <Button size="sm" onClick={savePlan} disabled={!hasUnsavedChanges}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Day/Days View */}
        <div className="space-y-4">
          {viewMode === 'single' && currentDay ? (
            <DayView
              day={currentDay}
              onUpdate={(updatedDay) => updateDay(selectedDay, updatedDay)}
              currency={currency}
              onCurrencyToggle={onCurrencyToggle}
            />
          ) : (
            <AllDaysView
              days={localTripData.days}
              onUpdate={(updatedDays) => handleTripDataChange({ ...localTripData, days: updatedDays })}
              currency={currency}
              onCurrencyToggle={onCurrencyToggle}
            />
          )}
        </div>

        {/* Right: Map */}
        <MapView
          days={localTripData.days}
          viewMode={viewMode}
          selectedDayId={selectedDay}
          onRouteGuidance={handleRouteGuidance}
        />
      </div>
    </div>
  );
}
