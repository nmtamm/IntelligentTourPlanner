import { useEffect, useState } from "react";
import { CustomMode } from "./components/CustomMode";
import { AuthModal } from "./components/AuthModal";
import { SavedPlans } from "./components/SavedPlans";
import { Button } from "./components/ui/button";
import {
  LogIn,
  LogOut,
  Map,
  Globe,
  MapPinPen,
} from "lucide-react";
import { DayPlan } from "./types";
import { checkGPS, sendLocationToBackend } from "./utils/geolocation";

type Currency = "USD" | "VND";
type Language = "EN" | "VI";

export default function App() {
  const gpsApiUrl = 'http://localhost:8000/api/location';

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null,);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "VND">("USD",);
  const [language, setLanguage] = useState<Language>("EN");
  const [tripData, setTripData] = useState<{
    name: string;
    days: DayPlan[];
  } | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<
    string | null
  >(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    checkGPS((gps) => {
      if (gps) {
        setUserLocation({ lat: gps.latitude, lng: gps.longitude });
        sendLocationToBackend(gpsApiUrl, (data, error) => {
          if (error) {
            console.error("Failed to send GPS:", error);
          } else {
            console.log("Location sent to backend:", data);
          }
        });
      }
    });
  }, []);

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setCurrentUser(email);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowSavedPlans(false);
  };

  const handleLoadPlan = (plan: {
    id: string;
    name: string;
    days: DayPlan[];
  }) => {
    setTripData({ name: plan.name, days: plan.days });
    setCurrentPlanId(plan.id);
    setShowSavedPlans(false);
  };

  const handleCreateNewPlan = () => {
    setTripData({
      name: "",
      days: [
        {
          id: "1",
          dayNumber: 1,
          destinations: [],
          optimizedRoute: [],
        },
      ],
    });
    setCurrentPlanId(null);
    setShowSavedPlans(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-100 to-blue-300">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPinPen className="w-8 h-8 text-[#004DB6]" />
              <h1 className="text-[#004DB6] font-bold font-[Lora] text-[32px]">
                Intelligent Tour Planner
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Currency Switcher */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrency(
                    currency === "USD" ? "VND" : "USD",
                  )
                }
              >
                {currency === "USD" ? "$ USD" : "₫ VND"}
              </Button>

              {/* Language Switcher */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setLanguage(language === "EN" ? "VI" : "EN")
                }
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === "EN" ? "English" : "Tiếng Việt"}
              </Button>

              {isLoggedIn ? (
                <>
                  <span className="text-gray-600 text-sm">
                    {currentUser}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setShowSavedPlans(!showSavedPlans)
                    }
                  >
                    {showSavedPlans
                      ? "Custom Mode"
                      : "My Plans"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSavedPlans && isLoggedIn ? (
          <SavedPlans
            currentUser={currentUser!}
            onBack={() => setShowSavedPlans(false)}
            onLoadPlan={handleLoadPlan}
            onCreateNew={handleCreateNewPlan}
            currency={currency}
          />
        ) : (
          <CustomMode
            tripData={
              tripData || {
                name: "",
                days: [
                  {
                    id: "1",
                    dayNumber: 1,
                    destinations: [],
                    optimizedRoute: [],
                  },
                ],
              }
            }
            onUpdate={setTripData}
            currency={currency}
            onCurrencyToggle={() =>
              setCurrency(currency === "USD" ? "VND" : "USD")
            }
            language={language}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            planId={currentPlanId}
            userLocation={userLocation}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}