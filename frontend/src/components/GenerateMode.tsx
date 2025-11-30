import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DayPlan, Destination, CostItem } from '../types';

interface GenerateModeProps {
  onGenerate: (plan: { name: string; days: DayPlan[] }) => void;
  currency: 'USD' | 'VND';
  onCurrencyToggle: () => void;
}

export function GenerateMode({ onGenerate, currency, onCurrencyToggle }: GenerateModeProps) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [budget, setBudget] = useState('');
  const [members, setMembers] = useState('');
  const [preferences, setPreferences] = useState('');

  const handleGenerate = () => {
    if (!destination.trim()) {
      toast.error('Please enter a destination');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    if (startDate > endDate) {
      toast.error('End date must be after start date');
      return;
    }

    // Calculate number of days
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Generate sample plan based on inputs
    const sampleDestinations = generateSampleDestinations(destination, currency);
    const days: DayPlan[] = [];

    for (let i = 0; i < dayCount; i++) {
      const dayDestinations = sampleDestinations.slice(i * 3, (i + 1) * 3);
      days.push({
        id: String(i + 1),
        dayNumber: i + 1,
        destinations: dayDestinations,
        optimizedRoute: []
      });
    }

    const plan = {
      name: `${destination} Trip - ${format(startDate, 'MMM d')} to ${format(endDate, 'MMM d')}`,
      days
    };

    onGenerate(plan);
    toast.success('Trip plan generated!');
  };

  const currencySymbol = currency === 'USD' ? '$' : '₫';
  const currencyMultiplier = currency === 'VND' ? 25000 : 1;

  return (
    <Card className="p-8 max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-[#004DB6] mb-2">Generate Your Perfect Trip</h2>
          <p className="text-gray-600">Let AI create an optimized itinerary for you</p>
        </div>

        {/* Destination Input */}
        <div className="space-y-2">
          <Label htmlFor="destination">Destination (City or Region)</Label>
          <Input
            id="destination"
            placeholder="e.g., Paris, Tokyo, Southeast Asia"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Total Budget and Members */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget ({currency})</Label>
            <div className="relative">
              <button
                onClick={onCurrencyToggle}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-[#DAF9D8] text-gray-700 hover:text-[#004DB6] text-xs px-2 py-1 rounded border border-gray-300 hover:border-[#70C573] transition-all cursor-pointer font-medium shadow-sm"
              >
                {currencySymbol}
              </button>
              <Input
                id="budget"
                type="number"
                placeholder="Enter total budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="members">Number of Members</Label>
            <Input
              id="members"
              type="number"
              placeholder="Enter number of members"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              min="1"
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <Label htmlFor="preferences">Preferences & Details</Label>
          <Textarea
            id="preferences"
            placeholder="Enter your preferences (e.g., love museums and historical sites, prefer budget accommodations, enjoy local cuisine, avoid crowded places)"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            rows={4}
          />
        </div>

        {/* Generate Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleGenerate}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Trip Plan
        </Button>
      </div>
    </Card>
  );
}

// Helper function to generate sample destinations
function generateSampleDestinations(region: string, currency: 'USD' | 'VND'): Destination[] {
  const multiplier = currency === 'VND' ? 25000 : 1;

  const samplePlaces = [
    { name: 'Historic Museum', type: 'museum' },
    { name: 'City Cathedral', type: 'landmark' },
    { name: 'Central Park', type: 'park' },
    { name: 'Art Gallery', type: 'museum' },
    { name: 'Local Market', type: 'market' },
    { name: 'Observation Tower', type: 'landmark' },
    { name: 'Botanical Garden', type: 'park' },
    { name: 'Old Town Square', type: 'landmark' },
    { name: 'Science Museum', type: 'museum' },
  ];

  return samplePlaces.map((place, idx) => {
    const costItems: CostItem[] = [
      {
        id: `${idx}-1`,
        amount: String(Math.floor((Math.random() * 30 + 10) * multiplier)),
        originalAmount: String(Math.floor((Math.random() * 30 + 10) * multiplier)),
        originalCurrency: currency,
        detail: 'Entrance fee'
      }
    ];

    return {
      id: String(idx + 1),
      name: `${region} ${place.name}`,
      address: `${region} City Center`,
      costs: costItems,
      lat: 48.8566 + (Math.random() - 0.5) * 0.1,
      lng: 2.3522 + (Math.random() - 0.5) * 0.1,
      latitude: 48.8566 + (Math.random() - 0.5) * 0.1,
      longitude: 2.3522 + (Math.random() - 0.5) * 0.1,
    };
  });
}