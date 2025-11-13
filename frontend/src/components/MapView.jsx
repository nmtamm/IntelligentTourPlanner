import React from 'react';
import { useState } from 'react';
import { Card } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { MapPin, Navigation, X, Map, List } from 'lucide-react';

export function MapView({ days, viewMode, selectedDayId, onRouteGuidance }) {
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [mapListView, setMapListView] = useState('map');
    const [selectedPairIndex, setSelectedPairIndex] = useState(null);

    // Get destinations based on view mode
    const getDestinations = () => {
        if (viewMode === 'single') {
            const day = days.find(d => d.id === selectedDayId);
            return day?.optimizedRoute.length ? day.optimizedRoute : day?.destinations || [];
        } else {
            return days.flatMap(d => d.destinations);
        }
    };

    const destinations = getDestinations();
    const currentDay = days.find(d => d.id === selectedDayId);
    const hasOptimizedRoute = viewMode === 'single' && currentDay && currentDay.optimizedRoute.length > 0;

    // Calculate map bounds
    if (destinations.length === 0) {
        return (
            <Card className="p-6 h-[700px] flex items-center justify-center sticky top-6">
                <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Add destinations to see them on the map</p>
                </div>
            </Card>
        );
    }

    const lats = destinations.map(d => d.lat);
    const lngs = destinations.map(d => d.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const mapWidth = 700;
    const mapHeight = 600;
    const padding = 60;

    const latRange = maxLat - minLat || 0.1;
    const lngRange = maxLng - minLng || 0.1;

    const toMapX = (lng) => {
        return padding + ((lng - minLng) / lngRange) * (mapWidth - 2 * padding);
    };

    const toMapY = (lat) => {
        return mapHeight - (padding + ((lat - minLat) / latRange) * (mapHeight - 2 * padding));
    };

    // Generate route pairs
    const getRoutePairs = () => {
        if (!hasOptimizedRoute || !currentDay) return [];
        const route = currentDay.optimizedRoute;
        const pairs = [];
        for (let i = 0; i < route.length - 1; i++) {
            pairs.push([route[i], route[i + 1]]);
        }
        return pairs;
    };

    const routePairs = getRoutePairs();

    return (
        <Card className="p-6 sticky top-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-gray-900">{mapListView === 'map' ? 'Map View' : 'Route List'}</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasOptimizedRoute}
                        onClick={() => {
                            setMapListView(mapListView === 'map' ? 'list' : 'map');
                            setSelectedPairIndex(null);
                        }}
                        className="bg-[rgb(255,255,255)] text-[rgb(0,0,0)] hover:bg-gray-50"
                    >
                        {mapListView === 'map' ? (
                            <>
                                <List className="w-4 h-4 mr-2" />
                                List View
                            </>
                        ) : (
                            <>
                                <Map className="w-4 h-4 mr-2" />
                                Map View
                            </>
                        )}
                    </Button>
                </div>

                {/* List View */}
                {mapListView === 'list' && hasOptimizedRoute && (
                    <div className="space-y-3">
                        <div className="bg-[#DAF9D8] rounded-lg p-4">
                            <p className="text-sm text-[#004DB6] mb-3">Click on a route segment to navigate:</p>
                            <div className="space-y-2">
                                {routePairs.map((pair, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <Button
                                            variant={selectedPairIndex === idx ? 'default' : 'outline'}
                                            className="w-full justify-start text-left h-auto py-3"
                                            onClick={() => setSelectedPairIndex(selectedPairIndex === idx ? null : idx)}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <span className="bg-[#DAF9D8] text-[#004DB6] rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm truncate">{pair[0].name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">↓</div>
                                                    <div className="text-sm truncate">{pair[1].name}</div>
                                                </div>
                                                <Navigation className="w-4 h-4 shrink-0" />
                                            </div>
                                        </Button>

                                        {selectedPairIndex === idx && (
                                            <Button
                                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => onRouteGuidance(pair[0], pair[1])}
                                            >
                                                <Navigation className="w-4 h-4 mr-2" />
                                                Go - Start Navigation
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 text-center">
                            {routePairs.length} route segment{routePairs.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}

                {/* Map View */}
                {mapListView === 'map' && (
                    <>
                        {/* Map */}
                        <div className="bg-gray-50 rounded-lg overflow-hidden border relative">
                            <svg
                                viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                                className="w-full h-auto"
                                style={{ maxHeight: '550px' }}
                            >
                                {/* Background */}
                                <rect width={mapWidth} height={mapHeight} fill="#f0f9ff" />

                                {/* Grid */}
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <g key={i} opacity="0.1">
                                        <line
                                            x1={i * (mapWidth / 10)}
                                            y1={0}
                                            x2={i * (mapWidth / 10)}
                                            y2={mapHeight}
                                            stroke="#94a3b8"
                                            strokeWidth="1"
                                        />
                                        <line
                                            x1={0}
                                            y1={i * (mapHeight / 10)}
                                            x2={mapWidth}
                                            y2={i * (mapHeight / 10)}
                                            stroke="#94a3b8"
                                            strokeWidth="1"
                                        />
                                    </g>
                                ))}

                                {/* Route Lines */}
                                {hasOptimizedRoute && currentDay && currentDay.optimizedRoute.map((dest, idx) => {
                                    if (idx === 0) return null;
                                    const prev = currentDay.optimizedRoute[idx - 1];
                                    return (
                                        <line
                                            key={`line-${dest.id}`}
                                            x1={toMapX(prev.lng)}
                                            y1={toMapY(prev.lat)}
                                            x2={toMapX(dest.lng)}
                                            y2={toMapY(dest.lat)}
                                            stroke="#6366f1"
                                            strokeWidth="3"
                                            strokeDasharray="5,5"
                                            opacity="0.6"
                                        />
                                    );
                                })}

                                {/* Destination Markers */}
                                {destinations.map((dest, idx) => {
                                    const x = toMapX(dest.lng);
                                    const y = toMapY(dest.lat);
                                    const isSelected = selectedDestination?.id === dest.id;

                                    return (
                                        <g
                                            key={dest.id}
                                            onClick={() => setSelectedDestination(dest)}
                                            className="cursor-pointer"
                                        >
                                            {/* Marker Pin */}
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r={isSelected ? "12" : "10"}
                                                fill="white"
                                                stroke={isSelected ? "#f59e0b" : hasOptimizedRoute ? "#6366f1" : "#10b981"}
                                                strokeWidth={isSelected ? "4" : "3"}
                                            />
                                            {hasOptimizedRoute && (
                                                <text
                                                    x={x}
                                                    y={y + 1}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    fontSize="10"
                                                    fill="#6366f1"
                                                    className="pointer-events-none"
                                                >
                                                    {idx + 1}
                                                </text>
                                            )}

                                            {/* Label */}
                                            <text
                                                x={x}
                                                y={y - 18}
                                                textAnchor="middle"
                                                fontSize="11"
                                                fill="#1e293b"
                                                className="pointer-events-none"
                                            >
                                                {dest.name.length > 15 ? dest.name.substring(0, 15) + '...' : dest.name}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Selected Destination Details */}
                            {selectedDestination && (
                                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-gray-900">{selectedDestination.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">{selectedDestination.address}</p>
                                            <div className="mt-2 space-y-1">
                                                {selectedDestination.costs.map((cost) => (
                                                    <div key={cost.id} className="text-sm text-gray-600">
                                                        {cost.detail && `${cost.detail}: `}
                                                        <span className="text-gray-900">${cost.amount}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedDestination(null)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Map Info */}
                        <div className="text-sm text-gray-600 flex items-center justify-between">
                            <span>{destinations.length} destination{destinations.length !== 1 ? 's' : ''}</span>
                            {viewMode === 'all' && (
                                <span className="text-[#004DB6]">Showing all days</span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
}
