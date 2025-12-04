import React, { useRef, useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { DayPlan, Destination } from "../types";
import { MapPin, Navigation, X, Map, List } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent, Polyline } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';
import { reverseGeocode } from "../utils/reverseGeocode";
import { parseAmount } from "../utils/parseAmount";
import { toast } from "sonner";
import { t } from '../utils/translations';

interface MapViewProps {
  days: DayPlan[];
  viewMode: "single" | "all" | "route-guidance";
  selectedDayId: string;
  onRouteGuidance: (day: DayPlan, idx: number) => void;
  onMapClick?: (data: { latitude: number; longitude: number; name: string; address: string }) => void;
  manualStepAction?: string | null;
  onManualActionComplete?: () => void;
  resetMapView?: boolean;
  language: 'EN' | 'VI';
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
    const { name, address } = await reverseGeocode(lat, lng);
    onClick({ latitude: lat, longitude: lng, name, address });
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
  onMapClick,
  manualStepAction,
  onManualActionComplete,
  resetMapView,
  language,
}: MapViewProps & { isExpanded?: boolean; userLocation?: { latitude: number; longitude: number } | null }) {

  const lang = language.toLowerCase() as 'en' | 'vi';
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const currentDay = days.find((d) => d.id === selectedDayId);
  const hasOptimizedRoute = viewMode === "single" && currentDay && currentDay.optimizedRoute.length > 0;

  const [mapListView, setMapListView] = useState<"map" | "list">(hasOptimizedRoute ? "list" : "map");
  const [selectedPairIndex, setSelectedPairIndex] = useState<number | null>(null);

  const mapRef = useRef<any>(null);

  // Reset to map view when resetMapView is triggered
  useEffect(() => {
    if (resetMapView) {
      setMapListView("map");
      setSelectedDestination(null);
      setSelectedPairIndex(null);
    }
  }, [resetMapView]);

  // Determine destinations to display based on view mode
  const getDestinations = () => {
    if (viewMode === "single") {
      const day = days.find((d) => d.id === selectedDayId);
      if (day?.optimizedRoute.length) {
        // Show all destinations, including user location if present
        return day.optimizedRoute;
      }
      // Exclude user location from display if present
      return (day?.destinations || [])
        .filter(dest =>
          !(
            userLocation &&
            dest.latitude === userLocation.latitude &&
            dest.longitude === userLocation.longitude
          )
        );
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

  // Calculate bounds to fit all markers and route
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

  // Determine map center
  const defaultCenter: [number, number] = [10.770048, 106.699707];
  const mapCenter: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : defaultCenter;

  // Handle map resize on expansion change
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 0);
    }
  }, [isExpanded]);

  // Handle manual step actions from User Manual
  useEffect(() => {
    if (!manualStepAction || !onManualActionComplete) return;

    const handleAction = async () => {
      switch (manualStepAction) {
        case 'map-view': {
          // Switch to Route List view
          if (hasOptimizedRoute) {
            setMapListView('list');
            setSelectedPairIndex(0);
            await new Promise(resolve => setTimeout(resolve, 100));
            toast.success('Switched to Route List view!');
          } else {
            toast.info('Optimize a route first to see the Route List');
          }
          break;
        }

        case 'route-list': {
          // Choose the first route
          if (currentDay && currentDay.optimizedRoute.length > 0) {
            onRouteGuidance(currentDay, 0);
            toast.success('Choose the first route!');
          } else {
            toast.info('No routes available');
          }
          break;
        }

        default:
          break;
      }

      // Clear the action
      onManualActionComplete();
    };

    handleAction();
  }, [manualStepAction, onManualActionComplete, hasOptimizedRoute, currentDay, onRouteGuidance]);


  return (
    <Card className="p-6 sticky top-6" data-tutorial-card="map">
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
            data-tutorial="map-view"
          >
            {mapListView === "map" ? (
              <>
                <Map className="w-4 h-4 mr-2" />
                {t('mapView', lang)}
              </>
            ) : (
              <>
                <List className="w-4 h-4 mr-2" />
                {t('routeList', lang)}
              </>
            )}
          </Button>
        </div>

        {/* List View */}
        {mapListView === "list" && hasOptimizedRoute && (
          <div className="space-y-3">
            <div className="bg-[#DAF9D8] rounded-lg p-4 max-h-[600px] overflow-y-auto">
              <p className="text-sm text-[#004DB6] mb-3">
                {t('clickToNavigate', lang)}
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
                        <>
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => onRouteGuidance(currentDay, idx)}
                            data-tutorial="route-list"
                          >

                            <Navigation className="w-4 h-4 mr-2" />
                            {t('goStartNavigation', lang)}
                          </Button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-sm text-gray-600 text-center">
              {currentDay.optimizedRoute.length - 1} {currentDay.optimizedRoute.length - 1 !== 1 ? t('routeSegments', lang) : t('routeSegment', lang)}
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
                        {selectedDestination.costs.map((cost) => {
                          const parsed = parseAmount(cost.amount);
                          return (
                            <div key={cost.id} className="text-sm text-gray-600">
                              {cost.detail && `${cost.detail}: `}
                              <span className="text-gray-900">
                                {parsed.isApprox
                                  ? `$${parsed.min.toLocaleString()} - $${parsed.max.toLocaleString()}`
                                  : `$${parsed.min.toLocaleString()}`}
                              </span>
                            </div>
                          );
                        })}
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
                {destinations.length} {destinations.length !== 1 ? t('destinations', lang) : t('destination', lang)}
              </span>
              {viewMode === "all" && (
                <span className="text-[#004DB6]">
                  {t('showingAllDays', lang)}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </Card >
  );
}