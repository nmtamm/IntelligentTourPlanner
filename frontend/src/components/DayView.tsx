import { useEffect, useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Trash2, DollarSign, Loader2 } from 'lucide-react';
import { DayPlan, Destination, CostItem } from '../types';
import { toast } from 'sonner';
import { parseAmount } from '../utils/parseAmount';
import { t } from '../utils/translations';
import { handleSearch, getPlaceById } from '../utils/serp';

interface DayViewProps {
  day: DayPlan;
  onUpdate: (day: DayPlan) => void;
  currency: 'USD' | 'VND';
  onCurrencyToggle: () => void;
  pendingDestination: {
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  setPendingDestination: (dest: any) => void;
  generatedPlaces?: any[];
  language: 'EN' | 'VI';
}

export function DayView({ day, onUpdate, currency, onCurrencyToggle, pendingDestination, setPendingDestination, generatedPlaces, language }: DayViewProps) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  const [newDestinationName, setNewDestinationName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    if (pendingDestination) {
      setNewDestinationName(pendingDestination.address || pendingDestination.name || '');
      // Optionally, clear pendingDestination after using it:
      // setPendingDestination(null);
    }
  }, [pendingDestination, setPendingDestination]);

  useEffect(() => {
    if (generatedPlaces && generatedPlaces.length > 0) {
      let detectedCurrency = currency;
      const newDestinations = generatedPlaces.map((place, idx) => {
        let price = place.price;
        let symbol = "";
        if (typeof price === "string") {
          // Extract first non-space character (currency symbol)
          symbol = price.trim().charAt(0);
          if (symbol === "₫" && currency !== "VND") {
            detectedCurrency = "VND";
          } else if (symbol === "$" && currency !== "USD") {
            detectedCurrency = "USD";
          }
          // Remove leading currency symbols and spaces
          price = price.replace(/^[^\d\-]+/, '').trim();
        }
        return {
          id: `${Date.now()}-${idx}`,
          name: place.title,
          address: place.address || "",
          costs: [{
            id: `${Date.now()}-${idx}`,
            amount: price,
            detail: "",
            originalAmount: price,
            originalCurrency: detectedCurrency,
          }],
          latitude: place.gps_coordinates.latitude,
          longitude: place.gps_coordinates.longitude,
        };
      });

      // If currency changed, notify parent
      if (detectedCurrency !== currency) {
        onCurrencyToggle();
      }

      onUpdate({
        ...day,
        destinations: [...day.destinations, ...newDestinations],
        optimizedRoute: [],
      });
      toast.success("Generated places added!");
    }
    // eslint-disable-next-line
  }, [generatedPlaces]);

  const addDestination = async () => {
    if (!newDestinationName.trim() || !selectedPlaceId) {
      toast.error(t('pleaseEnterDestinationName', lang));
      setError(t('pleaseEnterDestinationName', lang));
      setIsAdding(false);
      return;
    }

    console.log("Adding destination with place ID:", selectedPlaceId);
    setIsAdding(true);

    // Fetch full place info from backend
    const place = await getPlaceById(selectedPlaceId);
    if (!place) {
      setIsAdding(false);
      return;
    }

    // let geo;
    // if (pendingDestination) {
    //   geo = {
    //     latitude: pendingDestination.latitude,
    //     longitude: pendingDestination.longitude,
    //     address: pendingDestination.address,
    //     name: pendingDestination.name,
    //   };
    // } else {
    //   geo = await geocodeDestination(newDestinationName);
    // }

    // if (!geo) {
    //   toast.error(t('geocodeDestinationFailed', lang));
    //   setError(t('geocodeDestinationFailed', lang));
    //   setIsAdding(false);
    //   return;
    // }

    // Prevent duplicate addition
    // if (day.destinations.some(d =>
    //   d.name === (geo.address || newDestinationName) &&
    //   d.latitude === geo.lat &&
    //   d.longitude === geo.lng
    // )) {
    //   toast.error('This destination already exists.');
    //   return;
    // }

    // const destination = makeDestinationFromGeo(geo, newDestinationName, currency);

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

    console.log("Adding destination:", destination);
    onUpdate({
      ...day,
      destinations: [...day.destinations, destination],
      optimizedRoute: []
    });

    setNewDestinationName('');
    setPendingDestination(null);
    setSelectedPlaceId(null);
    toast.success('Destination added!');
    setIsAdding(false);
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
      amount: "",
      detail: '',
      originalAmount: "",
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
      toast.error(t('oneCostItemRequired', lang));
      setError(t('oneCostItemRequired', lang));
      return;
    }

    updateDestination(destinationId, {
      costs: destination.costs.filter(c => c.id !== costId)
    });
  };

  const onDestinationInputChange = async (value: string) => {
    setNewDestinationName(value);
    setSelectedPlaceId(null);
    if (value.trim()) {
      const results = await handleSearch(value);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  function calculateDayTotal() {
    let minTotal = 0, maxTotal = 0, isApprox = false;
    day.destinations.forEach(dest => {
      dest.costs.forEach(cost => {
        const parsed = parseAmount(cost.amount);
        minTotal += parsed.min;
        maxTotal += parsed.max;
        if (parsed.isApprox) isApprox = true;
      });
    });
    return { minTotal, maxTotal, isApprox };
  }

  const dayTotal = calculateDayTotal();
  const currencySymbol = currency === 'USD' ? 'USD' : 'VND';

  return (
    <Card className="p-6" data-tutorial-card="destinations">
      <div className="space-y-4">
        <h2 className="text-[#004DB6]">{t('day', lang)} {day.dayNumber}</h2>

        {/* Add Destination */}
        <div className="flex gap-2" data-tutorial="add-destination">
          <div style={{ position: "relative", flex: 1 }}>
            <Input
              placeholder={t('enterDestinationName', lang)}
              value={newDestinationName}
              onChange={(e) => onDestinationInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addDestination()}
            />
            {/* Autocomplete dropdown */}
            {searchResults.length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "white",
                border: "1px solid #eee",
                zIndex: 10,
                maxHeight: 200,
                overflowY: "auto"
              }}>
                {searchResults.map((result, idx) => (
                  <div
                    key={idx}
                    style={{ padding: "8px", cursor: "pointer" }}
                    onClick={() => {
                      setNewDestinationName(result.title);
                      setSelectedPlaceId(result.place_id);
                      setSearchResults([]);
                    }}
                  >
                    {result.title}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button onClick={addDestination} disabled={!selectedPlaceId || isAdding}>
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('adding', lang)}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {t('add', lang)}
              </>
            )}
          </Button>
        </div>

        {/* Destinations List */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {day.destinations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {t('noDestinationsYet', lang)}
            </p>
          ) : (
            day.destinations.map((destination) => {
              const parsedCosts = destination.costs.map(cost => parseAmount(cost.amount));
              const minTotal = parsedCosts.reduce((sum, c) => sum + c.min, 0);
              const maxTotal = parsedCosts.reduce((sum, c) => sum + c.max, 0);
              const isApprox = parsedCosts.some(c => c.isApprox);

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
                      placeholder={t('destinationName', lang)}
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
                              className="absolute right-1 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-[#DAF9D8] text-gray-700 hover:text-[#004DB6] text-xs px-2 py-1 rounded border border-gray-300 hover:border-[#70C573] transition-all cursor-pointer font-medium shadow-sm"
                            >
                              {currencySymbol}
                            </button>
                            <Input
                              type="string"
                              value={(() => {
                                const parsed = parseAmount(cost.amount);
                                return parsed.min !== parsed.max
                                  ? `${parsed.min.toLocaleString()} \u2013 ${parsed.max.toLocaleString()}`
                                  : parsed.min.toLocaleString();
                              })()}
                              onChange={(e) => updateCostItem(destination.id, cost.id, {
                                amount: e.target.value,
                                originalAmount: e.target.value,
                                originalCurrency: currency,
                              })}
                              placeholder="0"
                              className="pl-3"
                            />
                          </div>
                          <Input
                            value={cost.detail}
                            onChange={(e) => updateCostItem(destination.id, cost.id, {
                              detail: e.target.value
                            })}
                            placeholder={t('detailPlaceholder', lang)}
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
                    data-tutorial="add-cost-item"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addCostItem', lang)}
                  </Button>

                  {/* Destination Total */}
                  <div className="pt-2 border-t flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('destinationTotal', lang)}</span>
                    <span className="text-gray-900">
                      {isApprox
                        ? `${minTotal.toLocaleString()} \u2013 ${maxTotal.toLocaleString()}`
                        : minTotal.toLocaleString()}
                      {' '}{currencySymbol}
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
              <span className="text-[#004DB6]">{t('totalCost', lang)} {t('day', lang)} {day.dayNumber}</span>

              <span className="text-[#004DB6]">
                {dayTotal.isApprox
                  ? `${dayTotal.minTotal.toLocaleString()} \u2013 ${dayTotal.maxTotal.toLocaleString()}`
                  : dayTotal.minTotal.toLocaleString()}
                {' '}{currencySymbol}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card >
  );
}