import React from 'react';
import { Card } from './ui/card.jsx';
import { Button } from './ui/button.jsx';

export function AllDaysView({ days, currency, onCurrencyToggle }) {
  const currencySymbol = currency === 'USD' ? '$' : '₫';

  const calculateDayTotal = (day) => {
    return day.destinations.reduce((total, dest) => {
      return total + dest.costs.reduce((sum, cost) => sum + (cost.amount || 0), 0);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return days.reduce((total, day) => total + calculateDayTotal(day), 0);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#004DB6]">All Days Overview</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onCurrencyToggle}
          >
            {currencySymbol === '$' ? '$ USD' : '₫ VND'}
          </Button>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {days.map((day) => {
            const dayTotal = calculateDayTotal(day);

            return (
              <div
                key={day.id}
                className="border rounded-lg p-4 bg-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900">Day {day.dayNumber}</h3>
                  <span className="text-[#004DB6]">
                    {currencySymbol}{dayTotal.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  {day.destinations.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No destinations</p>
                  ) : (
                    day.destinations.map((dest) => {
                      const destTotal = dest.costs.reduce((sum, cost) => sum + (cost.amount || 0), 0);

                      return (
                        <div
                          key={dest.id}
                          className="flex items-start justify-between text-sm bg-gray-50 rounded p-2"
                        >
                          <div className="flex-1">
                            <p className="text-gray-900">{dest.name}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {dest.costs.map((cost, idx) => (
                                <div key={cost.id}>
                                  {cost.detail && `${cost.detail}: `}
                                  {currencySymbol}{cost.amount.toLocaleString()}
                                  {idx < dest.costs.length - 1 && ', '}
                                </div>
                              ))}
                            </div>
                          </div>
                          <span className="text-gray-600 ml-2">
                            {currencySymbol}{destTotal.toLocaleString()}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Total */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between bg-[#DAF9D8] rounded-lg p-4">
            <span className="text-[#004DB6]">Grand Total ({days.length} days):</span>
            <span className="text-[#004DB6]">
              {currencySymbol}{calculateGrandTotal().toLocaleString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
