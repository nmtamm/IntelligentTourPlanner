import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Navigation, MapPin, Clock, Route } from 'lucide-react';
import { DayPlan, Destination } from '../types';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import polyline from '@mapbox/polyline';
import React from 'react';

interface RouteGuidanceProps {
  day: DayPlan;
  segmentIndex: number;
  onBack: () => void;
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

export function RouteGuidance({ day, segmentIndex, onBack }: RouteGuidanceProps) {

  console.log("Segment index:", segmentIndex);

  const from = day.optimizedRoute[segmentIndex];
  const to = day.optimizedRoute[segmentIndex + 1];
  const instructions = day.routeInstructions?.[segmentIndex] ?? [];
  const geometry = day.routeSegmentGeometries?.[segmentIndex];
  const polylinePositions = geometry ? polyline.decode(geometry).filter(
    ([lat, lng]) => !isNaN(lat) && !isNaN(lng)
  ) : [];
  console.log("Segment index:", segmentIndex);
  console.log("Geometry string:", geometry);
  console.log("Decoded polyline positions:", polylinePositions);

  // Distance and time from OSRM
  const distance = day.routeDistanceKm ?? 0;
  const estimatedTime = day.routeDurationMin ?? 0;

  const fromLat = from?.latitude ?? from?.lat ?? 0;
  const fromLng = from?.longitude ?? from?.lng ?? 0;
  const toLat = to?.latitude ?? to?.lat ?? 0;
  const toLng = to?.longitude ?? to?.lng ?? 0;

  const markerCoords = [
    [fromLat, fromLng],
    [toLat, toLng]
  ];
  const allCoords = [
    ...markerCoords,
    ...polylinePositions
  ].filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

  const bounds = allCoords.length
    ? [
      [Math.min(...allCoords.map(([lat]) => lat)), Math.min(...allCoords.map(([_, lng]) => lng))],
      [Math.max(...allCoords.map(([lat]) => lat)), Math.max(...allCoords.map(([_, lng]) => lng))]
    ]
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Map
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Info */}
        <Card className="p-6" data-tutorial="route-guidance">
          <div className="space-y-6">
            <h2 className="text-[#004DB6] flex items-center gap-2">
              <Navigation className="w-6 h-6" />
              Route Guidance
            </h2>

            {/* From/To */}
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm shrink-0">
                    A
                  </div>
                  <div>
                    <p className="text-gray-900">{from.name}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="border-l-2 border-dashed border-gray-300 h-5"></div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-500 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm shrink-0">
                    B
                  </div>
                  <div>
                    <p className="text-red-900">{to.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#DAF9D8] rounded-lg p-4">
                <div className="flex items-center gap-2 text-[#004DB6] mb-1">
                  <Route className="w-4 h-4" />
                  <span className="text-sm">Distance:</span>
                  <p className="text-[#004DB6]">{distance.toFixed(2)} km</p>
                </div>

              </div>
              <div className="bg-[#DAF9D8] rounded-lg p-4">
                <div className="flex items-center gap-2 text-[#004DB6] mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Est. Time: </span>
                  <p className="text-[#004DB6]">{Math.ceil(estimatedTime)} min</p>
                </div>
              </div>
            </div>

            {/* Directions */}
            <div className="space-y-3">
              <h3 className="text-gray-900">Turn-by-turn Directions</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {instructions.length > 0 ? (
                  <div className="mb-4">

                    {instructions.map((direction, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-gray-50 rounded-lg p-3"
                      >
                        <div className="bg-[#004DB6] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-gray-700 text-sm">{direction}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No instructions available.</div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* GPS Map Visualization */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex flex-col h-full space-y-4">
            <h3 className="text-gray-900">GPS Navigation</h3>

            <div className="bg-gray-50 rounded-lg overflow-hidden border flex-1 relative">
              <MapContainer
                center={[fromLat, fromLng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <FitBounds bounds={bounds} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* From marker */}
                {from && (
                  <Marker position={[from.latitude ?? from.lat, from.longitude ?? from.lng]}>
                    <Popup>{from.name}</Popup>
                  </Marker>
                )}
                {/* To marker */}
                {to && (
                  <Marker position={[to.latitude ?? to.lat, to.longitude ?? to.lng]}>
                    <Popup>{to.name}</Popup>
                  </Marker>
                )}
                {/* Polyline for the selected segment only */}
                {geometry && polylinePositions.length >= 2 && (
                  <Polyline
                    positions={polylinePositions}
                    color="#800080"
                    weight={3}
                    opacity={1}
                  />
                )}
              </MapContainer>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
}