import React, { useRef, useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { DayPlan, Destination } from "../types";
import { MapPin, Navigation, X, Map, List } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent, Polyline } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';

interface MapViewProps {
  days: DayPlan[];
  viewMode: "single" | "all" | "route-guidance";
  selectedDayId: string;
  onRouteGuidance: (day: DayPlan) => void;
  onMapClick?: (data: { lat: number; lon: number; name: string; address: string }) => void;
}

function FitBounds({ bounds }) {
  const map = useMap();
  React.useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

function MapClickHandler({ onClick }) {
  useMapEvent("click", async (e) => {
    const { lat, lng } = e.latlng;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    const name = data.name || data.display_name;
    const address = data.display_name;
    onClick({ lat, lon: lng, name, address });
  });
  return null;
}

export function MapView({
  days,
  viewMode,
  selectedDayId,
  onRouteGuidance,
  isExpanded,
  userLocation,
  onMapClick
}: MapViewProps & { isExpanded?: boolean; userLocation?: { lat: number; lng: number } | null }) {
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [mapListView, setMapListView] = useState<
    "map" | "list"
  >("map");
  const [selectedPairIndex, setSelectedPairIndex] = useState<
    number | null
  >(null);

  const currentDay = days.find((d) => d.id === selectedDayId);
  const hasOptimizedRoute =
    viewMode === "single" &&
    currentDay &&
    currentDay.optimizedRoute.length > 0;

  const mapRef = useRef<any>(null);

  // Get destinations based on view mode
  const getDestinations = () => {
    if (viewMode === "single") {
      const day = days.find((d) => d.id === selectedDayId);
      return day?.optimizedRoute.length
        ? day.optimizedRoute
        : day?.destinations || [];
    } else {
      return days.flatMap((d) => d.destinations);
    }
  };

  const destinations = getDestinations();

  const validDestinations = destinations.filter(
    d =>
      typeof d.latitude === "number" &&
      typeof d.longitude === "number" &&
      !isNaN(d.latitude) &&
      !isNaN(d.longitude)
  );

  const routeCoords = hasOptimizedRoute && currentDay && currentDay.routeGeometry
    ? polyline.decode(currentDay.routeGeometry)
    : [];

  const allCoords = [
    ...validDestinations.map(d => [d.latitude, d.longitude]),
    ...routeCoords
  ].filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

  const bounds = allCoords.length
    ? [
      [Math.min(...allCoords.map(([lat]) => lat)), Math.min(...allCoords.map(([_, lng]) => lng))],
      [Math.max(...allCoords.map(([lat]) => lat)), Math.max(...allCoords.map(([_, lng]) => lng))]
    ]
    : undefined;

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 0);
    }
  }, [isExpanded]);

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

  const lats = destinations.map((d) => d.lat);
  const lngs = destinations.map((d) => d.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  const mapWidth = 700;
  const mapHeight = 600;
  const padding = 60;
  const defaultCenter: [number, number] = [10.770048, 106.699707];
  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;
  const latRange = maxLat - minLat || 0.1;
  const lngRange = maxLng - minLng || 0.1;

  const toMapX = (lng: number) => {
    return (
      padding +
      ((lng - minLng) / lngRange) * (mapWidth - 2 * padding)
    );
  };

  const toMapY = (lat: number) => {
    return (
      mapHeight -
      (padding +
        ((lat - minLat) / latRange) * (mapHeight - 2 * padding))
    );
  };

  // Generate route pairs
  const getRoutePairs = (): Array<
    [Destination, Destination]
  > => {
    if (!hasOptimizedRoute || !currentDay) return [];
    const route = currentDay.optimizedRoute;
    const pairs: Array<[Destination, Destination]> = [];
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
          <Button
            variant="ghost"
            onClick={() =>
              setMapListView(
                mapListView === "map" ? "list" : "map",
              )
            }
            className="text-gray-900 hover:bg-accent px-2 py-1 h-auto font-semibold text-[16px]"
          >
            {mapListView === "map" ? (
              <>
                <Map className="w-4 h-4 mr-2" />
                Map View
              </>
            ) : (
              <>
                <List className="w-4 h-4 mr-2" />
                Route List
              </>
            )}
          </Button>
        </div>

        {/* List View */}
        {mapListView === "list" && hasOptimizedRoute && (
          <div className="space-y-3">
            <div className="bg-[#DAF9D8] rounded-lg p-4">
              <p className="text-sm text-[#004DB6] mb-3">
                Click on a route segment to navigate:
              </p>
              <div className="space-y-2">
                {currentDay.optimizedRoute.slice(0, -1).map((from, idx) => {
                  const to = currentDay.optimizedRoute[idx + 1];
                  return (
                    <div key={idx} className="space-y-2">
                      <Button
                        variant={selectedPairIndex === idx ? "default" : "outline"}
                        className="w-full justify-start text-left h-auto py-3"
                        onClick={() =>
                          setSelectedPairIndex(selectedPairIndex === idx ? null : idx)
                        }
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className="bg-[#DAF9D8] text-[#004DB6] rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{from.name}</div>
                            <div className="text-xs text-gray-500 mt-1">↓</div>
                            <div className="text-sm truncate">{to.name}</div>
                          </div>
                          <Navigation className="w-4 h-4 shrink-0" />
                        </div>
                      </Button>

                      {selectedPairIndex === idx && (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => onRouteGuidance(currentDay)}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Go - Start Navigation
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-sm text-gray-600 text-center">
              {currentDay.optimizedRoute.length - 1} route segment
              {currentDay.optimizedRoute.length - 1 !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Map View */}
        {mapListView === "map" && (
          <>
            {/* Map */}
            <div className="rounded-lg overflow-hidden border relative">
              <div className="leaflet-container" style={{ height: "550px", width: "100%" }}>
                <MapContainer
                  ref={mapRef}
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <MapClickHandler onClick={onMapClick} />

                  <FitBounds bounds={bounds} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {
                    hasOptimizedRoute && currentDay && currentDay.routeGeometry && (
                      <>
                        <Polyline
                          positions={polyline.decode(currentDay.routeGeometry).filter(
                            ([lat, lng]) => !isNaN(lat) && !isNaN(lng)
                          )}
                          color="#004DB6"
                          weight={3}
                          opacity={1}
                        />
                      </>
                    )
                  }
                  {
                    destinations
                      .filter(loc =>
                        typeof loc.latitude === "number" &&
                        typeof loc.longitude === "number" &&
                        !isNaN(loc.latitude) &&
                        !isNaN(loc.longitude)
                      )
                      .map((loc, idx) => (
                        <Marker
                          key={idx}
                          position={[loc.latitude, loc.longitude]}
                        >
                          <Popup>{loc.name}</Popup>
                        </Marker>
                      ))
                  }
                </MapContainer>
              </div>


              {/* Selected Destination Details */}
              {selectedDestination && (
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-gray-900">
                        {selectedDestination.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedDestination.address}
                      </p>
                      <div className="mt-2 space-y-1">
                        {selectedDestination.costs.map(
                          (cost) => (
                            <div
                              key={cost.id}
                              className="text-sm text-gray-600"
                            >
                              {cost.detail &&
                                `${cost.detail}: `}
                              <span className="text-gray-900">
                                ${cost.amount}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedDestination(null)
                      }
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Map Info */}
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>
                {destinations.length} destination
                {destinations.length !== 1 ? "s" : ""}
              </span>
              {viewMode === "all" && (
                <span className="text-[#004DB6]">
                  Showing all days
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </Card >
  );
}