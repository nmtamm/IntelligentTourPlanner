import React from 'react';

import { Card } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { ArrowLeft, Navigation, MapPin, Clock, Route } from 'lucide-react';

export function RouteGuidance({ from, to, onBack }) {
  // Calculate simple distance (Haversine formula)
  const calculateDistance = () => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(to.lat - from.lat);
    const dLng = toRad(to.lng - from.lng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg) => deg * (Math.PI / 180);

  const distance = calculateDistance();
  const estimatedTime = Math.ceil((distance / 5) * 60); // Assuming 5 km/h walking speed

  // Generate simple turn-by-turn directions
  const directions = [
    'Head towards the destination',
    'Continue straight for 500m',
    'Turn right at the intersection',
    'Continue for 1.2 km',
    'Destination will be on your left'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Map
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Info */}
        <Card className="p-6">
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
                    <p className="text-sm text-gray-700">{from.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="border-l-2 border-dashed border-gray-300 h-8"></div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-500 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm shrink-0">
                    B
                  </div>
                  <div>
                    <p className="text-red-900">{to.name}</p>
                    <p className="text-sm text-red-700">{to.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#DAF9D8] rounded-lg p-4">
                <div className="flex items-center gap-2 text-[#004DB6] mb-1">
                  <Route className="w-4 h-4" />
                  <span className="text-sm">Distance</span>
                </div>
                <p className="text-[#004DB6]">{distance.toFixed(2)} km</p>
              </div>
              <div className="bg-[#DAF9D8] rounded-lg p-4">
                <div className="flex items-center gap-2 text-[#004DB6] mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Est. Time</span>
                </div>
                <p className="text-[#004DB6]">{estimatedTime} min</p>
              </div>
            </div>

            {/* Directions */}
            <div className="space-y-3">
              <h3 className="text-gray-900">Turn-by-turn Directions</h3>
              <div className="space-y-2">
                {directions.map((direction, idx) => (
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
            </div>
          </div>
        </Card>

        {/* GPS Map Visualization */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-gray-900">GPS Navigation</h3>

            <div className="bg-gray-50 rounded-lg overflow-hidden border h-[600px] relative">
              <svg viewBox="0 0 400 600" className="w-full h-full">
                {/* Background */}
                <rect width="400" height="600" fill="#e0f2fe" />

                {/* Grid - streets */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <g key={i}>
                    <line
                      x1={i * 50}
                      y1={0}
                      x2={i * 50}
                      y2={600}
                      stroke="#cbd5e1"
                      strokeWidth="8"
                    />
                    <line
                      x1={0}
                      y1={i * 75}
                      x2={400}
                      y2={i * 75}
                      stroke="#cbd5e1"
                      strokeWidth="8"
                    />
                  </g>
                ))}

                {/* Route path */}
                <path
                  d="M 100 500 L 100 400 L 200 400 L 200 200 L 300 200 L 300 100"
                  stroke="#6366f1"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Starting point */}
                <g>
                  <circle cx="100" cy="500" r="15" fill="#10b981" />
                  <text
                    x="100"
                    y="505"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                  >
                    A
                  </text>
                </g>

                {/* Ending point */}
                <g>
                  <circle cx="300" cy="100" r="15" fill="#ef4444" />
                  <text
                    x="300"
                    y="105"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                  >
                    B
                  </text>
                </g>

                {/* Current position indicator */}
                <g>
                  <circle cx="150" cy="400" r="10" fill="#3b82f6" />
                  <circle cx="150" cy="400" r="20" fill="#3b82f6" opacity="0.3" />
                </g>
              </svg>

              {/* GPS Info Overlay */}
              <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">Following route...</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center">
              GPS navigation simulation
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
