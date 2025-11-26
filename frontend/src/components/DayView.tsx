import { useEffect, useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { DayPlan, Destination, CostItem } from '../types';
import { toast } from 'sonner';
import { geocodeDestination } from '../utils/geocode';
import { convertCurrency } from '../utils/exchangerate';

interface DayViewProps {
  day: DayPlan;
  onUpdate: (day: DayPlan) => void;
  currency: 'USD' | 'VND';
  onCurrencyToggle: () => void;
  pendingDestination: {
    name: string;
    lat: number;
    lon: number;
    address: string;
  } | null;
  setPendingDestination: (dest: any) => void;
}

export function DayView({ day, onUpdate, currency, onCurrencyToggle, pendingDestination, setPendingDestination }: DayViewProps) {
  const [displayCosts, setDisplayCosts] = useState(day.destinations);

  useEffect(() => {
    const updateDisplayCosts = async () => {
      const updatedDestinations = await Promise.all(day.destinations.map(async (dest) => {
        const updatedCosts = await Promise.all(dest.costs.map(async (cost) => {
          if (cost.originalCurrency !== currency) {
            const convertedAmount = await convertCurrency(
              cost.originalAmount || 0,
              cost.originalCurrency.toLowerCase(),
              currency.toLowerCase()
            );
            return { ...cost, amount: convertedAmount };
          } else {
            return { ...cost, amount: cost.originalAmount };
          }
        }));
        return { ...dest, costs: updatedCosts };
      }));
      setDisplayCosts(updatedDestinations);
    };
    updateDisplayCosts();
  }, [currency, day.destinations]);

  const [newDestinationName, setNewDestinationName] = useState('');

  useEffect(() => {
    if (pendingDestination) {
      setNewDestinationName(pendingDestination.address || pendingDestination.name || '');
      // Optionally, clear pendingDestination after using it:
      // setPendingDestination(null);
    }
  }, [pendingDestination, setPendingDestination]);

  const addDestination = async () => {
    if (!newDestinationName.trim()) {
      toast.error('Please enter a destination name');
      return;
    }

    let geo;
    if (pendingDestination) {
      geo = {
        lat: pendingDestination.lat,
        lng: pendingDestination.lon,
        address: pendingDestination.address,
        name: pendingDestination.name,
      };
    } else {
      geo = await geocodeDestination(newDestinationName);
    }

    const destination: Destination = {
      id: Date.now().toString(),
      name: geo.address || newDestinationName,
      address: '',
      costs: [{
        id: `${Date.now()}-1`,
        amount: 0,
        detail: '',
        originalAmount: 0,
        originalCurrency: currency, // store the initial currency
      }],
      latitude: geo.lat,
      longitude: geo.lng
    };

    onUpdate({
      ...day,
      destinations: [...day.destinations, destination],
      optimizedRoute: []
    });

    setNewDestinationName('');
    setPendingDestination(null);
    toast.success('Destination added!');
  };

  const removeDestination = (id: string) => {
    onUpdate({
      ...day,
      destinations: day.destinations.filter(d => d.id !== id),
      optimizedRoute: []
    });
  };

  const updateDestination = (id: string, updates: Partial<Destination>) => {
    onUpdate({
      ...day,
      destinations: day.destinations.map(d => d.id === id ? { ...d, ...updates } : d),
      optimizedRoute: day.optimizedRoute.map(d => d.id === id ? { ...d, ...updates } : d)
    });
  };

  const addCostItem = (destinationId: string) => {
    const destination = day.destinations.find(d => d.id === destinationId);
    if (!destination) return;

    const newCost: CostItem = {
      id: `${Date.now()}-${destination.costs.length}`,
      amount: 0,
      detail: '',
      originalAmount: 0,
      originalCurrency: currency,
    };

    updateDestination(destinationId, {
      costs: [...destination.costs, newCost]
    });
  };

  const updateCostItem = (destinationId: string, costId: string, updates: Partial<CostItem>) => {
    const destination = day.destinations.find(d => d.id === destinationId);
    if (!destination) return;

    updateDestination(destinationId, {
      costs: destination.costs.map(c => c.id === costId ? { ...c, ...updates } : c)
    });
  };

  const removeCostItem = (destinationId: string, costId: string) => {
    const destination = day.destinations.find(d => d.id === destinationId);
    if (!destination || destination.costs.length === 1) {
      toast.error('Each destination must have at least one cost item');
      return;
    }

    updateDestination(destinationId, {
      costs: destination.costs.filter(c => c.id !== costId)
    });
  };

  const calculateDayTotal = () => {
    return displayCosts.reduce((total, dest) => {
      return total + dest.costs.reduce((sum, cost) => sum + (cost.amount || 0), 0);
    }, 0);
  };

  const currencySymbol = currency === 'USD' ? '$' : '₫';

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-[#004DB6]">Day {day.dayNumber}</h2>

        {/* Add Destination */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter destination name (or click on map)"
            value={newDestinationName}
            onChange={(e) => setNewDestinationName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addDestination()}
          />
          <Button onClick={addDestination}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Destinations List */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {displayCosts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No destinations yet. Add a destination or click on the map!
            </p>
          ) : (
            displayCosts.map((destination) => {
              const totalCost = destination.costs.reduce((sum, cost) => sum + (cost.amount || 0), 0);

              return (
                <div
                  key={destination.id}
                  className="border rounded-lg p-4 space-y-3 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <Input
                      value={destination.name}
                      onChange={(e) => updateDestination(destination.id, { name: e.target.value })}
                      className="flex-1 mr-2"
                      placeholder="Destination name"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDestination(destination.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  {/* Cost Items */}
                  <div className="space-y-2">
                    {destination.costs.map((cost) => (
                      <div key={cost.id} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="relative">
                            <button
                              onClick={onCurrencyToggle}
                              className="absolute left-1 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-[#DAF9D8] text-gray-700 hover:text-[#004DB6] text-xs px-2 py-1 rounded border border-gray-300 hover:border-[#70C573] transition-all cursor-pointer font-medium shadow-sm"
                            >
                              {currencySymbol}
                            </button>
                            <Input
                              type="number"
                              value={cost.amount || ''}
                              onChange={(e) => updateCostItem(destination.id, cost.id, {
                                amount: parseFloat(e.target.value) || 0,
                                originalAmount: parseFloat(e.target.value) || 0,
                                originalCurrency: currency,
                              })}
                              placeholder="0"
                              className="pl-12"
                            />
                          </div>
                          <Input
                            value={cost.detail}
                            onChange={(e) => updateCostItem(destination.id, cost.id, {
                              detail: e.target.value
                            })}
                            placeholder="Detail (e.g., entrance fee)"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCostItem(destination.id, cost.id)}
                          disabled={destination.costs.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add Cost Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCostItem(destination.id)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Cost Item
                  </Button>

                  {/* Destination Total */}
                  <div className="pt-2 border-t flex items-center justify-between text-sm">
                    <span className="text-gray-600">Destination Total:</span>
                    <span className="text-gray-900">
                      {currencySymbol}{totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Day Total */}
        {day.destinations.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between bg-[#DAF9D8] rounded-lg p-4">
              <span className="text-[#004DB6]">Day {day.dayNumber} Total:</span>
              <span className="text-[#004DB6]">
                {currencySymbol}{calculateDayTotal().toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}