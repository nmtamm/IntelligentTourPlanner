import { Card } from './ui/card';
import { DayPlan } from '../types';
import { Button } from './ui/button';
import { parseAmount } from '../utils/parseAmount';
import { t } from '../utils/translations';

interface AllDaysViewProps {
  days: DayPlan[];
  onUpdate: (days: DayPlan[]) => void;
  currency: 'USD' | 'VND';
  onCurrencyToggle: () => void;
  language: 'EN' | 'VI';
}

export function AllDaysView({ days, currency, onCurrencyToggle, language }: AllDaysViewProps) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  const currencySymbol = currency === 'USD' ? 'USD' : 'VND';

  const calculateDayTotal = (day: DayPlan) => {
    let minTotal = 0, maxTotal = 0, isApprox = false;
    day.destinations.forEach(dest => {
      dest.costs.forEach(cost => {
        const parsed = parseAmount(cost.amount);
        minTotal += parsed.min;
        maxTotal += parsed.max;
        if (parsed.isApprox) isApprox = true;
      });
    });
    return { minTotal, maxTotal, isApprox };
  };

  const calculateGrandTotal = () => {
    let minTotal = 0, maxTotal = 0, isApprox = false;
    days.forEach(day => {
      const dayTotal = calculateDayTotal(day);
      minTotal += dayTotal.minTotal;
      maxTotal += dayTotal.maxTotal;
      if (dayTotal.isApprox) isApprox = true;
    });
    return { minTotal, maxTotal, isApprox };
  };

  const grandTotal = calculateGrandTotal();

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#004DB6]">{t('allDaysOverview', lang)}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onCurrencyToggle}
          >
            {currencySymbol === 'USD' ? 'USD' : 'VND'}
          </Button>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {days.map((day) => {
            const dayTotal = calculateDayTotal(day);

            return (
              <div key={day.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900">{t('day', lang)} {day.dayNumber}</h3>
                  <span className="text-[#004DB6]">
                    {dayTotal.isApprox
                      ? `${dayTotal.minTotal.toLocaleString()} - ${dayTotal.maxTotal.toLocaleString()}`
                      : dayTotal.minTotal.toLocaleString()}
                    {' '}{currencySymbol}
                  </span>
                </div>

                <div className="space-y-2">
                  {day.destinations.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">{t('noDestinationsYet', lang)}</p>
                  ) : (
                    day.destinations.map((dest) => {
                      // Calculate destination total using parseAmount
                      const destTotals = dest.costs.map(cost => parseAmount(cost.amount));
                      const minTotal = destTotals.reduce((sum, c) => sum + c.min, 0);
                      const maxTotal = destTotals.reduce((sum, c) => sum + c.max, 0);
                      const isApprox = destTotals.some(c => c.isApprox);

                      return (
                        <div
                          key={dest.id}
                          className="flex items-start justify-between text-sm bg-gray-50 rounded p-2"
                        >
                          <div className="flex-1">
                            <p className="text-gray-900">{dest.name}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {dest.costs.map((cost, idx) => {
                                const parsed = parseAmount(cost.amount);
                                return (
                                  <div key={cost.id}>
                                    {cost.detail && `${cost.detail}: `}
                                    {parsed.isApprox
                                      ? `${parsed.min.toLocaleString()} - ${parsed.max.toLocaleString()}`
                                      : parsed.min.toLocaleString()}
                                    {idx < dest.costs.length - 1 && ', '}
                                    {' '}{currencySymbol}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <span className="text-gray-600 ml-2">
                            {isApprox
                              ? `${minTotal.toLocaleString()} \u2013 ${maxTotal.toLocaleString()}`
                              : minTotal.toLocaleString()}
                            {' '}{currencySymbol}
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
            <span className="text-[#004DB6]">{t('tripTotal', lang)} ({days.length} {days.length === 1 ? t('day', lang) : t('days', lang)}):</span>
            <span className="text-[#004DB6]">
              {grandTotal.isApprox
                ? `${grandTotal.minTotal.toLocaleString()} - ${grandTotal.maxTotal.toLocaleString()}`
                : grandTotal.minTotal.toLocaleString()}
              {' '}{currencySymbol}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}