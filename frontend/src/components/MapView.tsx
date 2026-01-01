import React, { useState, useEffect, useRef, } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { DayPlan, Destination } from "../types";
import { Navigation, Map, List, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent, Polyline } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';
import { reverseGeocode } from "../utils/reverseGeocode";
import { toast } from "sonner";
import { t } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";

interface MapViewProps {
  days: DayPlan[];
  viewMode: 'single' | 'all' | 'route-guidance';
  selectedDayId: string;
  onRouteGuidance: (day: DayPlan, idx: number) => void;
  onMapClick?: (data: { latitude: number; longitude: number; name: string; address: string }) => void;
  manualStepAction?: string | null;
  onManualActionComplete?: () => void;
  resetMapView?: boolean;
  language: 'EN' | 'VI';
  mode?: 'custom' | 'view';
  focusedDestination?: Destination | null;
  onOptimizeRoute: (destinations: Destination[]) => Promise<void>;
  isOptimizing?: boolean;
  onDestinationClick?: (destination: Destination) => void;
  AICommand?: string | null;
  AICommandPayload?: any;
  onAIActionComplete?: () => void;
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
  onMapClick,
  manualStepAction,
  onManualActionComplete,
  resetMapView,
  language,
  mode,
  focusedDestination,
  onOptimizeRoute,
  isOptimizing,
  onDestinationClick,
  AICommand,
  AICommandPayload,
  onAIActionComplete,
  userLocation,
  isExpanded,
}: MapViewProps & { isExpanded?: boolean; userLocation?: { latitude: number; longitude: number } | null }) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [newDestinationName, setNewDestinationName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  // Initialize mapListView to "list" if there's an optimized route
  const currentDay = days.find((d) => d.id === selectedDayId);
  const hasOptimizedRoute =
    viewMode === "single" &&
    currentDay &&
    currentDay.optimizedRoute.length > 0;

  const [mapListView, setMapListView] = useState<
    "map" | "list"
  >(hasOptimizedRoute ? "list" : "map");
  const [selectedPairIndex, setSelectedPairIndex] = useState<
    number | null
  >(null);

  const mapRef = useRef<any>(null);

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

  // Reset to map view when resetMapView is triggered
  useEffect(() => {
    if (resetMapView) {
      setMapListView("map");
      setSelectedDestination(null);
      setSelectedPairIndex(null);
      setNewDestinationName('');
      setIsAdding(false);
    }
  }, [resetMapView]);

  // Handle focused destination from DayView card click
  useEffect(() => {
    if (focusedDestination) {
      setSelectedDestination(focusedDestination);
      // Switch to map view if in list view
      if (mapListView === 'list') {
        setMapListView('map');
      }
    }
  }, [focusedDestination]);

  const routePairs =
    hasOptimizedRoute && currentDay
      ? currentDay.optimizedRoute.slice(0, -1).map((from, idx) => [
        from,
        currentDay.optimizedRoute[idx + 1],
      ])
      : [];
  const { primary, secondary, accent, light } = useThemeColors();

  return (
    <Card
      className="h-full sticky bg-white rounded-3xl pt-4 px-7 pb-8 border border-[#E5E7EB]"
      style={{
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)'
      }}
      data-tutorial-card="map-view"
    >
      <div className="space-y-4 h-full flex flex-col">
        {/* Map View Header - Always shown, but only clickable in View Mode */}
        <div className="flex items-center justify-between gap-3">
          {mode === 'custom' ? (
            // Header in Custom Mode - not clickable
            <div
              className="flex items-center text-gray-900 px-0 py-2.5 h-auto font-semibold text-[20px]"
              data-tutorial="map-view-header"
            >
              <Map className="w-6 h-6 mr-2" />
              {t('mapView', lang)}
            </div>
          ) : (
            // Button in View Mode - clickable toggle with animations
            <button
              onClick={() => {
                setMapListView(
                  mapListView === "map" ? "list" : "map",
                );
              }}
              className="text-gray-900 px-4 py-2.5 h-auto font-semibold text-[20px] rounded-lg relative overflow-hidden group"
              data-tutorial="map-view-header"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${secondary}15`;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
            >
              {/* Animated ripple effect on click */}
              <span
                className="absolute inset-0 opacity-0 group-active:opacity-100 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${secondary}40 0%, transparent 70%)`,
                  transition: 'opacity 0.3s ease-out',
                }}
              />

              {/* Animated glow effect on hover */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${secondary}10 0%, ${primary}08 100%)`,
                  transition: 'opacity 0.4s ease-in-out',
                  borderRadius: '0.5rem',
                }}
              />

              {/* Button content with icon flip animation */}
              <span className="relative z-10 flex items-center transition-all duration-400">
                {mapListView === "map" ? (
                  <>
                    <Map
                      className="w-6 h-6 mr-2 transition-all duration-400 group-hover:scale-110 group-hover:rotate-12"
                      style={{
                        color: primary,
                        filter: `drop-shadow(0 0 8px ${primary}40)`,
                      }}
                    />
                    <span className="transition-all duration-300 group-hover:tracking-wide">
                      {t('mapView', lang)}
                    </span>
                  </>
                ) : (
                  <>
                    <List
                      className="w-5 h-5 mr-2 transition-all duration-400 group-hover:scale-110 group-hover:rotate-12"
                      style={{
                        color: secondary,
                        filter: `drop-shadow(0 0 8px ${secondary}40)`,
                      }}
                    />
                    <span className="transition-all duration-300 group-hover:tracking-wide">
                      {t('routeList', lang)}
                    </span>
                  </>
                )}
              </span>
            </button>
          )}

          {/* Find Optimal Route Button - Only in View Mode and Map View - On Same Line */}
          {mode === 'view' && mapListView === 'map' && onOptimizeRoute && (
            <Button
              onClick={() => {
                if (currentDay && currentDay.destinations.length > 0) {
                  onOptimizeRoute(currentDay.destinations);
                }
              }}
              disabled={isOptimizing || (currentDay && currentDay.destinations.length < 2)}
              className="bg-[#70C573] hover:bg-[#5E885D] text-white shrink-0"
              data-tutorial="find-optimal-route"
              style={{ height: '40px' }}
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('optimizing', lang)}...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  {t('findOptimalRoute', lang)}
                </>
              )}
            </Button>
          )}
        </div>

        {/* List View - Only in View Mode */}
        {mode === 'view' && mapListView === "list" && hasOptimizedRoute && (
          <div className="space-y-3" data-tutorial="route-list">
            <div className="bg-[#DAF9D8] rounded-lg p-4 max-h-[600px] overflow-y-auto">
              <p className="text-sm text-[#004DB6] mb-3">
                {t('clickToNavigate', lang)}
              </p>
              <div className="space-y-2">
                {routePairs.map((pair, idx) => (
                  <div key={idx} className="space-y-2">
                    {/* Route Pair Button with Animations */}
                    <button
                      onClick={() =>
                        setSelectedPairIndex(
                          selectedPairIndex === idx
                            ? null
                            : idx,
                        )
                      }
                      className="w-full justify-start text-left h-auto py-3 px-4 rounded-lg relative overflow-hidden group transition-all duration-300"
                      style={{
                        backgroundColor: selectedPairIndex === idx ? primary : 'white',
                        color: selectedPairIndex === idx ? 'white' : '#374151',
                        border: selectedPairIndex === idx ? 'none' : '1.5px solid #E5E7EB',
                        boxShadow: selectedPairIndex === idx
                          ? `0 8px 24px ${primary}40`
                          : '0 2px 8px rgba(0,0,0,0.05)',
                        transform: 'scale(1)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPairIndex !== idx) {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                          e.currentTarget.style.boxShadow = `0 6px 20px ${primary}20`;
                          e.currentTarget.style.borderColor = primary;
                        } else {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                          e.currentTarget.style.boxShadow = `0 12px 32px ${primary}50`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPairIndex !== idx) {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                          e.currentTarget.style.borderColor = '#E5E7EB';
                        } else {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = `0 8px 24px ${primary}40`;
                        }
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                      }}
                      onMouseUp={(e) => {
                        if (selectedPairIndex !== idx) {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                        } else {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        }
                      }}
                    >
                      {/* Animated ripple effect on click */}
                      <span
                        className="absolute inset-0 opacity-0 group-active:opacity-100 pointer-events-none"
                        style={{
                          background: selectedPairIndex === idx
                            ? `radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)`
                            : `radial-gradient(circle, ${primary}30 0%, transparent 70%)`,
                          transition: 'opacity 0.3s ease-out',
                        }}
                      />

                      {/* Shimmer effect on hover */}
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                        style={{
                          background: selectedPairIndex === idx
                            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)'
                            : `linear-gradient(135deg, ${primary}08 0%, ${secondary}05 100%)`,
                          transition: 'opacity 0.4s ease-in-out',
                        }}
                      />

                      <div className="flex items-center gap-2 w-full relative z-10">
                        {/* Number Badge with Animation */}
                        <span
                          className="rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                          style={{
                            backgroundColor: selectedPairIndex === idx ? light : '#DAF9D8',
                            color: selectedPairIndex === idx ? primary : '#004DB6',
                            boxShadow: selectedPairIndex === idx
                              ? '0 2px 8px rgba(0,0,0,0.15)'
                              : '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                        >
                          {idx + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          {/* From Destination */}
                          <div
                            className="text-sm truncate transition-all duration-200 group-hover:translate-x-1"
                            style={{
                              color: selectedPairIndex === idx ? 'white' : '#1F2937',
                            }}
                          >
                            {pair[0].name}
                          </div>

                          {/* Arrow with Animation */}
                          <div
                            className="text-xs mt-1 transition-all duration-300 group-hover:translate-y-1"
                            style={{
                              color: selectedPairIndex === idx ? 'rgba(255,255,255,0.8)' : '#9CA3AF',
                            }}
                          >
                            ↓
                          </div>

                          {/* To Destination */}
                          <div
                            className="text-sm truncate transition-all duration-200 group-hover:translate-x-1"
                            style={{
                              color: selectedPairIndex === idx ? 'white' : '#1F2937',
                            }}
                          >
                            {pair[1].name}
                          </div>
                        </div>

                        {/* Navigation Icon with Animation */}
                        <Navigation
                          className="w-4 h-4 shrink-0 transition-all duration-300 group-hover:scale-125 group-hover:rotate-45"
                          style={{
                            color: selectedPairIndex === idx ? 'white' : primary,
                            filter: selectedPairIndex === idx
                              ? 'drop-shadow(0 0 6px rgba(255,255,255,0.5))'
                              : `drop-shadow(0 0 4px ${primary}40)`,
                          }}
                        />
                      </div>
                    </button>

                    {/* Start Navigation Button with Animations */}
                    {selectedPairIndex === idx && (
                      <button
                        onClick={() =>
                          onRouteGuidance(currentDay, idx)
                        }
                        className="w-full h-12 rounded-lg relative overflow-hidden group transition-all duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${secondary} 0%, ${accent} 100%)`,
                          color: 'white',
                          border: 'none',
                          boxShadow: `0 6px 20px ${secondary}40`,
                          transform: 'scale(1)',
                          cursor: 'pointer',
                          animation: 'slideDown 0.3s ease-out',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                          e.currentTarget.style.boxShadow = `0 12px 32px ${secondary}60`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = `0 6px 20px ${secondary}40`;
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${secondary}35`;
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                          e.currentTarget.style.boxShadow = `0 12px 32px ${secondary}60`;
                        }}
                      >
                        {/* Animated gradient overlay */}
                        <span
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                            transition: 'opacity 0.4s ease-in-out',
                          }}
                        />

                        {/* Pulse effect on hover */}
                        <span
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, transparent 70%)',
                            animation: 'pulse 2s ease-in-out infinite',
                          }}
                        />

                        {/* Ripple on click */}
                        <span
                          className="absolute inset-0 opacity-0 group-active:opacity-100 pointer-events-none"
                          style={{
                            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                            transition: 'opacity 0.2s ease-out',
                          }}
                        />

                        {/* Button content */}
                        <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                          <Navigation
                            className="w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-45"
                            style={{
                              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))',
                            }}
                          />
                          <span className="transition-all duration-200 group-hover:tracking-wide">
                            {t('goStartNavigation', lang)}
                          </span>
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-600 text-center">
              {routePairs.length} {routePairs.length !== 1 ? t('routeSegments', lang) : t('routeSegment', lang)}
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