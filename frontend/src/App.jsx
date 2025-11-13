import React from "react";
import { useState } from "react";
import { GenerateMode } from "./components/GenerateMode.jsx";
import { CustomMode } from "./components/CustomMode.jsx";
import { AuthModal } from "./components/AuthModal.jsx";
import { SavedPlans } from "./components/SavedPlans.jsx";
import { Button } from "./components/ui/button.jsx";
import {
    LogIn,
    LogOut,
    Map,
    Wand2,
    Settings,
} from "lucide-react";
import './styles/globals.css';

export default function App() {
    const [mode, setMode] = useState('generate');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showSavedPlans, setShowSavedPlans] = useState(false);
    const [currency, setCurrency] = useState('USD');
    const [tripData, setTripData] = useState(null);
    const [currentPlanId, setCurrentPlanId] = useState(null);

    const handleLogin = (email) => {
        setIsLoggedIn(true);
        setCurrentUser(email);
        setIsAuthModalOpen(false);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setShowSavedPlans(false);
    };

    const handleGenerate = (generatedPlan) => {
        setTripData(generatedPlan);
        setCurrentPlanId(null); // New generated plan, no ID yet
        setMode('custom');
    };

    const handleLoadPlan = (plan) => {
        setTripData({ name: plan.name, days: plan.days });
        setCurrentPlanId(plan.id); // Set the plan ID so we can update it
        setMode('custom');
        setShowSavedPlans(false);
    };

    const handleCreateNewPlan = () => {
        setTripData({ name: '', days: [{ id: '1', dayNumber: 1, destinations: [], optimizedRoute: [] }] });
        setCurrentPlanId(null); // New plan, no ID yet
        setMode('custom');
        setShowSavedPlans(false);
    };

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-green-50 to-blue-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Map className="w-8 h-8 text-[#004DB6]" />
                            <h1 className="text-[#004DB6] font-bold font-[Baloo_2] text-[32px]">
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
                                    Login to Save Plans
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {showSavedPlans && isLoggedIn ? (
                    <SavedPlans
                        currentUser={currentUser}
                        onBack={() => setShowSavedPlans(false)}
                        onLoadPlan={handleLoadPlan}
                        onCreateNew={handleCreateNewPlan}
                    />
                ) : (
                    <>
                        {/* Mode Switcher */}
                        <div className="flex gap-2 mb-6">
                            <Button
                                variant={
                                    mode === "generate" ? "default" : "outline"
                                }
                                onClick={() => setMode("generate")}
                            >
                                <Wand2 className="w-4 h-4 mr-2" />
                                Generate Mode
                            </Button>
                            <Button
                                variant={
                                    mode === "custom" ? "default" : "outline"
                                }
                                onClick={() => setMode("custom")}
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Custom Mode
                            </Button>
                        </div>

                        {/* Mode Content */}
                        {mode === "generate" ? (
                            <GenerateMode
                                onGenerate={handleGenerate}
                                currency={currency}
                                onCurrencyToggle={() =>
                                    setCurrency(
                                        currency === "USD" ? "VND" : "USD",
                                    )
                                }
                            />
                        ) : (
                            <CustomMode
                                tripData={tripData || { name: '', days: [{ id: '1', dayNumber: 1, destinations: [], optimizedRoute: [] }] }}
                                onUpdate={setTripData}
                                currency={currency}
                                onCurrencyToggle={() => setCurrency(currency === 'USD' ? 'VND' : 'USD')}
                                isLoggedIn={isLoggedIn}
                                currentUser={currentUser}
                                planId={currentPlanId}
                            />
                        )}
                    </>
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
