import { useState } from "react";
import { GpsGate } from "./components/GpsGate";
import { CustomMode } from "./components/CustomMode";
import { AuthModal } from "./components/AuthModal";
import { SavedPlans } from "./components/SavedPlans";
import { UserManual } from "./components/UserManual";
import { Button } from "./components/ui/button";
import {
  LogIn,
  LogOut,
  Map,
  Globe,
  MapPinPen,
  HelpCircle
} from "lucide-react";
import { DayPlan } from "./types";
import { checkGPS, sendLocationToBackend } from "./utils/geolocation";
import { fetchFoursquarePlaces } from "./utils/foursquare";
import { t } from "./utils/translations";

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
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);
  const [manualStepAction, setManualStepAction] = useState<string | null>(null);
  const [resetViewsToDefault, setResetViewsToDefault] = useState(false);
  const [showAllDaysOnLoad, setShowAllDaysOnLoad] = useState(false);

  const lang = language.toLowerCase() as 'en' | 'vi';

  // => I put this in GpsGate.tsx now
  // useEffect(() => {
  //   checkGPS((gps) => {
  //     if (gps) {
  //       setUserLocation({ lat: gps.latitude, lng: gps.longitude });
  //       sendLocationToBackend(gpsApiUrl, (data, error) => {
  //         if (error) {
  //           console.error("Failed to send GPS:", error);
  //         } else {
  //           console.log("Location sent to backend:", data);
  //         }
  //       });
  //     }
  //   });
  // }, []);

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

    // Trigger View All Days mode when a plan is loaded
    setShowAllDaysOnLoad(true);

    // Reset the trigger after a brief moment
    setTimeout(() => {
      setShowAllDaysOnLoad(false);
    }, 100);
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

  const handleOpenUserManual = () => {
    // Navigate back to Custom Mode view (default screen)
    // Keep all user data intact - don't clear anything
    setShowSavedPlans(false);

    // Trigger reset to default views in CustomMode
    setResetViewsToDefault(true);

    // Open the User Manual
    setIsUserManualOpen(true);

    // Reset the trigger after a brief moment
    setTimeout(() => {
      setResetViewsToDefault(false);
    }, 100);
  };

  const handleCloseUserManual = () => {
    // Navigate back to Custom Mode view (default screen)
    // Keep all user data intact - don't clear anything
    setShowSavedPlans(false);

    // Trigger reset to default views in CustomMode
    setResetViewsToDefault(true);

    // Close the User Manual
    setIsUserManualOpen(false);

    // Reset the trigger after a brief moment
    setTimeout(() => {
      setResetViewsToDefault(false);
    }, 100);
  };

  return (
    <GpsGate gpsApiUrl={gpsApiUrl} onLocation={setUserLocation}>
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
                  data-tutorial="currency"
                >
                  {currency === "USD" ? "USD" : "VND"}
                </Button>

                {/* Language Switcher */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setLanguage(language === "EN" ? "VI" : "EN")
                  }
                  data-tutorial="language"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {language === "EN" ? "English" : "Tiếng Việt"}
                </Button>

                {/* User Manual Button - Always Visible */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenUserManual}
                  className="border-[#70C573] text-[#004DB6] hover:bg-[#DAF9D8]"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  {t("userManual", lang)}
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
                        ? t("customMode", lang)
                        : t("myPlans", lang)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("logout", lang)}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setIsAuthModalOpen(true)}
                      data-tutorial="login"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {t("login", lang)}
                    </Button>
                  </>
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
              language={language}
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
              manualStepAction={manualStepAction}
              onManualActionComplete={() => setManualStepAction(null)}
              resetToDefault={resetViewsToDefault}
              showAllDaysOnLoad={showAllDaysOnLoad}
            />
          )}
        </main>

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
          language={language}
        />

        {/* User Manual */}
        <UserManual
          isOpen={isUserManualOpen}
          onClose={handleCloseUserManual}
          onAutoAction={(stepId) => setManualStepAction(stepId)}
          language={language}
        />
      </div>
    </GpsGate>
  );
}