import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Calendar, MapPin, DollarSign, Trash2, Plus, Loader2, Currency, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { DayPlan, Destination } from '../types';
import { getTrips, deleteTrip } from '../api.js';
import { convertAllTrips } from '../utils/exchangerate';
import { parseAmount } from '../utils/parseAmount';
import { t } from '../utils/translations';
import { ErrorNotification } from "./ErrorNotification";


interface SavedPlansProps {
  currentUser: string;
  onBack: () => void;
  onLoadPlan: (plan: { id: string; name: string; days: DayPlan[] }) => void;
  onCreateNew: () => void;
  currency: string;
  language: 'EN' | 'VI';
  AICommand: string | null;
  AICommandPayload?: any;
  onAICommand?: (command: string) => void;
  onAIActionComplete?: () => void;
}

export function SavedPlans({ currentUser, onBack, onLoadPlan, onCreateNew, currency, language, AICommand, AICommandPayload, onAICommand, onAIActionComplete }: SavedPlansProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const currencySymbol = currency === 'USD' ? 'USD' : 'VND';
  const lang = language.toLowerCase() as 'en' | 'vi';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, [currentUser, currency]);

  const loadPlans = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(t('loginToViewPlans', lang));
      setError(t('loginToViewPlans', lang));
      return;
    }

    setLoading(true);
    try {
      const trips = await getTrips(token);
      // Transform backend data to frontend format
      const transformedTrips = trips.map(trip => ({
        id: trip.id,
        name: trip.name,
        user: currentUser,
        createdAt: trip.created_at,
        updatedAt: trip.updated_at,
        days: trip.days.map(day => ({
          id: String(day.id),
          dayNumber: day.day_number,
          destinations: day.destinations.map(dest => ({
            id: String(dest.id),
            name: dest.name,
            address: dest.address,
            latitude: dest.latitude,
            longitude: dest.longitude,
            costs: dest.costs.map(cost => ({
              id: String(cost.id),
              amount: cost.amount,
              detail: cost.detail,
              originalAmount: cost.originalAmount,
              originalCurrency: cost.originalCurrency
            }))
          })),
          optimizedRoute: []
        }))
      }));

      const convertedTrips = await convertAllTrips(transformedTrips, currency);
      setPlans(convertedTrips);

    } catch (error) {
      const err = error as any;
      console.error('Error loading trips:', err);
      if (err.response?.status === 401) {
        toast.error(t('sessionExpired', lang));
        setError(t('sessionExpired', lang));
      } else {
        toast.error(t('loadTripsFailed', lang));
        setError(t('loadTripsFailed', lang));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId, e) => {
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(t('loginToDeletePlans', lang));
      setError(t('loginToDeletePlans', lang));
      return;
    }

    try {
      await deleteTrip(planId, token);
      loadPlans(); // Reload the list
      toast.success('Plan deleted successfully!');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error(t('planDeletedFailed', lang));
      setError(t('planDeletedFailed', lang));
    }
  };

  const deleteAllSavedPlans = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(t('loginToDeletePlans', lang));
      setError(t('loginToDeletePlans', lang));
      return;
    }
    try {
      // Option 1: If you have a backend API for bulk delete
      // await deleteAllTrips(token);

      // Option 2: Delete each plan one by one
      for (const plan of plans) {
        await deleteTrip(plan.id, token);
      }
      loadPlans();
      toast.success('All plans deleted!');
    } catch (error) {
      toast.error(t('planDeletedFailed', lang));
      setError(t('planDeletedFailed', lang));
    }
  };

  useEffect(() => {
    if (!AICommand) return;

    const handleAIAction = async () => {
      switch (AICommand) {
        case 'delete_all_saved_plans':
          await deleteAllSavedPlans();
          break;
        case 'delete_saved_plan_ith': {
          // Use the plan index from AICommandPayload, default to 0 if not provided
          const planIndex = AICommandPayload?.planIndex ?? 0;
          const planId = plans[planIndex]?.id;
          if (planId) {
            await handleDeletePlan(planId, new Event('click'));
          } else {
            toast.error('Plan not found!');
          }
          break;
        }
        default:
          break;
      }
      if (onAIActionComplete) onAIActionComplete();
    };

    handleAIAction();
    // eslint-disable-next-line
  }, [AICommand]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back', lang)}
          </Button>
          <h2 className="text-gray-900">My Saved Plans</h2>
        </div>
        <Button onClick={onCreateNew} className="bg-[#004DB6] hover:bg-[#003d8f]">
          <Plus className="w-4 h-4 mr-2" />
          {t('createNewPlan', lang)}
        </Button>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#004DB6]" />
          <p className="text-gray-500">Loading your saved plans...</p>
        </Card>
      ) : plans.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">{t('noSavedPlans', lang)}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const totalDestinations = plan.days.reduce((sum: number, day: DayPlan) => sum + day.destinations.length, 0);
            let minTotal = 0, maxTotal = 0, isApprox = false;
            plan.days.forEach((day: DayPlan) => {
              day.destinations.forEach((dest: Destination) => {
                dest.costs.forEach((cost: any) => {
                  const parsed = parseAmount(cost.amount);
                  minTotal += parsed.min;
                  maxTotal += parsed.max;
                  if (parsed.isApprox) isApprox = true;
                });
              });
            });

            return (
              <Card
                key={plan.id}
                className="p-4 space-y-3 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-[#70C573]"
                onClick={() => {
                  onLoadPlan({ id: plan.id, name: plan.name, days: plan.days });
                  toast.success('Plan loaded successfully!');
                }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-gray-900">{plan.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeletePlan(plan.id, e)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {plan.days.length} {plan.days.length === 1 ? t('day', lang) : t('days', lang)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {totalDestinations} {t('destinations', lang)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Wallet className="w-4 h-4" />
                    {isApprox
                      ? `${minTotal.toLocaleString()} \u2013 ${maxTotal.toLocaleString()}`
                      : minTotal.toLocaleString()
                    } {currencySymbol}
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Created {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <ErrorNotification
          message={error}
          onClose={() => setError(null)}
        />
      )}

    </div>
  );
}