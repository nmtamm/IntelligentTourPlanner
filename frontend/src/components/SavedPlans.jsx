import React from 'react';

import { useState, useEffect } from 'react';
import { Card } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { ArrowLeft, Calendar, MapPin, DollarSign, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function SavedPlans({ currentUser, onBack, onLoadPlan, onCreateNew }) {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    loadPlans();
  }, [currentUser]);

  const loadPlans = () => {
    const savedPlans = JSON.parse(localStorage.getItem('tourPlans') || '[]');
    const userPlans = savedPlans.filter((p) => p.user === currentUser);
    setPlans(userPlans);
  };

  const deletePlan = (planId) => {
    const savedPlans = JSON.parse(localStorage.getItem('tourPlans') || '[]');
    const filteredPlans = savedPlans.filter((p) => p.id !== planId);
    localStorage.setItem('tourPlans', JSON.stringify(filteredPlans));
    loadPlans();
    toast.success('Plan deleted');
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

      {plans.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No saved plans yet. Create your first trip plan!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const totalDestinations = plan.days.reduce((sum, day) => sum + day.destinations.length, 0);
            const totalCost = plan.days.reduce((sum, day) =>
              sum + day.destinations.reduce((daySum, dest) =>
                daySum + dest.costs.reduce((costSum, cost) => costSum + (cost.amount || 0), 0)
                , 0)
              , 0);

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
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlan(plan.id);
                    }}
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
                    <DollarSign className="w-4 h-4" />
                    ${totalCost.toFixed(2)} total
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
