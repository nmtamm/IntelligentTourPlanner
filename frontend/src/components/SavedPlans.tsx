import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Calendar, MapPin, DollarSign, Trash2, Plus, Loader2, Currency, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { DayPlan, Destination } from '../types';
import { getTrips, deleteTrip } from '../api.js';
import { convertAllTrips } from '../utils/exchangerate';
import { parseAmount } from '../utils/parseAmount';

interface SavedPlansProps {
  currentUser: string;
  onBack: () => void;
  onLoadPlan: (plan: { id: string; name: string; days: DayPlan[] }) => void;
  onCreateNew: () => void;
  currency: string;
}

export function SavedPlans({ currentUser, onBack, onLoadPlan, onCreateNew, currency }: SavedPlansProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const currencySymbol = currency === 'USD' ? '$' : '₫';

  useEffect(() => {
    loadPlans();
  }, [currentUser, currency]);

  const loadPlans = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view your saved plans');
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
            lat: dest.latitude,
            lng: dest.longitude,
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
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load trips. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId, e) => {
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to delete plans');
      return;
    }

    try {
      await deleteTrip(planId, token);
      loadPlans(); // Reload the list
      toast.success('Plan deleted successfully!');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete plan. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-gray-900">My Saved Plans</h2>
        </div>
        <Button onClick={onCreateNew} className="bg-[#004DB6] hover:bg-[#003d8f]">
          <Plus className="w-4 h-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#004DB6]" />
          <p className="text-gray-500">Loading your saved plans...</p>
        </Card>
      ) : plans.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No saved plans yet. Create your first trip plan!</p>
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
                    {plan.days.length} {plan.days.length === 1 ? 'day' : 'days'}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {totalDestinations} destinations
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Wallet className="w-4 h-4" />
                    {currencySymbol}
                    {isApprox
                      ? `${minTotal.toLocaleString()} - ${maxTotal.toLocaleString()}`
                      : minTotal.toLocaleString()
                    } total
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
    </div>
  );
}