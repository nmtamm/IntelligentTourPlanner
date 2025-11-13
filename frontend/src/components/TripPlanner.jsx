import React from 'react';

import { useState } from 'react';
import { DayPlanner } from './DayPlanner';
import { RouteMap } from './RouteMap';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function TripPlanner({ isLoggedIn, currentUser }) {
  const [tripName, setTripName] = useState('');
  const [days, setDays] = useState([
    { id: '1', dayNumber: 1, destinations: [], optimizedRoute: [] }
  ]);
  const [selectedDay, setSelectedDay] = useState('1');

  const addDay = () => {
    const newDay = {
      id: String(days.length + 1),
      dayNumber: days.length + 1,
      destinations: [],
      optimizedRoute: []
    };
    setDays([...days, newDay]);
    setSelectedDay(newDay.id);
  };

  const removeDay = (dayId) => {
    if (days.length === 1) {
      toast.error('You must have at least one day in your trip');
      return;
    }
    const newDays = days.filter(d => d.id !== dayId);
    setDays(newDays);
    if (selectedDay === dayId) {
      setSelectedDay(newDays[0].id);
    }
  };

  const updateDay = (dayId, updatedDay) => {
    setDays(days.map(d => d.id === dayId ? updatedDay : d));
  };

  const savePlan = () => {
    if (!tripName.trim()) {
      toast.error('Please enter a trip name');
      return;
    }

    const plan = {
      id: Date.now().toString(),
      name: tripName,
      days: days,
      createdAt: new Date().toISOString(),
      user: currentUser
    };

    // Save to localStorage
    const savedPlans = JSON.parse(localStorage.getItem('tourPlans') || '[]');
    savedPlans.push(plan);
    localStorage.setItem('tourPlans', JSON.stringify(savedPlans));

    toast.success('Trip plan saved successfully!');
  };

  const generateSampleTrip = () => {
    const sampleDestinations = [
      {
        id: '1',
        name: 'Eiffel Tower',
        address: 'Paris, France',
        cost: 25,
        isAutoEstimated: true,
        lat: 48.8584,
        lng: 2.2945
      },
      {
        id: '2',
        name: 'Louvre Museum',
        address: 'Paris, France',
        cost: 17,
        isAutoEstimated: true,
        lat: 48.8606,
        lng: 2.3376
      },
      {
        id: '3',
        name: 'Arc de Triomphe',
        address: 'Paris, France',
        cost: 13,
        isAutoEstimated: true,
        lat: 48.8738,
        lng: 2.2950
      },
      {
        id: '4',
        name: 'Notre-Dame Cathedral',
        address: 'Paris, France',
        cost: 10,
        isAutoEstimated: true,
        lat: 48.8530,
        lng: 2.3499
      }
    ];

    const currentDay = days.find(d => d.id === selectedDay);
    if (currentDay) {
      updateDay(selectedDay, {
        ...currentDay,
        destinations: sampleDestinations,
        optimizedRoute: []
      });
      setTripName('Paris Highlights Tour');
      toast.success('Sample trip generated!');
    }
  };

  const currentDay = days.find(d => d.id === selectedDay);

  return (
    <div className="space-y-6">
      {/* Trip Header */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="tripName">Trip Name</Label>
              <Input
                id="tripName"
                placeholder="e.g., Summer Europe Adventure"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={generateSampleTrip}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Sample
            </Button>
            {isLoggedIn && (
              <Button onClick={savePlan}>
                <Save className="w-4 h-4 mr-2" />
                Save Plan
              </Button>
            )}
          </div>

          {/* Day Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {days.map((day) => (
              <Button
                key={day.id}
                variant={selectedDay === day.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDay(day.id)}
              >
                Day {day.dayNumber}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={addDay}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Day
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Day Planner */}
        {currentDay && (
          <DayPlanner
            day={currentDay}
            onUpdate={(updatedDay) => updateDay(selectedDay, updatedDay)}
            onRemoveDay={() => removeDay(selectedDay)}
            canRemove={days.length > 1}
          />
        )}

        {/* Right: Map */}
        {currentDay && (
          <RouteMap day={currentDay} />
        )}
      </div>
    </div>
  );
}
