import React, { useEffect, useState, ReactNode } from "react";
import { checkGPS, sendLocationToBackend } from "../utils/geolocation";

export type UserLocation = {
  latitude: number;
  longitude: number;
};

type GpsStatus = "requesting" | "granted" | "denied";

interface GpsGateProps {
  gpsApiUrl: string;
  onLocation: (loc: UserLocation) => void;
  children: ReactNode;
}

export const GpsGate: React.FC<GpsGateProps> = ({
  gpsApiUrl,
  onLocation,
  children,
}) => {
  const [status, setStatus] = useState<GpsStatus>("requesting");

  useEffect(() => {
    checkGPS((gps) => {
      if (gps) {
        const loc: UserLocation = {
          latitude: gps.latitude,
          longitude: gps.longitude,
        };

        onLocation(loc);
        setStatus("granted");

        // send to backend
        sendLocationToBackend(gpsApiUrl, (data, error) => {
          if (error) {
            console.error("Failed to send GPS:", error);
          } else {
            console.log("Location sent to backend:", data);
          }
        });
      } else {
        setStatus("denied");
      }
    });
  }, [gpsApiUrl, onLocation]);

  // While asking for permission
  if (status === "requesting") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900/90 text-black px-4">
        <div className="bg-slate-900/95 rounded-2xl p-6 shadow-2xl text-center space-y-3">
          <h2 className="text-xl font-semibold">We need your location</h2>
          <p>
            Please click <strong>"Allow"</strong> in your browser popup to continue.
          </p>
          <p className="text-sm text-slate-300">
            We use your location to provide optimized routes and nearby suggestions.
          </p>
        </div>
      </div>
    );
  }

  // Denied → block UI
  if (status === "denied") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900/90 text-black px-4">
        <div className="bg-slate-900/95 rounded-2xl p-6 shadow-2xl text-center space-y-3">
          <h2 className="text-xl font-semibold">Location Required</h2>
          <p>You denied location access, so the app cannot function correctly.</p>

          <p className="text-sm text-slate-300">
            Please enable location in your browser settings and refresh the page.
          </p>
        </div>
      </div>
    );
  }

  // GPS OK → render real app
  return <>{children}</>;
};
