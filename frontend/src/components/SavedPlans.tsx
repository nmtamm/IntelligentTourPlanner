import { useState, useEffect, React } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Calendar, MapPin, Trash2, Plus, Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { DayPlan, Destination } from '../types';
import { getTrips, deleteTrip } from '../api.js';
import { convertAllTrips } from '../utils/exchangerate';
import { parseAmount } from '../utils/parseAmount';
import { t } from '../locales/translations';
import { useThemeColors } from '../hooks/useThemeColors';

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

interface PlanCardProps {
  plan: any;
  onLoadPlan: (plan: { id: string; name: string; days: DayPlan[] }) => void;
  onDelete: (planId: string, e: React.MouseEvent) => void;
  lang: 'en' | 'vi';
  currency: string;
}

function PlanCard({ plan, onLoadPlan, onDelete, lang, currency }: PlanCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const currencySymbol = currency === 'USD' ? 'USD' : 'VND';

  // Calculate total destinations
  const totalDestinations = plan.days.reduce(
    (sum: number, day: DayPlan) => sum + day.destinations.length,
    0
  );

  // Calculate min/max/approx cost using parseAmount
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

  // Determine current state styling - same as DayView place card
  const getCardStyles = () => {
    // 3. PRESSED STATE
    if (isPressed) {
      return {
        transform: 'scale(0.97)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        background: 'rgba(243,244,246,0.6)',
        transition: 'all 120ms ease-out',
      };
    }

    // 2. HOVER STATE
    if (isHovered) {
      return {
        transform: 'translateY(-2px) scale(1.01)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.08)',
        background: '#FCFEFF',
        border: '1px solid rgba(112,197,115,1)',
        transition: 'all 160ms ease-out',
      };
    }

    // 1. DEFAULT STATE
    return {
      background: '#FFFFFF',
      border: '1px solid rgba(229,231,235,0.7)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
      transform: 'scale(1.00)',
      transition: 'all 160ms ease-out',
    };
  };

  const handleCardClick = () => {
    onLoadPlan({ id: plan.id, name: plan.name, days: plan.days });
    toast.success(t('planLoaded', lang));
  };

  return (
    <div
      className="group relative rounded-[20px] p-6 cursor-pointer"
      style={{
        ...getCardStyles(),
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={handleCardClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-gray-900">{plan.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(plan.id, e);
            }}
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
      </div>
    </div>
  );
}

export function SavedPlans({ currentUser, onBack, onLoadPlan, onCreateNew, currency, language, AICommand, AICommandPayload, onAICommand, onAIActionComplete }: SavedPlansProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const lang = language.toLowerCase() as 'en' | 'vi';
  const { primary } = useThemeColors();
  const [isCreateButtonHovered, setIsCreateButtonHovered] = useState(false);
  const [isCreateButtonPressed, setIsCreateButtonPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    loadPlans();
  }, [currentUser, currency]);

  const loadPlans = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // toast.error(t('loginToViewPlans', lang));
      // setError(t('loginToViewPlans', lang));
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
        // toast.error(t('sessionExpired', lang));
        // setError(t('sessionExpired', lang));
      } else {
        // toast.error(t('loadTripsFailed', lang));
        // setError(t('loadTripsFailed', lang));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      // toast.error(t('loginToDeletePlans', lang));
      // setError(t('loginToDeletePlans', lang));
      return;
    }

    try {
      await deleteTrip(planId, token);
      loadPlans(); // Reload the list
      toast.success('Plan deleted successfully!');
    } catch (error) {
      console.error('Error deleting trip:', error);
      // toast.error(t('planDeletedFailed', lang));
      // setError(t('planDeletedFailed', lang));
    }
  };

  const deleteAllSavedPlans = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // toast.error(t('loginToDeletePlans', lang));
      // setError(t('loginToDeletePlans', lang));
      return;
    }
    try {
      for (const plan of plans) {
        await deleteTrip(plan.id, token);
      }
      loadPlans();
      toast.success('All plans deleted!');
    } catch (error) {
      // toast.error(t('planDeletedFailed', lang));
      // setError(t('planDeletedFailed', lang));
    }
  };

  useEffect(() => {
    if (!AICommand || loading || plans.length === 0) return;

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
  }, [AICommand, plans, loading]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg relative overflow-hidden group inline-flex items-center gap-2"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              color: '#374151',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${primary}10`;
              e.currentTarget.style.transform = 'translateX(-4px) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateX(0) scale(1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateX(-2px) scale(0.97)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateX(-4px) scale(1.05)';
            }}
          >
            {/* Ripple effect on click */}
            <span
              className="absolute inset-0 opacity-0 group-active:opacity-100 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${primary}30 0%, transparent 70%)`,
                transition: 'opacity 0.3s ease-out',
              }}
            />

            {/* Shimmer effect on hover */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${primary}15 50%, transparent 100%)`,
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />

            {/* Arrow Icon with bounce animation */}
            <ArrowLeft
              className="w-4 h-4 transition-all duration-300 group-hover:-translate-x-2 group-hover:scale-125"
              style={{
                color: primary,
                filter: `drop-shadow(0 0 6px ${primary}40)`,
              }}
            />

            {/* Text with smooth transition */}
            <span
              className="relative z-10 transition-all duration-200 group-hover:tracking-wide"
              style={{
                color: '#374151',
              }}
            >
              {t('back', lang)}
            </span>
          </button>
        </div>
        <button
          onClick={onCreateNew}
          onMouseEnter={() => setIsCreateButtonHovered(true)}
          onMouseLeave={() => {
            setIsCreateButtonHovered(false);
            setIsCreateButtonPressed(false);
          }}
          onMouseDown={() => setIsCreateButtonPressed(true)}
          onMouseUp={() => setIsCreateButtonPressed(false)}
          className="shrink-0 transition-all"
          style={{
            height: '40px',
            paddingLeft: '24px',
            paddingRight: '24px',
            borderRadius: '999px',
            border: isCreateButtonHovered ? '1px solid #CBD5FF' : '1px solid #E0E7FF',
            background: isCreateButtonPressed ? '#E5ECFF' : (isCreateButtonHovered ? '#F3F6FF' : 'white'),
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: isCreateButtonPressed
              ? '0 2px 6px rgba(15,23,42,0.2)'
              : (isCreateButtonHovered ? '0 4px 12px rgba(15,23,42,0.12)' : 'none'),
            transform: isCreateButtonPressed ? 'scale(0.97)' : (isCreateButtonHovered ? 'scale(1.02)' : 'scale(1.00)'),
            transitionDuration: isCreateButtonPressed ? '120ms' : '150ms',
            transitionTimingFunction: isCreateButtonPressed ? 'ease-out' : (isCreateButtonHovered ? 'ease-out' : 'cubic-bezier(0.16,1,0.3,1)'),
          }}
        >
          <Plus
            className="w-4 h-4 transition-transform"
            style={{
              transform: isCreateButtonHovered ? 'rotate(90deg)' : 'rotate(0deg)',
              transitionDuration: '150ms',
              transitionTimingFunction: 'ease-out',
            }}
          />
          <span className="transition-transform" style={{
            transform: isCreateButtonHovered ? 'translateX(1px)' : 'translateX(0px)',
            transitionDuration: '150ms',
          }}>
            {t('createNewPlan', lang)}
          </span>
        </button>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#004DB6]" />
          {/* <p className="text-gray-500">{t('loadingSavedPlans', lang) || 'Loading your saved plans...'}</p> */}
        </Card>
      ) : plans.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">{t('noSavedPlans', lang)}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                onLoadPlan={onLoadPlan}
                onDelete={handleDeletePlan}
                lang={lang}
                currency={currency}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}