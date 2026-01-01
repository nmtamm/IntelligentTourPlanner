import { useState } from "react";
import { CustomMode } from "./components/CustomMode";
import { GpsGate } from "./components/GpsGate";
import { AuthModal } from "./components/AuthModal";
import { AccountProfile } from "./components/AccountProfile";
import { SavedPlans } from "./components/SavedPlans";
import { UserManual } from "./components/UserManual";
import { Settings } from "./components/Settings";
import { Sidebar } from "./components/Sidebar";
import { IntroScreen } from "./components/IntroScreen";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { Button } from "./components/ui/button";
import {
  LogIn,
  LogOut,
  Map,
  Globe,
  MapPinPen,
  HelpCircle,
  Edit,
  Eye,
  Settings as SettingsIcon,
} from "lucide-react";
import { DayPlan } from "./types";
import { t } from "./locales/translations";
import { motion } from "motion/react";

type Currency = "USD" | "VND";
type Language = "EN" | "VI";
type Mode = "custom" | "view";

interface UserProfile {
  username: string;
  email: string;
  password: string;
  avatar?: string;
}

function AppContent() {
  const gpsApiUrl = 'http://localhost:8000/api/location';
  const [showIntro, setShowIntro] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountProfileOpen, setIsAccountProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(
    null,
  );
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "VND">(
    "USD",
  );
  const [language, setLanguage] = useState<Language>("EN");
  const [mode, setMode] = useState<Mode>("custom");
  const [tripData, setTripData] = useState<{
    name: string;
    days: DayPlan[];
  } | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<
    string | null
  >(null);
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);
  const [resetViewsToDefault, setResetViewsToDefault] = useState(false);
  const [showAllDaysOnLoad, setShowAllDaysOnLoad] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [AICommand, setAICommand] = useState<string | null>(null);
  const [AICommandPayload, setAICommandPayload] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Use theme hook
  const { currentTheme } = useTheme();

  const handleLogin = (user: { username: string; email: string; password?: string; avatar?: string }) => {
    setIsLoggedIn(true);
    setCurrentUser(user.email);

    setUserProfile({
      username: user.username,
      email: user.email,
      password: user.password || 'defaultPassword123', // You may want to omit this for security
      avatar: user.avatar
    });

    setIsAuthModalOpen(false);
    setShowIntro(false);
  };

  const handleContinueFromIntro = (user: { username: string; email: string; password?: string; avatar?: string }) => {
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user.email);
      setUserProfile(user);
    } else {
      setIsUserManualOpen(true);
    }
    setShowIntro(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserProfile(null);
    setShowSavedPlans(false);
    setIsAccountProfileOpen(false);
  };

  const handleUpdateProfile = (updates: {
    username?: string;
    email?: string;
    password?: string;
    avatar?: string;
  }) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        ...updates
      });

      // Update currentUser if email changed
      if (updates.email) {
        setCurrentUser(updates.email);
      }
    }
  };

  const handleLoadPlan = (plan: {
    id: string;
    name: string;
    days: DayPlan[];
  }) => {
    setTripData({ name: plan.name, days: plan.days });
    setCurrentPlanId(plan.id);
    setShowSavedPlans(false);

    // Switch to View mode when loading a plan
    setMode("view");

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
    setMode("custom");
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

  const handleAICommand = (command: string, payload?: any) => {
    // Handle commands that affect App state directly
    if (command === "open_user_manual") setIsUserManualOpen(true);
    else if (command === "change_language") setLanguage(language === "EN" ? "VI" : "EN");
    else if (command === "change_currency") setCurrency(currency === "USD" ? "VND" : "USD");
    else if (command === "show_saved_plan" && isLoggedIn) setShowSavedPlans(true);
    else if (command === "delete_all_saved_plans" || command === "delete_saved_plan_ith")
      setShowSavedPlans(true);

    // For commands that need to be passed down (with or without payload)
    setAICommand(command);
    setAICommandPayload(payload);
  };

  return (
    <GpsGate gpsApiUrl={gpsApiUrl} onLocation={setUserLocation}>
      <div
        className="min-h-screen"
        style={{ background: showIntro ? undefined : currentTheme.colors.background }}
      >
        {/* Sidebar - Hidden on Intro Screen */}
        {!showIntro && (
          <Sidebar
            mode={mode}
            onModeChange={setMode}
            onSettingsClick={() => setIsSettingsOpen(true)}
            onUserManualClick={handleOpenUserManual}
            onMyPlansClick={() => {
              if (isLoggedIn) {
                setShowSavedPlans(true);
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            onLoginClick={() => {
              if (isLoggedIn) {
                // Show account profile modal
                setIsAccountProfileOpen(true);
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            language={language}
            isMyPlansActive={showSavedPlans && isLoggedIn}
            userAvatar={userProfile?.avatar}  // ← NEW LINE ADDED
          />
        )}

        {/* Main Content */}
        <main className={showIntro ? "min-h-screen" : "pl-24 pr-4 pt-4 pb-4 max-w-[100vw] mx-auto"}>
          {showIntro ? (
            <IntroScreen
              onContinue={handleContinueFromIntro}
              language={language}
              onLanguageChange={setLanguage}
            />
          ) : showSavedPlans && isLoggedIn ? (
            <SavedPlans
              currentUser={currentUser!}
              onBack={() => setShowSavedPlans(false)}
              onLoadPlan={handleLoadPlan}
              onCreateNew={handleCreateNewPlan}
              language={language}
              currency={currency}
              AICommand={AICommand}
              AICommandPayload={AICommandPayload}
              onAICommand={handleAICommand}
              onAIActionComplete={() => setAICommand(null)}
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
              mode={mode}
              isLoggedIn={isLoggedIn}
              currentUser={currentUser}
              planId={currentPlanId}
              onPlanIdChange={setCurrentPlanId}
              resetToDefault={resetViewsToDefault}
              showAllDaysOnLoad={showAllDaysOnLoad}
              AICommand={AICommand}
              onAIActionComplete={() => setAICommand(null)}
              onAICommand={handleAICommand}
              userLocation={userLocation}
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

        {/* Account Profile Modal */}
        {userProfile && (
          <AccountProfile
            isOpen={isAccountProfileOpen}
            onClose={() => setIsAccountProfileOpen(false)}
            onLogout={handleLogout}
            currentUser={userProfile}
            onUpdateProfile={handleUpdateProfile}
            language={language}
          />
        )}

        {/* User Manual */}
        <UserManual
          isOpen={isUserManualOpen}
          onClose={handleCloseUserManual}
          language={language}
          currentMode={mode}
          onModeChange={setMode}
        />

        {/* Settings Modal */}
        <Settings
          currency={currency}
          language={language}
          onCurrencyToggle={() => setCurrency(currency === "USD" ? "VND" : "USD")}
          onLanguageToggle={() => setLanguage(language === "EN" ? "VI" : "EN")}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          asModal={true}
        />
      </div>
    </GpsGate >
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}